"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { GetProgramById } from "@/hooks/usePrograms";
import { formatDateRange } from "@/lib/uitils/fns";
import { useParams, useRouter } from "next/navigation";

function page() {
  const params = useParams();
  const { data: program } = GetProgramById(params.sluge as string);
  const router = useRouter();
  const dateRange = `${program?.startDate} – ${program?.endDate}`;


  let bg = "#DCFCE7";
  let color = "#22C55E";

  if (program?.status === "closed") {
    color = "#A0A4A8";
    bg = "#E8E8E8";
  } else if (program?.status === "draft") {
    color = "#FACC15";
    bg = "#FEF9C3";
  }

  const label = () => {
    if (program?.status === "draft") {
      return "Draft Program";
    } else if (program?.status === "closed") {
      return "Applications Closed";
    } else if (program?.status === "active") {
      return "Open for Applications";
    }
  };
  return (
    <div>
      <div className="flex my-4 justify-between w-full">
        <div className="inline-flex my-3 md:text-sm text-xs lg:text-base">
          <p>Program {">"}</p>
          <p className="font-medium text-green ">{program?.name}</p>
        </div>
        {params?.accessType === "development" && (
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                router.push(`/${params.accessType}/programs/${params.sluge}/applicants`)
              }
              className="text-green w-fit"
              variant="tertiary"
            >
              {CIcons?.applicants()}
              View Applicants
            </Button>
            <Button className="text-green w-fit" variant="tertiary">
              {CIcons?.edit()}
              Edit
            </Button>
          </div>
        )}

        {(params?.accessType === "sme" ||
          params?.accessType === "investor") && (
          <div className="flex items-center gap-2">
            <Button  className="text-green w-fit" variant="primary">
              Apply Now
            </Button>
          </div>
        )}
      </div>

      <DashboardCardLayout>
        <div className="flex flex-col gap-6">
          <div className="py-3 flex flex-col gap-2">
            <p className="lg:text-4xl text-2xl text-green font-bold ">
              {program?.name}
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex items-center  gap-2">
                <img
                  src="/icons/partnerBadge.png"
                  className="max-h-4  h-auto w-auto max-w-4"
                />
                <div className="flex flex-wrap gap-2">
                  Hosted by{" "}
                  {program?.partners
                    ?.map((partner: any) => partner?.name)
                    .join(", ")}
                </div>
              </div>
              <div
                className={`flex items-center rounded-[40px] h-[28px] w-fit gap-3 p-2 bg-[${bg}]`}
              >
                <div className={`rounded-full h-2 w-2 bg-[${color}]`} />
                {label()}
              </div>
            </div>
          </div>
          <div className="max-w-5xl  flex-col flex gap-6">
            <p>{program?.description}</p>
            <div>
              <p className="font-bold text-base">Program Objective</p>
              <ol className="list-disc font-normal text-base ml-5">
                <li>Improve SME compliance and documentation</li>
                <li>Raise average Investment Readiness Scores</li>
                <li>
                  Support 50% of participants in meeting investor criteria
                </li>
                <li>Promote regional trade awareness (AfCFTA, ECOWAS)</li>
              </ol>
            </div>
            <div>
              <p className="font-bold text-base">Program Duration</p>
              <p className="font-normal text-base">
                {formatDateRange(dateRange as string)}
              </p>
            </div>
            <div>
              <p className="font-bold text-normal">Target Region</p>
              <p className="font-normal text-base">
                {program?.eligibleCountries?.join(", ")}
              </p>
            </div>
            <div>
              <p className="font-normal text-base">Support Provided:</p>
              <ol className="list-disc font-normal text-base ml-5">
                <li>Guided readiness assessments</li>
                <li>Personalized feedback and resources</li>
                <li>Live virtual workshops and office hours</li>
                <li>Final demo day with investors</li>
              </ol>
            </div>
            <div>
              <p className="font-bold text-base">Partners:</p>
              <p className="font-normal text-base">
                {program?.partners
                  ?.map((partner: any) => partner?.name)
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
      </DashboardCardLayout>
    </div>
  );
}

export default page;
