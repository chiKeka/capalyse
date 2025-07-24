"use client";

import { SearchForm } from "@/components/search-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import { smes } from "@/lib/uitils/contentData";
import Image from "next/image";
import Link from "next/link";

const ProgramManagement = ({ type }: { type: string }) => {
  // const mgtColumns = useMemo(
  //   () => (type === "sme" ? columns : invColumns),
  //   [type]
  // );
  return (
    <div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            <span>
              <span className="capitalize">Programs</span>
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
        columns={columns}
        data={smes}
        totalPages={Math.ceil(smes.length / 4)}
      />
    </div>
  );
};

export default ProgramManagement;

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
  {
    header: "Status",
    accessor: (row: (typeof smes)[0]) => statusBadge(row.status),
  },
  { header: "Partner Organisation", accessor: "org" },
  { header: "Program Duration", accessor: "duration" },
  { header: "Total Applicants", accessor: "totalApplicants" },
  { header: "Assigned SMEs", accessor: "assignedSme" },

  {
    header: "Action",
    accessor: (row: (typeof smes)[0]) => (
      <Link
        href={`/admin/program-management/${row.id}`}
        className="text-green font-medium hover:underline"
      >
        View Profile
      </Link>
    ),
    className: "text-green",
  },
];

export const smes = [
  {
    id: 1,
    name: "Business Name",
    Status: true,
    avatar: "/images/humanAvater.svg",
    org: "UNDP Nigeria",
    duration: "Jan 4 - June 3 2022",
    totalApplicants: 12,
    assignedSme: 12,
  },
];
