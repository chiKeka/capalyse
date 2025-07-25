import Image from 'next/image';
import Link from 'next/link';
import { ReusableTable } from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SearchForm } from '../search-form';
import { useMemo } from 'react';
import { statusBadge } from '../ui/statusBar';
import { useInvestorDirectory, useSmeDirectory } from '@/hooks/useDirectories';
import { notFound } from 'next/navigation';

const UserManagementTabContents = ({ type }: { type: string | undefined }) => {
  const mgtColumns = useMemo(
    () => (type === 'SMEs' ? columns : invColumns),
    [type]
  );
  const { data: smesd, isLoading } = useSmeDirectory(type === 'SMEs');
  const { data: investors, isLoading: isLoadingInvestors } =
    useInvestorDirectory(type === 'Investors');
  const data = useMemo(() => {
    const loading = isLoading || isLoadingInvestors;
    if (loading) {
      return null;
    }
    if (type === 'SMEs') {
      return smesd;
    }
    if (type === 'Investors') {
      return investors;
    }
    return null;
  }, [type, smesd, investors, isLoading, isLoadingInvestors]);

  const loading = useMemo(() => {
    return type === 'SMEs' ? isLoading : isLoadingInvestors;
  }, [isLoading, isLoadingInvestors, type]);

  if (!type) {
    return notFound();
  }
  console.log({ object: smesd?.data });
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
              className="w-full sm:w-auto md:min-w-sm"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            />
          </div>
        </div>
      </div>
      <ReusableTable
        columns={mgtColumns}
        data={data?.data}
        loading={loading}
        totalPages={Math.ceil(data?.pagination?.total / 4)}
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
        {row?.avatar && (
          <Image
            src={row.avatar}
            alt={row.businessName}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <span className="font-medium text-sm">{row.businessName}</span>
      </div>
    ),
  },
  { header: 'Industry', accessor: 'industry' },
  {
    header: 'Country',
    accessor: (row: any) => <span>{row?.countryOfOperation?.join(', ')}</span>,
  },
  { header: 'Readiness Score', accessor: 'readinessScore' },
  { header: 'Revenue', accessor: 'revenue' },
  {
    header: 'Team Size',
    accessor: (row: any) => <span>{row?.teamMembers?.length}</span>,
  },
  {
    header: 'Action',
    accessor: (row: any) => (
      <Link
        href={`/admin/user-management/sme/${row._id}`}
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
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        {row.avatar ? (
          <Image
            src={row.avatar}
            alt={row.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : null}
        <span className="font-medium text-sm">{row.name}</span>
      </div>
    ),
  },
  { header: 'Investor Type', accessor: 'type' },
  { header: 'Investment Focus', accessor: 'focus' },
  {
    header: 'Status',
    accessor: (row: any) => statusBadge(row.status),
  },
  {
    header: 'Action',
    accessor: (row: any) => (
      <Link
        href={`/admin/user-management/investor/${row._id}`}
        className="text-green font-medium hover:underline"
      >
        View Profile
      </Link>
    ),
    className: 'text-green',
  },
];
