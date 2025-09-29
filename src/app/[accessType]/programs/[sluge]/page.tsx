"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import CreateProgram from "@/components/ui/createProgram";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  applyToProgram,
  GetProgramById,
  updateProgramStatus,
} from "@/hooks/usePrograms";
import { formatDateRange } from "@/lib/uitils/fns";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
const STATUS_OPTIONS = [
  { value: "publish", label: "Publish" },
  { value: "close", label: "Close" },
  { value: "complete", label: "Complete" },
  { value: "cancel", label: "Cancel" },
] as const;

function page() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { data: program } = GetProgramById(params.sluge as string);
  const router = useRouter();
  const dateRange = `${program?.startDate} – ${program?.endDate}`;
  const { mutateAsync: applyToPtograms } = applyToProgram(
    params.sluge as string
  );
  const { mutateAsync: updateProgramStatusMutation } = updateProgramStatus(
    params.sluge as string
  );

  let bg = "#DCFCE7";
  let color = "#22C55E";

  if (program?.status === "close") {
    color = "#A0A4A8";
    bg = "#E8E8E8";
  } else if (program?.status === "draft") {
    color = "#FACC15";
    bg = "#FEF9C3";
  } else if (program?.status === "published") {
    color;
    bg;
  } else if (program?.status === "cancel") {
    color = "#DC3545";
    bg = "#E8E8E8";
  } else if (program?.status === "completed") {
    color = "#007BFF";
    bg = "#E8E8E8";
  }

  const label = () => {
    if (program?.status === "draft") {
      return "Draft Program";
    } else if (program?.status === "close") {
      return "Applications Closed";
    } else if (program?.status === "published") {
      return "Open for Applications";
    } else if (program?.status === "cancel") {
      return "Cancelled";
    } else if (program?.status === "completed") {
      return "Completed";
    }
  };
  const handleApplyToProgram = () => {
    applyToPtograms(undefined, {
      onSuccess: () => {
        toast.success("Program applied to successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };
  const handleStatusUpdate = (newStatus: string) => {
    updateProgramStatusMutation(newStatus, {
      onSuccess: () => {
        toast.success(`Program status updated to ${newStatus}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
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
                router.push(
                  `/${params.accessType}/programs/${params.sluge}/applicants`
                )
              }
              className="text-green w-fit"
              variant="tertiary"
            >
              {CIcons?.applicants()}
              View Applicants
            </Button>
            <Button
              className="text-green w-fit"
              variant="tertiary"
              onClick={() => {
                setIsOpen(true);
                setIsEdit(true);
              }}
            >
              {CIcons?.edit()}
              Edit
            </Button>
          </div>
        )}

        {searchParams.get("apply") === "true" &&
          (params?.accessType === "sme" ||
            params?.accessType === "investor") && (
            <div className="flex items-center gap-2">
              <Button
                className="text-green w-fit"
                variant="primary"
                onClick={handleApplyToProgram}
              >
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
                className="flex items-center rounded-[40px] h-[28px] w-fit gap-3 p-2"
                style={{ backgroundColor: bg }}
              >
                <div
                  className="rounded-full h-2 w-2 font-medium"
                  style={{ backgroundColor: color }}
                />
                {(params.accessType === "investor" ||
                  params.accessType === "sme") &&
                  label()}
                {(params.accessType === "development" ||
                  params.accessType === "admin") && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="small"
                        className="text-xs font-medium"
                      >
                        {label()}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-1 bg-white border border-[#E8E8E8] rounded-[8px] shadow-lg">
                      <div className="flex flex-col">
                        {STATUS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleStatusUpdate(option.value)}
                            className="text-left px-3 py-2 text-xs font-normal text-[#0F2501] hover:bg-[#F5F5F5] rounded-[4px] transition-colors w-full first:rounded-t-[4px] last:rounded-b-[4px]"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
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
        <CreateProgram
          program={program}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          isEdit={isEdit}
        />
      </DashboardCardLayout>
    </div>
  );
}

export default page;
