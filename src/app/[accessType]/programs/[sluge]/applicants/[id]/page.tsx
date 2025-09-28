"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import FinanceView from "@/components/pageComponents/FinanceView";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import IconCards from "@/components/sections/dashboardCards/iconCards";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import { useGetSmeById } from "@/hooks/useDirectories";
import { GetProgramById, reviewApplication } from "@/hooks/usePrograms";

import { useGetReadinessScore } from "@/hooks/useReadiness";
import { File } from "lucide-react";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

type Props = {};

const documents = [
  {
    id: "1",
    name: "CAC Registration.pdf",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
  {
    id: "2",
    name: "Pitch Deck.pptx",
    size: "200 KB",
    date: "Jan 4, 2022",
    status: "Completed",
  },
  {
    id: "3",
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

export default function SMEDirectoryPage({}: Props) {
  // Fetch readiness score data for the SME
  const { data: readinessData, isLoading: isReadinessLoading } =
    useGetReadinessScore();

  const [activeTab, setActiveTab] = React.useState<"overview" | "financial">(
    "overview"
  );

  const [open, setOpen] = React.useState(false);
  const [selectedDoc, setSelectedDoc] = React.useState<
    (typeof documents)[0] | null
  >(null);

  function handleViewDocument(doc: (typeof documents)[0]) {
    setSelectedDoc(doc);
    setOpen(true);
  }
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id;
  const applicationId = searchParams.get("applicationId");
  const { data: programDetails } = GetProgramById(params.sluge as string);
  const { data: smeData, isLoading: isSmeLoading } = useGetSmeById(
    id as string
  );

  const { mutateAsync: reviewApplicationMutation } = reviewApplication(
    params.sluge as string,
    applicationId as string
  );
  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Revenue",
      amount: smeData?.totalRevenue || 0,
      currency: "NGN",
      percentage: 152000,
      direction: "up",
    },
    {
      id: 2,
      icon: CIcons.profile2,
      label: "Team Size",
      amount: smeData?.teamSize || 0,
    },
  ];

  const getCategoryBreakdown = () => {
    if (!smeData?.readiness?.categoryScores) {
      return [
        {
          value: 0,
          label: "Strong foundation in place",
          caption: "Foundational",
        },
        {
          value: 0,
          label: "Moderate financial stability",
          caption: "Financial Health",
        },
        {
          value: 0,
          label: "Significant gaps in compliance",
          caption: "Compliance",
        },
      ];
    }

    const scores = smeData?.readiness?.categoryScores?.map((item: any) => ({
      value: Math.round(item.percentage),
      label: getScoreLabel(item.percentage),
      caption: item.category,
    }));
    return scores;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent foundation in place";
    if (score >= 60) return "Good progress made";
    if (score >= 40) return "Moderate improvements needed";
    return "Significant gaps identified";
  };

  const checklist = getCategoryBreakdown();
  const img = `${process.env.NEXT_PUBLIC_API_URL}/documents/${selectedDoc?.id}/download`;
  const handleReviewApplication = (
    action: "accept" | "reject" | "start" | "waitlist"
  ) => {
    reviewApplicationMutation(
      { action, rejectionReason: "", reviewNotes: "" },
      {
        onSuccess: () => {
          toast.success("Application reviewed successfully");
        },
        onError: (error) => {
          toast.error(error.message);
        },
      }
    );
  };
  return (
    <div className="w-full h-full gap-6 flex flex-col">
      <div className="flex items-center justify-between">
        {/* breadcrumb */}
        <div className="inline-flex my-3 md:text-sm text-xs lg:text-base">
          Programs {"> "} {programDetails?.name} {"> "} Applicants {"> "}{" "}
          <p className="text-green">Applicants Details</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="danger"
            onClick={() => handleReviewApplication("reject")}
          >
            Reject
          </Button>
          <Button
            variant="primary"
            onClick={() => handleReviewApplication("accept")}
          >
            Approve
          </Button>
        </div>
      </div>
      {/* Business Profile Header */}
      {activeTab === "overview" ? (
        <>
          <Card className="flex items-center gap-5 p-8 mb-2 shadow-none justify-between">
            <div className="flex items-center gap-5">
              <Image
                src={businessProfile.logo}
                alt="logo"
                width={80}
                height={80}
                className="rounded-full"
              />
              <div className="flex flex-col gap-0">
                <span className="text-2xl font-bold text-black">
                  {smeData?.businessName ?? smeData?.name}
                </span>
                <span className="text-gray-500 text-sm">
                  {businessProfile.industry} <span className="mx-2">•</span>{" "}
                  {smeData?.countryOfOperation?.join(", ") ||
                    smeData?.location ||
                    "Not specified"}
                </span>
                <div className="mt-2">
                  {statusBadge(businessProfile.status)}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="ghost"
                iconPosition="right"
                className="text-green !px-0"
                onClick={() => setActiveTab("financial")}
              >
                View Financial Dashboard
              </Button>
            </div>
          </Card>
          <div className="flex lg:grid lg:grid-cols-[1fr_1fr_2fr] gap-4 flex-col">
            <div className=" h-auto w-full flex flex-col gap-6 flex-1 justify-between">
              {overviewCards.map((card) => (
                <IconCards {...card} key={card?.id} />
              ))}
            </div>

            <ReadinessScoreCard
              // readinessData={smeData?.readiness?.categoryScores}
              isLoading={isReadinessLoading}
              scoreValue={smeData?.readiness?.overallScore} // fallback value
            />

            <div className=" h-auto w-full">
              <DashboardCardLayout height="h-full" caption="Category Breakdown">
                <div className="my-8 h-full ">
                  {checklist.map((item: any, i: any) => {
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
                    {smeData?.documents?.length}
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
                            {selectedDoc && (
                              <>
                                {img && (
                                  <img
                                    src={img}
                                    alt="Certificate Preview"
                                    width={600}
                                    height={400}
                                    className="rounded-lg object-contain"
                                  />
                                )}
                                <a
                                  href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${selectedDoc?.id}/download`}
                                  download
                                  className="mt-4"
                                >
                                  <Button variant="primary">Download</Button>
                                </a>
                              </>
                            )}
                          </DialogContent>
                        </Dialog>
                      ),
                    }
                  : col
              )}
              data={smeData?.documents || []}
            />
          </DashboardCardLayout>
        </>
      ) : (
        <FinanceView isSme={false} />
      )}
    </div>
  );
}
