import { smes } from '@/lib/uitils/contentData';
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

const UserManagementTabContents = ({ type }: { type: string }) => {
  const mgtColumns = useMemo(
    () => (type === 'sme' ? columns : invColumns),
    [type]
  );
  return (
    <div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            <span>
              <span className="uppercase">{type}</span>s
            </span>
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {smes.length}
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
        data={smes}
        totalPages={Math.ceil(smes.length / 4)}
      />
    </div>
  );
};

export default UserManagementTabContents;
const columns = [
  {
    header: 'Name',
    accessor: (row: (typeof smes)[0]) => (
      <div className="flex items-center gap-2">
        <Image
          src={row.avatar}
          alt={row.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium text-sm">{row.name}</span>
      </div>
    ),
  },
  { header: 'Industry', accessor: 'industry' },
  { header: 'Country', accessor: 'country' },
  { header: 'Readiness Score', accessor: 'readiness' },
  { header: 'Revenue', accessor: 'revenue' },
  { header: 'Team Size', accessor: 'teamSize' },
  {
    header: 'Action',
    accessor: (row: (typeof smes)[0]) => (
      <Link
        href={`/investor/sme-directory/${row.id}`}
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
    accessor: (row: (typeof smes)[0]) => (
      <div className="flex items-center gap-2">
        <Image
          src={row.avatar}
          alt={row.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium text-sm">{row.name}</span>
      </div>
    ),
  },
  { header: 'Investor Type', accessor: 'type' },
  { header: 'Investment Focus', accessor: 'focus' },
  {
    header: 'Status',
    accessor: (row: (typeof smes)[0]) => statusBadge(row.status),
  },
  {
    header: 'Action',
    accessor: (row: (typeof smes)[0]) => (
      <Link
        href={`/investor/sme-directory/${row.id}`}
        className="text-green font-medium hover:underline"
      >
        View Profile
      </Link>
    ),
    className: 'text-green',
  },
];
