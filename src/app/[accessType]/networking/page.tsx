"use client";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { NetworkProfileSheet } from "@/components/ui/profileSheet";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import { useSmeDirectory } from "@/hooks/useDirectories";
import Image from "next/image";
import { useState } from "react";
interface NetworkingProfile {
  _id: string;
  logo: string;
  name: string;
  businessName: string;
  industry: string;
  businessStage: string;
  serviceOffered: string;
  status: string;
}

function NetworkingPage() {
  const { data } = useSmeDirectory();
  const networking = data?.items;
  const [selectedProfile, setSelectedProfile] =
    useState<NetworkingProfile | null>(null);

  const handleViewProfile = (profile: NetworkingProfile) => {
    console.log(profile);
    setSelectedProfile(profile);
  };
  console.log({ networking });
  const handleCloseSheet = () => {
    setSelectedProfile(null);
  };
  const columns = [
    {
      header: "Name",
      accessor: (row: NetworkingProfile) => (
        <div className="flex items-center gap-2">
          <Image
            src={row?.logo ? row?.logo : ""}
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
    { header: "Business Type", accessor: "businessStage" },
    { header: "Service Offered", accessor: "serviceOffered" },
    {
      header: "Status",
      accessor: (row: NetworkingProfile) => statusBadge(row?.status),
    },
    {
      header: "Action",
      accessor: (row: NetworkingProfile) => (
        <div className="flex gap-2">
          <Button
            variant="tertiary"
            onClick={() => handleViewProfile(row)}
            className="text-green font-medium hover:underline"
          >
            View Profile
          </Button>
        </div>
      ),
    },
  ];
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
      <NetworkProfileSheet
        id={selectedProfile?._id}
        onOpenChange={(open) => !open && handleCloseSheet()}
        data={selectedProfile}
        open={!!selectedProfile}
      />
    </div>
  );
}

export default NetworkingPage;
