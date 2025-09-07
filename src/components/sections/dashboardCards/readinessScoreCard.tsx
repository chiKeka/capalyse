import Button from '@/components/ui/Button';
import CircularScoreBar from '@/components/ui/CircularScoreBar';
import { ReadinessScoreData } from '@/lib/uitils/types';
import AssessmentReadiness from '../AssessmentReadiness';
import { useState } from 'react';

type Props = {
  scoreValue?: number;
  readinessData?: ReadinessScoreData;
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

  // Use readinessData overall score if available, otherwise fall back to scoreValue
  const displayScore = readinessData?.scores?.overall ?? scoreValue ?? 0;

  return (
    <div className="border-1 p-[3%] border-[#E8E8E8] flex flex-col rounded-md lg:min-w-[276px] w-full min-h-[356px]">
      <p className="font-bold text-base">{textContent}</p>

      <div className="flex flex-col h-full justify-center items-center">
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
            <div className="w-full flex items-center justify-center mt-auto">
              <Button variant="secondary" onClick={() => setOpen(true)}>
                Start Assessment
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
