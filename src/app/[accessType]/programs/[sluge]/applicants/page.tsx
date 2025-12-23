'use client';

import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import { SearchForm } from '@/components/search-form';
import Button from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReusableTable } from '@/components/ui/table';
import { useIndustries } from '@/hooks/useComplianceCatalogs';
import { GetProgramApplications, GetProgramById } from '@/hooks/usePrograms';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

type Props = {};

function page({}: Props) {
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const params = useParams();
  const { data: program } = GetProgramApplications(params.sluge as string);
  const { data: programDetails } = GetProgramById(params.sluge as string);
  const { data: industries = [] } = useIndustries();
  const router = useRouter();
  const applicants: any[] = program?.applications ?? [];

  const filteredApplicants = applicants.filter((applicant: any) => {
    const matchesSearch =
      !search ||
      applicant?.name?.toLowerCase().includes(search.toLowerCase()) ||
      applicant?.industry?.toLowerCase().includes(search.toLowerCase()) ||
      applicant?.location?.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry =
      industryFilter === 'all' ||
      applicant?.industry?.toLowerCase() === industryFilter.toLowerCase();
    return matchesSearch && matchesIndustry;
  });

  // console.log({ program });
  const columns = [
    {
      header: 'Name',
      accessor: (row: (typeof applicants)[0]) => (
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
          <span className="font-medium text-sm">
            {row.sme?.smeBusinessInfo?.businessName}
          </span>
        </div>
      ),
    },
    {
      header: 'Industry',
      accessor: (row: (typeof applicants)[0]) =>
        row.sme?.smeBusinessInfo?.industry,
    },
    {
      header: 'Country',
      accessor: (row: (typeof applicants)[0]) =>
        row.sme?.smeBusinessInfo?.countryOfOperation?.join(', '),
    },
    {
      header: 'Readiness Score',
      accessor: (row: (typeof applicants)[0]) => row.sme?.readinessPct ?? '-',
    },
    {
      header: 'Revenue',
      accessor: (row: (typeof applicants)[0]) => row.sme?.revenueTTM ?? '-',
    },
    {
      header: 'Team Size',
      accessor: (row: (typeof applicants)[0]) => row.sme?.teamSize ?? '-',
    },

    {
      header: 'Action',
      accessor: (row: (typeof applicants)[0]) => (
        <div className="flex flex-row gap-3">
          <Button
            onClick={() =>
              router.push(
                `/${params.accessType}/programs/${params.sluge}/applicants/${
                  row.smeId
                }?applicationId=${row.id}&status=${encodeURIComponent(
                  row.status
                )}`
              )
            }
            variant="tertiary"
            className="text-green"
          >
            View details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="inline-flex my-3 md:text-sm text-xs lg:text-base">
        <p>
          Program {'>'} {programDetails?.name} {'>'}
          {'  '}
        </p>
        <p className="font-medium text-green ">{'Applicants'}</p>
      </div>
      <DashboardCardLayout>
        <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
          <div className="flex items-center mb-8 gap-2">
            <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
              Program Applicants
              <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                {applicants.length}
              </span>
            </p>
          </div>
          <div className="flex gap-2 items-center w-full justify-end">
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
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
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearch(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
        <ReusableTable
          columns={columns}
          noDataCaption="No applicants found"
          noDataText="No Applicants found check back later, any new application added will be found here"
          data={filteredApplicants}
          totalPages={program?.pagination?.totalPages ?? 0}
        />
      </DashboardCardLayout>
    </div>
  );
}

export default page;
