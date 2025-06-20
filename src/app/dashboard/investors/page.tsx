"use client";
import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import Image from "next/image";
type Props = {};

// Example data
const investors = [
  {
    name: "Investor A",
    avatar: "/images/humanAvater.svg",
    type: "Angel",
    focus: "Early-stage",
    status: "Connected",
    statusColor: "green",
  },
  {
    name: "Investor A",
    avatar: "/images/humanAvater.svg",
    type: "VC",
    focus: "Tech",
    status: "Shortlisted",
    statusColor: "yellow",
  },
  {
    name: "Investor A",
    avatar: "/images/humanAvater.svg",
    type: "Impact Fund",
    focus: "Agriculture",
    status: "Viewed",
    statusColor: "blue",
  },
  {
    name: "Investor A",
    avatar: "/images/humanAvater.svg",
    type: "Angel",
    focus: "Early-stage",
    status: "Connected",
    statusColor: "green",
  },
  {
    name: "Investor A",
    avatar: "/images/humanAvater.svg",
    type: "VC",
    focus: "Tech",
    status: "Shortlisted",
    statusColor: "yellow",
  },
  {
    name: "Investor A",
    avatar: "/images/humanAvater.svg",
    type: "Impact Fund",
    focus: "Agriculture",
    status: "Viewed",
    statusColor: "blue",
  },
];

// Table columns
const columns = [
  {
    header: "Name",
    accessor: (row: (typeof investors)[0]) => (
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
  { header: "Investor Type", accessor: "type" },
  { header: "Investment Focus", accessor: "focus" },
  {
    header: "Status",
    accessor: (row: (typeof investors)[0]) => statusBadge(row.status),
  },
  {
    header: "Action",
    accessor: () => (
      <a href="#" className="text-green font-medium hover:underline">
        View Profile
      </a>
    ),
    className: "text-green",
  },
];

function page({}: Props) {
  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Investor Matches
            <p className="px-2 py-0.5  text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {investors.length}
            </p>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="course">Courses</SelectItem>
              <SelectItem value="webinar">Webinars</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <SearchForm
              className="w-full sm:w-auto md:min-w-sm"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            />
          </div>
          <Button variant="primary">
            Message Investor
            <img className="w-[20px] h-[20px]" src={"/icons/message.svg"} />
          </Button>
        </div>
      </div>

      <ReusableTable columns={columns} data={investors} />
    </div>
  );
}

export default page;
