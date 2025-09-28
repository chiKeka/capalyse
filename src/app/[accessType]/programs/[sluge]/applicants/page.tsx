"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/ui/table";
import { GetProgramApplications, GetProgramById } from "@/hooks/usePrograms";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

type Props = {};

function page({}: Props) {
  const params = useParams();
  const { data: program } = GetProgramApplications(params.sluge as string);
  const { data: programDetails } = GetProgramById(params.sluge as string);
  const router = useRouter();
  const applicants: any[] = program?.applications ?? [];

  console.log({ program });
  const columns = [
    {
      header: "Name",
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
          <span className="font-medium text-sm">{row.sme?.smeBusinessInfo?.businessName}</span>
        </div>
      ),
    },
    {
      header: "Industry",
      accessor: (row: (typeof applicants)[0]) =>
        row.sme?.smeBusinessInfo?.industry,
    },
    {
      header: "Country",
      accessor: (row: (typeof applicants)[0]) =>
        row.sme?.smeBusinessInfo?.countryOfOperation?.join(", "),
    },
    {
      header: "Readiness Score",
      accessor: (row: (typeof applicants)[0]) =>
        row.sme?.readiness?.readinessScore,
    },
    {
      header: "Revenue",
      accessor: (row: (typeof applicants)[0]) =>
        row.sme?.smeBusinessInfo?.revenue,
    },
    {
      header: "Team Size",
      accessor: (row: (typeof applicants)[0]) =>
        row.sme?.smeBusinessInfo?.teamSize,
    },

    {
      header: "Action",
      accessor: (row: (typeof applicants)[0]) => (
        <div className="flex flex-row gap-3">
          <Button
            onClick={() =>
              router.push(
                `/${params.accessType}/programs/${params.sluge}/applicants/${row.smeId}?applicationId=${row.id}`
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
          Program {">"} {programDetails?.name} {">"}
          {"  "}
        </p>
        <p className="font-medium text-green ">{"Applicants"}</p>
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
          data={applicants}
          totalPages={Math.ceil(applicants.length / 4)}
        />
      </DashboardCardLayout>
    </div>
  );
}

export default page;
