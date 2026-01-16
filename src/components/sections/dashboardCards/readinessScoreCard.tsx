'use client';

import Button from '@/components/ui/Button';
import CircularScoreBar from '@/components/ui/CircularScoreBar';
import { useAllAssessmentQuestions } from '@/hooks/useAssessmentQuestions';
import { generateAssessmentQuestionsPDF } from '@/lib/generateAssessmentPDF';
import { ReadinessScoreResponse } from '@/lib/uitils/types';
import { Download } from 'lucide-react';
import { useState } from 'react';
import AssessmentReadiness from '../AssessmentReadiness';

type Props = {
  scoreValue?: number;
  readinessData?: ReadinessScoreResponse;
  isLoading?: boolean;
  showAssessment?: boolean;
  textContent?: string;
  extraContent?: React.ReactNode;
};

function ReadinessScoreCard({
  scoreValue,
  readinessData,
  isLoading,
  showAssessment,
  textContent = 'Readiness Score',
  extraContent,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { refetch: fetchQuestions } = useAllAssessmentQuestions();

  // Use readinessData overall score if available, otherwise fall back to scoreValue
  const displayScore =
    readinessData?.overallScore?.percentage ?? scoreValue ?? 0;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const { data } = await fetchQuestions();
      if (data) {
        generateAssessmentQuestionsPDF(data);
      }
    } catch (error) {
      console.error('Failed to download assessment questions:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="border-1 p-[3%] border-[#E8E8E8] flex flex-col rounded-md lg:min-w-[276px] w-full min-h-[356px]">
      <p className="font-bold text-base">{textContent}</p>

      <div className="flex flex-col h-full justify-center items-center flex-1">
        {extraContent || (
          <div className="w-full items-center justify-center flex">
            {isLoading ? (
              <div className="w-[180px] h-[180px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              </div>
            ) : (
              <CircularScoreBar
                value={displayScore}
                size={180}
                strokeWidth={10}
              />
            )}
          </div>
        )}

        {/* {readinessData && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Data Completeness: {Math.round(readinessData.dataCompleteness * 100)}%
            </p>
            <p className="text-xs text-gray-500">
              Last Updated: {new Date(readinessData.calculatedAt).toLocaleDateString()}
            </p>
          </div>
        )} */}

        {showAssessment && (
          <>
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 mt-auto">
              <Button variant="secondary" onClick={() => setOpen(true)}>
                Start Assessment
              </Button>
              <Button
                variant="tertiary"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 border border-[#E8E8E8]"
              >
                <Download size={16} />
                {isDownloading ? 'Downloading...' : 'Download Questions'}
              </Button>
            </div>
            <AssessmentReadiness isOpen={open} setIsOpen={setOpen} />
          </>
        )}
      </div>
    </div>
  );
}

export default ReadinessScoreCard;

