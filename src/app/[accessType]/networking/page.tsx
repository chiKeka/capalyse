"use client";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import { useNetworking } from "@/hooks/networking";
import Image from "next/image";

// Example data

// Table columns
const columns = [
  {
    header: "Name",
    accessor: (row: any) => (
      <div className="flex items-center gap-2">
        <Image
          src={row?.avatar}
          alt={row?.name}
          width={24}
          height={24}
          className="rounded-full"
        />
        <span className="font-medium text-sm">{row?.businessName}</span>
      </div>
    ),
  },
  { header: "Industry", accessor: "industry" },
  { header: "Business Type", accessor: "businessType" },
  { header: "Service Offered", accessor: "serviceOffered" },
  {
    header: "Status",
    accessor: (row: any) => statusBadge(row?.status),
  },
  {
    header: "Action",
    accessor: () => (
      <div className="flex gap-2">
        <a href="#" className="text-green font-medium hover:underline">
          View Profile
        </a>
      </div>
    ),
  },
];

function NetworkingPage() {
  const { data } = useNetworking();
  const networking = data?.data;

  console.log(networking);
  return (
    <div>
      {/* Filter Section */}
      <div className="flex items-center my-8 justify-between">
        <div className="flex items-center mb-8 gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Connections
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {networking?.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full justify-end">
          <Button variant="secondary">
            Filter <CIcons.filter />
          </Button>
          <Button variant="primary">
            Message Business
            <img className="w-[20px] h-[20px]" src={"/icons/message.svg"} />
          </Button>
        </div>
      </div>

      <ReusableTable columns={columns} data={networking} />
    </div>
  );
}

export default NetworkingPage;
