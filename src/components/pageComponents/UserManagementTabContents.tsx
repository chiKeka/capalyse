import useDebounce from '@/hooks/useDebounce';
import { useUserDirectory } from '@/hooks/useDirectories';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useMemo, useState } from 'react';
import { SearchForm } from '../search-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { statusBadge } from '../ui/statusBar';
import { ReusableTable } from '../ui/table';
const typeMap = {
  SMEs: 'sme',
  Investors: 'investor',
  'Development Organization': 'development_org',
};
const UserManagementTabContents = ({ type }: { type: string | undefined }) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const mgtColumns = useMemo(
    () =>
      type === 'SMEs'
        ? columns
        : type === 'Investors'
        ? invColumns
        : devColumns,
    [type]
  );
  const { data, isLoading } = useUserDirectory({
    role: typeMap[type as keyof typeof typeMap],
    page,
    q: debouncedSearch || undefined,
  });

  if (!type) {
    return notFound();
  }
  // console.log({ data, type });
  return (
    <div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-1 items-center text-[#18181B]">
            <span>
              <span>{type}</span>
            </span>
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {data?.pagination?.total || 0}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="packaging">Packaging</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="agriculture">Agriculture</SelectItem>
              <SelectItem value="healthtech">HealthTech</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <SearchForm
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full sm:w-auto md:min-w-sm"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            />
          </div>
        </div>
      </div>
      <ReusableTable
        columns={mgtColumns}
        data={data?.profiles}
        loading={isLoading}
        totalPages={data?.pagination?.totalPages}
        page={page}
        setPage={(page) => {
          setPage(page);
        }}
      />
    </div>
  );
};

export default UserManagementTabContents;

const columns = [
  {
    header: 'Name',
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        {row?.smeBusinessInfo?.logo && (
          <img
            src={row.smeBusinessInfo.logo}
            alt={row.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <span className="font-medium text-sm">
          {row?.smeBusinessInfo?.businessName ?? '-'}
        </span>
      </div>
    ),
  },
  {
    header: 'Industry',
    accessor: (row: any) => row?.smeBusinessInfo?.industry ?? '-',
  },
  {
    header: 'Country',
    accessor: (row: any) => (
      <span>{row?.smeBusinessInfo?.countryOfOperation?.join(', ') ?? '-'}</span>
    ),
  },

  { header: 'Readiness Score', accessor: 'readinessPct' },
  { header: 'Revenue', accessor: 'totalRevenue' },
  { header: 'Team Size', accessor: 'teamSize' },
  {
    header: 'Action',
    accessor: (row: any) => (
      <Link
        href={`/admin/user-management/sme/${row.userId}`}
        className="text-green font-medium hover:underline"
      >
        View Profile
      </Link>
    ),
    className: 'text-green',
  },
];

const invColumns = [
  {
    header: 'Name',
    accessor: (row: any) =>
      `${row?.personalInfo?.firstName ?? '-'} ${
        row?.personalInfo?.lastName ?? ''
      }`,
  },
  {
    header: 'Company Name',
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        {row?.investorOrganizationInfo?.logo ? (
          <Image
            src={row?.investorOrganizationInfo?.logo}
            alt={row.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : null}
        <span className="font-medium text-sm">
          {row?.investorOrganizationInfo?.organizationName}
        </span>
      </div>
    ),
  },
  {
    header: 'Investor Type',
    accessor: (row: any) =>
      row?.investorInvestmentInfo?.investmentTypes?.join(', ') ?? '-',
  },
  {
    header: 'Target Regions',
    accessor: (row: any) =>
      row?.investorInvestmentInfo?.targetRegions?.join(', ') ?? '-',
  },
  {
    header: 'Target Industries',
    accessor: (row: any) =>
      row?.investorInvestmentInfo?.targetIndustries?.join(', ') ?? '-',
  },
  {
    header: 'Status',
    accessor: (row: any) => statusBadge(row.status),
  },
  {
    header: 'Action',
    accessor: (row: any) => (
      <Link
        href={`/admin/user-management/investor/${row.userId}`}
        className="text-green font-medium hover:underline"
      >
        View Profile
      </Link>
    ),
    className: 'text-green',
  },
];

const devColumns = [
  {
    header: 'Name',
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        {row?.devOrgInfo?.logo ? (
          <Image
            src={row?.devOrgInfo?.logo}
            alt={row.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : null}
        <span className="font-medium text-sm">
          {row?.devOrgInfo?.organizationName || '-'}
        </span>
      </div>
    ),
  },
  {
    header: 'Company Headquarters',
    accessor: (row: any) => row?.devOrgInfo?.countryHeadquarters ?? '-',
  },
  {
    header: 'Investment Focus',
    accessor: (row: any) => row?.devOrgInfo?.focusAreas?.join(', ') || '-',
  },
  {
    header: 'Target Regions',
    accessor: (row: any) =>
      row?.devOrgInfo?.operatingRegions?.join(', ') || '-',
  },
  {
    header: 'Verification Status',
    accessor: (row: any) => statusBadge(row?.devOrgInfo?.verificationStatus),
  },
  {
    header: 'Action',
    accessor: (row: any) => (
      <Link
        href={`/admin/user-management/dev/${row.userId}`}
        className="text-green font-medium hover:underline"
      >
        View Profile
      </Link>
    ),
    className: 'text-green',
  },
];
