'use client';

import { smeApplicantsColumns } from '@/components/ProgramComponents/pageContent';
import { SearchForm } from '@/components/search-form';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statusBadge } from '@/components/ui/statusBar';
import { ReusableTable } from '@/components/ui/table';
import { useGetAdminProgramApplications } from '@/hooks/useAdmin';
import { useIndustries } from '@/hooks/useComplianceCatalogs';
import { GetProgramById } from '@/hooks/usePrograms';
import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

type Props = {};

const page = (props: Props) => {
  const [page, setPage] = useState(1);
  const params = useParams();
  const { data: program, isLoading: isProgramLoading } = GetProgramById(
    params?.id as string
  );
  const { data: applicants, isLoading: isApplicantsLoading } =
    useGetAdminProgramApplications(params?.id as string);
  
  const { data: industries = [] } = useIndustries();

  // console.log({ applicants, program });

  if (isProgramLoading || isApplicantsLoading)
    return <Loader2Icon className="animate-spin w-12 h-12" />;

  return (
    <div>
      <p className="font-medium">
        User Management &gt;{' '}
        <Link href={`/admin/program-management`} className="text-green">
          Program Details
        </Link>
      </p>
      <Card className="flex items-center gap-5 p-8 my-2 shadow-none justify-between">
        <div className="flex flex-col gap-0">
          <span className="text-2xl font-bold text-black">{program?.name}</span>
          <span className="text-gray-500 text-sm">
            {program?.organization?.organizationName ??
              program?.partners
                ?.map((partner: any) => partner.name)
                .join(', ')}{' '}
            {statusBadge(program?.status)}
          </span>
        </div>
        <div className="space-x-3">
          <Button
            className="!border-error-300 !text-error-300"
            variant="secondary"
            size="small"
          >
            Close Program
          </Button>
          <Button size="small">Message Organization</Button>
        </div>
      </Card>
      <Card className="p-6 mt-6">
        {/* Filter Section */}
        <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
          <div className="flex items-center mb-8 gap-2">
            <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
              SME Applicants
              <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                {program?.applications?.total}
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
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
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
          columns={smeApplicantsColumns}
          data={applicants?.applications}
          totalPages={applicants?.pagination?.totalPages}
          page={page}
          setPage={(page) => {
            setPage(page);
          }}
        />
      </Card>
    </div>
  );
};

export default page;
