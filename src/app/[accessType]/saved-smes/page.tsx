'use client';

import { SearchForm } from '@/components/search-form';
import { CIcons } from '@/components/ui/CIcons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReusableTable } from '@/components/ui/table';
import { useInvestorSavedSMEs } from '@/hooks/useDirectories';
import Image from 'next/image';

// Example data

const SavedSMEDirectoryPage = () => {
  const { data: smes, isLoading } = useInvestorSavedSMEs();
  console.log({ smes });
  const columns = [
    {
      header: 'Name',
      accessor: (row: (typeof smes)[0]) => (
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
    { header: 'Industry', accessor: 'industry' },
    { header: 'Country', accessor: 'location' },
    { header: 'Readiness Score', accessor: 'readiness' },
    { header: 'Last Viewed', accessor: 'date' },

    {
      header: 'Action',
      accessor: (row: (typeof smes)[0]) => (
        <div className="flex flex-row gap-3">
          <CIcons.message />
          <CIcons.delete />
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            My Saved SMEs
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {smes?.items?.length}
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
        data={smes?.items ?? []}
        loading={isLoading}
        totalPages={Math.ceil(smes?.items?.length / 4)}
      />
    </div>
  );
};

export default SavedSMEDirectoryPage;
