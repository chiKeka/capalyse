'use client';

import { programColumns } from '@/components/ProgramComponents/pageContent';
import { SearchForm } from '@/components/search-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReusableTable } from '@/components/ui/table';
import { GetPrograms } from '@/hooks/usePrograms';
import { useState } from 'react';

const ProgramManagement = () => {
  // const { type } = await params;
  const [page, setPage] = useState(1);
  const { data } = GetPrograms({ page: page, limit: 20 });
  console.log({ data });

  return (
    <div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            <span>
              <span className="capitalize">Programs</span>
            </span>
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {data?.pagination?.total}
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
        columns={programColumns}
        data={data?.programs}
        totalPages={data?.pagination?.totalPages}
        page={page}
        setPage={(page) => {
          setPage(page);
        }}
      />
    </div>
  );
};

export default ProgramManagement;
