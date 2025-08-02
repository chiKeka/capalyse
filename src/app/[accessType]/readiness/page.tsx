"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
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

const documents: any[] = [
  // {
  //   name: "CAC Registration.pdf",
  //   size: "200 KB",
  //   date: "Jan 4, 2022",
  //   status: "Completed",
  // },
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
  const { data: readinessData, isLoading, error } = readinessScore;

  // Get category breakdown from API data
  const getCategoryBreakdown = () => {
    if (!readinessData?.data?.currentScore?.scores) {
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

    const scores = readinessData.data.currentScore.scores;
    return [
      {
        value: Math.round(scores.businessInfo),
        label: getScoreLabel(scores.businessInfo),
        caption: "Business Info",
      },
      {
        value: Math.round(scores.financial),
        label: getScoreLabel(scores.financial),
        caption: "Financial Health",
      },
      {
        value: Math.round(scores.operational),
        label: getScoreLabel(scores.operational),
        caption: "Operational",
      },
      {
        value: Math.round(scores.market),
        label: getScoreLabel(scores.market),
        caption: "Market",
      },
      {
        value: Math.round(scores.compliance),
        label: getScoreLabel(scores.compliance),
        caption: "Compliance",
      },
    ];
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent foundation in place";
    if (score >= 60) return "Good progress made";
    if (score >= 40) return "Moderate improvements needed";
    return "Significant gaps identified";
  };

  const checklist = getCategoryBreakdown();

  return (
    <div className="w-full h-full gap-6 flex flex-col">
      <div className="flex lg:flex-row gap-4 flex-col">
        <div className="lg:w-[25%] h-auto w-full ">
          <ReadinessScoreCard
            readinessData={readinessData?.data?.currentScore}
            isLoading={isLoading}
            scoreValue={0} // fallback value
          />
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

      {/* Recommendations Section */}
      {/* {readinessData?.data?.currentScore?.recommendations && (
        <div className="mt-6">
          <DashboardCardLayout caption="Recommendations">
            <div className="my-8 space-y-4">
              {readinessData.data.currentScore.recommendations.map((recommendation, index) => (
                <div key={recommendation._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base">{recommendation.title}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      recommendation.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : recommendation.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {recommendation.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{recommendation.description}</p>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Potential Impact: +{recommendation.impact}% score increase
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Action Items:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recommendation.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCardLayout>
        </div>
      )} */}

      <DashboardCardLayout>
        <div className="myb-4">
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
              Upload{" "}
              <img className="h-[20px] w-[20px]" src="/icons/upload.svg" />
            </Button>
          </div>
          {documents?.length > 0 ? (
            <ReusableTable columns={columns} data={documents} />
          ) : (
            <EmptyBox
              caption="No Documents Yet!"
              caption2="You have not uploaded any documents yet."
              showButton={false}
            />
          )}
        </div>
      </DashboardCardLayout>
    </div>
  );
}

export default page;
