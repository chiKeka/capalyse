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
import { CIcons } from '@/components/ui/CIcons';

// Example data
const smes = [
  {
    id: 1,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Packaging",
    country: "Nigeria",
    readiness: "75%",
    date: "Jan 4, 2022",
  },
  {
    id: 2,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Retail",
    country: "Nigeria",
    readiness: "75%",
    date: "Jan 4, 2022",
  },
  {
    id: 3,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Agriculture",
    country: "Kenya",
    readiness: "75%",
    date: "Jan 4, 2022",
  },
  {
    id: 4,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "HealthTech",
    country: "Nigeria",
    readiness: "30%",
    date: "Jan 4, 2022",
  },
  {
    id: 5,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Retail",
    country: "Uganda",
    readiness: "20%",
    date: "Jan 4, 2022",
  },
  {
    id: 6,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Agriculture",
    country: "Nigeria",
    readiness: "10%",
    date: "Jan 4, 2022",
  },
  {
    id: 7,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "HealthTech",
    country: "Cameroon",
    readiness: "90%",
    date: "Jan 4, 2022",
  },
  {
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Retail",
    country: "Niger",
    readiness: "68%",
    date: "Jan 4, 2022",
  },
  {
    id: 8,
    name: "Business Name",
    avatar: "/images/humanAvater.svg",
    industry: "Agriculture",
    country: "Nigeria",
    readiness: "74%",
    date: "Jan 4, 2022",
  },
];

const columns = [
  {
    header: "Name",
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
  { header: "Industry", accessor: "industry" },
  { header: "Country", accessor: "country" },
  { header: "Readiness Score", accessor: "readiness" },
  { header: "Last Viewed", accessor: "date" },

  {
    header: "Action",
    accessor: (row: (typeof smes)[0]) => (
      <div className="flex flex-row gap-3">
        <CIcons.message />
        <CIcons.delete />
      </div>
    ),
  },
];

const SMEDirectoryPage = () => {
  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            My Saved SMEs
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
              <SelectItem value="all">Types</SelectItem>
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
