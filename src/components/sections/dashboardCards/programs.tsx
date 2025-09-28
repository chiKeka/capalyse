import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";

import { formatDateRange } from "@/lib/uitils/fns";
import { useParams, useRouter } from "next/navigation";

type Props = {
  status?: "active" | "closed" | "draft";
  program: any;
};

function Programs({ status = "active", program }: Props) {
  let bg = "#DCFCE7";
  let color = "#22C55E";

  if (status === "closed") {
    color = "#A0A4A8";
    bg = "#E8E8E8";
  } else if (status === "draft") {
    color = "#FACC15";
    bg = "#FEF9C3";
  }

  const label = () => {
    if (status === "draft") {
      return "Draft Program";
    } else if (status === "closed") {
      return "Applications Closed";
    } else if (status === "active") {
      return "Open for Applications";
    }
  };
  const router = useRouter();
  const params = useParams();
  const dateRange = `${program?.startDate} – ${program?.endDate}`;
  return (
    <div className="w-full gap-1 rounded-[12px] md:min-h-[239px] h-auto p-6 flex flex-col justify-between border-1 border-[#E8E8E8]">
      <div
        className={`flex items-center rounded-[40px] h-[28px] w-fit gap-3 p-2 bg-[${bg}]`}
      >
        <div className={`rounded-full h-2 w-2 bg-[${color}]`} />
        {label()}
      </div>
      <p className="font-bold text-lg text-green">{program?.name}</p>
      <div className="flex items-center  gap-2">
        <img
          src="/icons/partnerBadge.png"
          className="max-h-4  h-auto w-auto max-w-4"
        />
        <div className="flex flex-wrap gap-2">
          Hosted by{" "}
          {program?.partners?.map((partner: any) => partner?.name).join(", ")}
        </div>
      </div>

      <p className="text-sm text-[#52575C] font-normal">
        {program?.description}
      </p>
      <div className="flex flex-col lg:flex-row justify-between gap-0">
        <div className="flex flex-wrap gap-4">
          {" "}
          <div className="flex gap-2 items-center w-fit">
            <img className="w-4 h-4" src="/icons/calendar.svg" />
            <p className="text-xs font-normal text-[#0F2501]">
              {formatDateRange(dateRange as string)}
            </p>
          </div>
          <div className="flex w-fit gap-2 items-center">
            <img className="w-4 h-4" src="/icons/location.svg" />{" "}
            <p className="text-xs font-normal text-[#0F2501]">
              {program?.eligibleCountries?.join(", ")}
            </p>
          </div>
          <div className="flex gap-2 items-center w-fit">
            <img className="w-4 h-4" src="/icons/star.svg" />
            <p className="text-xs font-normal text-[#0F2501]">
              {program?.smeStage?.join(", ")}
            </p>
          </div>
        </div>

        <div className="w-full items-end flex justify-end ">
          {(params.accessType === "sme" ||
            params.accessType === "investor") && (
            <Button
              onClick={() =>
                router.push(`/${params.accessType}/programs/${program.id}`)
              }
              variant="ghost"
              className="text-sm text-green hover:text-green font-bold "
            >
              Apply Now
            </Button>
          )}

          {params.accessType === "development" && (
            <div>
              <Button
                onClick={() =>
                  router.push(`/${params.accessType}/programs/${program.id}`)
                }
                variant="ghost"
                className="text-green text-sm hover:text-green"
                size="small"
              >
                {CIcons.eye()}
                View
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  router.push(`/${params.accessType}/programs/${program.id}`)
                }
                className="text-green text-sm hover:text-green"
                size="small"
              >
                {CIcons.edit()}
                Edit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Programs;
