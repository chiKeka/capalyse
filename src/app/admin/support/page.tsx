"use client";

import { SearchForm } from "@/components/search-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/ui/table";
import { useGetSupport } from "@/hooks/useSupport";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { classNames } from "@/lib/uitils";

const statusMap = {
  open: "not treated",
  closed: "Unresolved",
  resolved: "Resolved",
  in_progress: "Pending",
};

// Support/Disputes table columns
const supportColumns = [
  {
    header: "Reason for Dispute",
    accessor: (row: any) => row?.subject,
    className: "font-medium",
  },
  {
    header: "Ticket No",
    accessor: (row: any) => row?.ticketNumber || `SP-${row?.id}`,
  },
  {
    header: "Reporter",
    accessor: (row: any) => row?.reporter?.name || row?.user?.name || "James Ifeanyi",
  },
  {
    header: "Email",
    accessor: (row: any) => row?.reporter?.email || row?.user?.email || "jamesifeanyi@gmail.com",
  },
  {
    header: "Date",
    accessor: (row: any) =>
      row?.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy") : "Jan 4, 2022",
  },
  {
    header: "Status",
    accessor: (row: any) => {
      const status = row?.status || "Processing";
      const statusColors = {
        in_progress: "bg-yellow-500",
        open: "bg-red-500",
        resolved: "bg-green-500",
        Pending: "bg-yellow-500",
        Active: "bg-green-500",
        Closed: "bg-gray-500",
      };

      return (
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              statusColors[status as keyof typeof statusColors] || "bg-gray-500"
            }`}
          ></div>
          <span className={classNames("text-sm capitalize")}>
            {statusMap[status as keyof typeof statusMap]?.toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    header: "Action",
    accessor: (row: any) => (
      <Link href={`/admin/support/${row.id}`} className="text-green font-medium hover:underline">
        View details
      </Link>
    ),
    className: "text-green-600",
  },
];

type Props = {};

function Page({}: Props) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const { data: supportData, isLoading } = useGetSupport();
  // console.log({ supportData });

  // Filter data based on status and search
  const filteredData =
    supportData?.tickets?.filter((ticket: any) => {
      const matchesStatus =
        statusFilter === "all" || ticket?.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch =
        !search ||
        ticket?.subject?.toLowerCase().includes(search.toLowerCase()) ||
        ticket?.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
        ticket?.reporter?.name?.toLowerCase().includes(search.toLowerCase()) ||
        ticket?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        ticket?.reporter?.email?.toLowerCase().includes(search.toLowerCase()) ||
        ticket?.user?.email?.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    }) || [];

  return (
    <div>
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            <span>
              <span className="capitalize">Disputes</span>
            </span>
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {supportData?.pagination?.total || filteredData.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="open">Unresolved</SelectItem>
              <SelectItem value="closed">Resolved</SelectItem>
              <SelectItem value="in_progress">Pending</SelectItem>
              {/* <SelectItem value="closed">Closed</SelectItem> */}
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
        columns={supportColumns}
        data={filteredData}
        totalPages={supportData?.pagination?.pages}
        page={page}
        setPage={(page) => {
          setPage(page);
        }}
        loading={isLoading}
        noDataText="No disputes found. Check back later for any new disputes."
        noDataCaption="No disputes found"
      />
    </div>
  );
}

export default Page;
