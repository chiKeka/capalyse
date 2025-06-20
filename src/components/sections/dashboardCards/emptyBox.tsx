import Button from "@/components/ui/Button";

type Props = {};

function EmptyBox({}: Props) {
  return (
    <div className="items-center my-8 lg:max-w-[437px] w-full md:w-[437px] flex flex-col gap-4 justify-center">
      <img src="/icons/emptyBox.svg" className="h-[78px] w-[78px]" />

      <p className="text-base font-bold text-[#282828] text-center">
        No Matched Investor Yet!
      </p>
      <p className="font-normal max-w-[206px] text-xs text-[#282828] text-center">
        You have not taken the Investment Readiness Assessment.
      </p>
      <div className="w-ful flex items-center justify-center">
        <Button variant="secondary">Start Assessment</Button>{" "}
      </div>
    </div>
  );
}

export default EmptyBox;
