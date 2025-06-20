import Button from "@/components/ui/Button";
import CircularScoreBar from "@/components/ui/CircularScoreBar";
import { useState } from "react";

type Props = {};

function ReadinessScoreCard({}: Props) {
  const [scoreValue, setScoreValue] = useState(1);
  return (
    <div className="border-1 p-[2%]  justify-between border-[#E8E8E8] flex flex-col  rounded-md w-full md:w-68 h-89">
      <p className="font-bold text-base">Readiness Score</p>

      <div className="w-full items-center justify-center flex">
        <CircularScoreBar value={scoreValue} size={180} strokeWidth={10} />
      </div>

      <div className="w-full flex items-center justify-center">
        <Button variant="secondary">Start Assessment </Button>
      </div>
    </div>
  );
}

export default ReadinessScoreCard;
