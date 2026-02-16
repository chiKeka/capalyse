import Button from "@/components/ui/Button";
import { useState } from "react";
import AssessmentReadiness from "../AssessmentReadiness";
import CreateProgram from "@/components/ui/createProgram";

type Props = {
  caption?: string;
  caption2?: string;
  showButton?: boolean;
  buttonText?: string;
  progress?: number;
  spinner?: boolean;
  actionType?: "startAssessment" | "createProgram";
};

function EmptyBox({
  caption = "No Matched Investor Yet!",
  caption2 = "You have not taken the Investment Readiness Assessment.",
  buttonText = "Start Assessment",
  showButton = true,
  progress = 0,
  actionType = "startAssessment",
  spinner = false,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="items-center mx-auto  my-8 lg:max-w-[437px] w-full h-full flex flex-col gap-4 justify-center">
      <img
        src="/icons/emptyBox.svg"
        className={`h-[78px]  w-[78px] ${spinner ? "animate-spin" : ""}`}
      />

      <p className="text-base font-bold text-[#282828] text-center">{caption}</p>
      <p className="font-normal max-w-[206px] text-xs text-[#282828] text-center">{caption2}</p>
      {showButton && (
        <div className="w-ful flex items-center justify-center">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            {buttonText}
          </Button>
        </div>
      )}

      {actionType === "startAssessment" && (
        <AssessmentReadiness isOpen={open} setIsOpen={setOpen} />
      )}
      {actionType === "createProgram" && <CreateProgram isOpen={open} setIsOpen={setOpen} />}
    </div>
  );
}

export default EmptyBox;
