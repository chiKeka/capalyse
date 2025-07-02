import Button from '@/components/ui/Button';
import CircularScoreBar from '@/components/ui/CircularScoreBar';
import AssessmentReadiness from '../ReadinessAssessment';
import { useState } from 'react';

type Props = {
  scoreValue: number;
  showAssessment?: boolean;
  textContent?: string;
  extraContent?: React.ReactNode;
};

function ReadinessScoreCard({
  scoreValue,
  showAssessment,
  textContent = 'Readiness Score',
  extraContent,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-1 p-[3%] border-[#E8E8E8] flex flex-col  rounded-md lg:min-w-[276px] w-full  min-h-[356]">
      <p className="font-bold text-base">{textContent}</p>

      <div className="flex flex-col h-full justify-center items-center">
        {extraContent || (
          <div className="w-full items-center justify-center flex">
            <CircularScoreBar value={scoreValue} size={180} strokeWidth={10} />
          </div>
        )}
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
