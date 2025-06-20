import StraightBar from "@/components/ui/straightBar";

type Props = { caption?: string; label?: string; value?: number };

export default function CategoryBreakdown({ caption, label, value }: Props) {
  return (
    <div className="w-full gap-2 py-2 flex flex-col">
      <div className="w-full lg:min-w-[750px] flex flex-row justify-between items-start">
        <p className="text-base font-normal text-[#0B0B0C]">{caption}</p>
        <div className="flex flex-col gap-3 items-end justify-end text-end">
          <p className="text-[#0B0B0C] font-bold text-xs">{value}% Ready</p>
          <p className="font-normal text-xs text-[#52575C]">{label}</p>
        </div>
      </div>
      <StraightBar value={value} />
    </div>
  );
}
