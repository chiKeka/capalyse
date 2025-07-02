'use client';

import Image from 'next/image';
import { ReusableTable } from '@/components/ui/table';
import { SearchForm } from '@/components/search-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

// Example data
const smes = [
  {
    id: 1,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'Packaging',
    country: 'Nigeria',
    readiness: '75%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    id: 2,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'Retail',
    country: 'Nigeria',
    readiness: '75%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    id: 3,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'Agriculture',
    country: 'Kenya',
    readiness: '75%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    id: 4,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'HealthTech',
    country: 'Nigeria',
    readiness: '30%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    id: 5,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'Retail',
    country: 'Uganda',
    readiness: '20%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    id: 6,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'Agriculture',
    country: 'Nigeria',
    readiness: '10%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    id: 7,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'HealthTech',
    country: 'Cameroon',
    readiness: '90%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'Retail',
    country: 'Niger',
    readiness: '68%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
  {
    id: 8,
    name: 'Business Name',
    avatar: '/images/humanAvater.svg',
    industry: 'Agriculture',
    country: 'Nigeria',
    readiness: '74%',
    revenue: '₦100,000.00',
    teamSize: 10,
  },
];

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

const SMEDirectoryPage = () => {
  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Investment Ready Businesses
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
        columns={columns}
        data={smes}
        totalPages={Math.ceil(smes.length / 4)}
      />
    </div>
  );
};

export default SMEDirectoryPage;
