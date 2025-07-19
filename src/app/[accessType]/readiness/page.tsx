"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import Button from "@/components/ui/Button";
import { ReusableTable } from "@/components/ui/table";
import {
  useGetReadinessScore,
  useGetScoreAnalytics,
  useGetScoreHistory,
  useGetScoreInsight,
} from "@/hooks/useReadiness";
import { File, Pen, Trash2 } from "lucide-react";
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
        <button className="text-gray-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
        <button className="text-gray-400 hover:text-green-600">
          <Pen className="w-4 h-4" />
        </button>
      </div>
    ),
    className: "text-right",
  },
];
function page({}: Props) {
  const readinessScore = useGetReadinessScore();
  const analytics = useGetScoreAnalytics();
  const scoreHistory = useGetScoreHistory();
  const scoreInsight = useGetScoreInsight();
  const { data: score, isLoading, error } = readinessScore;

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
      <div className="flex lg:flex-row gap-4 flex-col">
        <div className="lg:w-[25%] h-auto w-full ">
          <ReadinessScoreCard scoreValue={70} />
        </div>

        <div className="flex-1 h-full">
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
          <Button variant="primary">
            Upload <img className="h-[20px] w-[20px]" src="/icons/upload.svg" />
          </Button>
        </div>
        <ReusableTable columns={columns} data={documents} />
      </DashboardCardLayout>
    </div>
  );
}

export default page;
