import Button from "@/components/ui/Button";
import CircularScoreBar from "@/components/ui/CircularScoreBar";

type Props = {
  scoreValue: number;
};

function ReadinessScoreCard({ scoreValue }: Props) {
  return (
    <div className="border-1 p-[3%]  justify-between border-[#E8E8E8] flex flex-col  rounded-md lg:min-w-[276px] w-full  min-h-[356]">
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
