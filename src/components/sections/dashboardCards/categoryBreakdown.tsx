import StraightBar from "@/components/ui/straightBar";

type Props = {};

export default function CategoryBreakdown({}: Props) {
  return (
    <div className="w-full gap-2 flex flex-col">
      <div className="w-full lg:w-[750px] flex flex-row justify-between items-start">
        <p className="text-base font-normal text-[#0B0B0C]">Foundational</p>
        <div className="flex flex-col gap-3 items-end justify-end text-end">
          <p className="text-[#0B0B0C] font-bold text-xs">80% Ready</p>
          <p className="font-normal text-xs text-[#52575C]">
            Strong foundation in place
          </p>
        </div>
      </div>
      <StraightBar />
    </div>
  );
}
