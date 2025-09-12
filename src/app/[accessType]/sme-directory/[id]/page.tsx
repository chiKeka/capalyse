"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import IconCards from "@/components/sections/dashboardCards/iconCards";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import { useGetSmeById } from "@/hooks/useDirectories";

import { useGetReadinessScore } from "@/hooks/useReadiness";
import { ChevronRight, File } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React from "react";

type Props = {};

const documents = [
  {
    name: "CAC Registration.pdf",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
  {
    name: "Pitch Deck.pptx",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
  {
    name: "Financial Statement.pdf",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
];

const columns = [
  {
    header: "File name",
    accessor: (row: (typeof documents)[0]) => (
      <div className="flex items-center gap-2">
        <div className="items-center w-6 h-6  flex bg-[#F4FFFC] rounded-full">
          <File className="text-green w-5 h-5" />
        </div>

        <div>
          <div className="font-medium text-sm text-[#101828]">{row.name}</div>
          <div className="text-xs text-gray-400">{row.size}</div>
        </div>
      </div>
    ),
  },
  { header: "Date uploaded", accessor: "date" },
  {
    header: "Status",
    accessor: (row: (typeof documents)[0]) => (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
        <div className="w-2 h-2 bg-[#22C55E]  rounded-full" /> {row.status}
      </span>
    ),
  },
  {
    header: "",
    accessor: () => (
      <div className="flex gap-4 items-end justify-end">
        <button className="text-success-100 font-medium border-none">
          View Document
        </button>
      </div>
    ),
    className: "text-right",
  },
];

const businessProfile = {
  name: "GreenPack Solutions Ltd",
  logo: "/icons/sportify.svg",
  industry: "Packaging",
  country: "Nigeria",
  status: "Connected",
};

const certificateImage = "/images/certificate-sample.png"; // Use your actual certificate image path

export default function SMEDirectoryPage({}: Props) {
  // Fetch readiness score data for the SME
  const { data: readinessData, isLoading: isReadinessLoading } =
    useGetReadinessScore();

  const [open, setOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<
    (typeof documents)[0] | null
  >(null);

  function handleViewDocument(doc: (typeof documents)[0]) {
    setSelectedDoc(doc);
    setOpen(true);
  }
  const { id } = useParams();

  const { data: smeData, isLoading: isSmeLoading } = useGetSmeById(
    id as string
  );
  console.log({ smeData });
  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Revenue",
      amount: 0,
      currency: "NGN",
      percentage: 152000,
      direction: "up",
    },
    {
      id: 2,
      icon: CIcons.profile2,
      label: "Team Size",
      amount: smeData?.teamMembers?.length || 0,
    },
  ];
  const checklist = [
    {
      value: 80,
      label: "Strong foundation in place",
      caption: "Foundational",
    },
    {
      value: 60,
      label: "Moderate financial stability",
      caption: "Financial Health",
    },
    {
      value: 45,
      label: "Significant gaps in compliance",
      caption: "Compliance",
    },
  ];
  return (
    <div className="w-full h-full gap-6 flex flex-col">
      <div>
        {/* breadcrumb */}
        <Breadcrumb className="font-medium">
          <BreadcrumbItem>
            <BreadcrumbLink href="/investor/sme-directory">
              Investment Ready Business
            </BreadcrumbLink>
            <ChevronRight className="w-4 h-4" />
            <BreadcrumbLink className="text-green">
              Business Profile
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
      {/* Business Profile Header */}
      <Card className="flex items-center gap-5 p-8 mb-2 shadow-none">
        <Image
          src={businessProfile.logo}
          alt="logo"
          width={80}
          height={80}
          className="rounded-full"
        />
        <div className="flex flex-col gap-0">
          <span className="text-2xl font-bold text-black">
            {smeData?.businessName}
          </span>
          <span className="text-gray-500 text-sm">
            {businessProfile.industry} <span className="mx-2">•</span>{" "}
            {smeData?.countryOfOperation?.join(", ") || "Not specified"}
          </span>
          <div className="mt-2">{statusBadge(businessProfile.status)}</div>
        </div>
      </Card>
      <div className="flex lg:grid lg:grid-cols-[1fr_1fr_2fr] gap-4 flex-col">
        <div className=" h-auto w-full flex flex-col gap-6 flex-1 justify-between">
          {overviewCards.map((card) => (
            <IconCards {...card} key={card?.id} />
          ))}
        </div>
        <div className=" h-auto w-full ">
          <ReadinessScoreCard
            // readinessData={smeData?.readinessScore}
            isLoading={isReadinessLoading}
            scoreValue={smeData?.readinessScore} // fallback value
          />
        </div>

        <div className=" h-auto w-full">
          <DashboardCardLayout height="h-full" caption="Category Breakdown">
            <div className="my-8 h-full ">
              {checklist.map((item, i) => {
                return (
                  <CategoryBreakdown
                    caption={item.caption}
                    label={item.label}
                    value={item.value}
                    key={i}
                  />
                );
              })}
            </div>
          </DashboardCardLayout>
        </div>
      </div>
      <DashboardCardLayout>
        <div className=" flex justify-between items-center ">
          <div className="flex items-center gap-2">
            <p className="font-bold text-base flex gap-2 items-center text-[#18181B]">
              Documents
              <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                {documents.length}
              </span>
            </p>
          </div>
        </div>
        <ReusableTable
          columns={columns.map((col) =>
            col.header === ""
              ? {
                  ...col,
                  accessor: (row: (typeof documents)[0]) => (
                    <Dialog
                      open={open && selectedDoc?.name === row.name}
                      onOpenChange={setOpen}
                    >
                      <div className="flex justify-end">
                        <DialogTrigger asChild>
                          <button
                            className="text-success-100 font-medium hover:underline ml-auto"
                            onClick={() => handleViewDocument(row)}
                          >
                            View Document
                          </button>
                        </DialogTrigger>
                      </div>
                      <DialogContent className="max-w-2xl flex flex-col items-center">
                        <Image
                          src={certificateImage}
                          alt="Certificate Preview"
                          width={600}
                          height={400}
                          className="rounded-lg object-contain"
                        />
                        <a href={certificateImage} download className="mt-4">
                          <Button variant="primary">Download</Button>
                        </a>
                      </DialogContent>
                    </Dialog>
                  ),
                }
              : col
          )}
          data={documents}
        />
      </DashboardCardLayout>
    </div>
  );
}
