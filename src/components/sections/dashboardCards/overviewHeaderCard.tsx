import Button from "@/components/ui/Button";
import StraightBar from "@/components/ui/straightBar";

type Props = { value: number };

function OverviewHeaderCard({ value }: Props) {
  return (
    <div className="justify-between my-4 flex flex-row">
      <div className="">
        <p className="lg:text-4xl text-2xl font-bold ">Hi Jane 👋</p>
        <p className="text-base font-normal">
          Here’s a snapshot of your progress.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row gap-2 justify-end items-center w-[40%]">
        <div className="w-full flex flex-1 flex-col ">
          <div className="items-center w-full text-xs font-normal text-[#18181B] flex justify-between">
            <p>Progress</p>
            <p>{value}%</p>
          </div>

          <StraightBar value={value} />
        </div>
        <Button className="flex-1" variant="tertiary">
          Complete Profile
        </Button>
      </div>
    </div>
  );
}

export default OverviewHeaderCard;
