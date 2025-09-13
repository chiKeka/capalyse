'use client';

import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import CategoryBreakdown from '@/components/sections/dashboardCards/categoryBreakdown';
import EmptyBox from '@/components/sections/dashboardCards/emptyBox';
import ReadinessScoreCard from '@/components/sections/dashboardCards/readinessScoreCard';
import { ReusableTable } from '@/components/ui/table';
import { Document, useDocument } from '@/hooks/useDocument';
import { useGetReadinessScore } from '@/hooks/useReadiness';
import { Download, File, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
type Props = {};

function page({}: Props) {
  const readinessScore = useGetReadinessScore();

  const { data: readinessData, isLoading, error } = readinessScore;
  const { useGetDocumentsByCategory, useDeleteDocument, useDownloadDocument } =
    useDocument();
  const { data: documents } = useGetDocumentsByCategory('assessment');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  // const deleteMutation = useDeleteDocument();
  const downloadMutation = useDownloadDocument();
  // const handleDelete = (id: string) => {
  //   setSelectedDocument(documents?.find((doc) => doc._id === id) || null);
  //   deleteMutation.mutate(id);
  // };
  const handleDownload = (id: string) => {
    setSelectedDocument(documents?.find((doc) => doc._id === id) || null);
    downloadMutation.mutate(id);
  };

  const columns = [
    {
      header: 'File name',
      accessor: (row: Document) => (
        <div className="flex items-center gap-2">
          <div className="items-center w-6 h-6  flex bg-[#F4FFFC] rounded-full">
            <File className="text-green w-5 h-5" />
          </div>

          <div>
            <div className="font-medium text-sm text-[#101828]">
              {row.originalName}
            </div>
            <div className="text-xs text-gray-400">{row.size}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Date uploaded',
      accessor: (row: Document) => format(row.uploadedAt, 'MMM dd, yyyy'),
    },
    // {
    //   header: 'Status',
    //   accessor: (row: Document) => (
    //     <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
    //       <div className="w-2 h-2 bg-[#22C55E]  rounded-full" /> {row.status}
    //     </span>
    //   ),
    // },
    {
      header: '',
      accessor: (row: Document) => (
        <div className="flex gap-4 items-end justify-end">
          {/* <button
            onClick={() => handleDelete(row._id)}
            disabled={
              selectedDocument?._id === row._id || deleteMutation.isPending
            }
            className="text-gray-400 hover:text-red-600"
          >
            {selectedDocument?._id === row._id && deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button> */}
          <button
            disabled={
              selectedDocument?._id === row._id || downloadMutation.isPending
            }
            onClick={() => handleDownload(row._id)}
            className="text-gray-400 hover:text-green-600"
          >
            {selectedDocument?._id === row._id && downloadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];
  // Get category breakdown from API data
  const getCategoryBreakdown = () => {
    if (!readinessData?.overallScore?.percentage) {
      return [
        {
          value: 0,
          label: 'Strong foundation in place',
          caption: 'Foundational',
        },
        {
          value: 0,
          label: 'Moderate financial stability',
          caption: 'Financial Health',
        },
        {
          value: 0,
          label: 'Significant gaps in compliance',
          caption: 'Compliance',
        },
      ];
    }

    const scores = readinessData?.categoryBreakdown?.map((item) => ({
      value: Math.round(item.percentage),
      label: getScoreLabel(item.percentage),
      caption: item.category,
    }));
    return scores;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent foundation in place';
    if (score >= 60) return 'Good progress made';
    if (score >= 40) return 'Moderate improvements needed';
    return 'Significant gaps identified';
  };

  const checklist = getCategoryBreakdown();

  return (
    <div className="w-full h-full gap-6 flex flex-col">
      <div className="flex lg:flex-row gap-4 flex-col lg:grid lg:grid-cols-[1fr_3fr]">
        <div className=" h-auto w-full ">
          <ReadinessScoreCard
            readinessData={readinessData}
            isLoading={isLoading}
            scoreValue={readinessData?.overallScore?.percentage ?? 0} // fallback value
            showAssessment={
              readinessData?.overallScore?.percentage
                ? readinessData?.overallScore?.percentage < 100
                : true
            }
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
      {readinessData?.recommendations && (
        <div className="mt-6">
          <DashboardCardLayout caption="Recommendations">
            <div className="my-8 space-y-4">
              {readinessData.recommendations.map((recommendation, index) => (
                <div
                  key={recommendation.id}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base">
                      {recommendation.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        recommendation.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : recommendation.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {recommendation.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {recommendation.description}
                  </p>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Potential Impact: +{recommendation.estimatedImpact}% score
                      increase
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Action Items:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {recommendation.actionItems.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCardLayout>
        </div>
      )}

      <DashboardCardLayout>
        <div className="myb-4">
          <div className=" flex justify-between items-center ">
            <div className="flex items-center gap-2">
              <p className="font-bold text-base flex gap-2 items-center text-[#18181B]">
                Documents
                <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                  {documents?.length}
                </span>
              </p>
            </div>
            {/* <Button variant="primary">
              Upload{' '}
              <img className="h-[20px] w-[20px]" src="/icons/upload.svg" />
            </Button> */}
          </div>
          {documents?.length && documents?.length > 0 ? (
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
