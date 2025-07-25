import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import Button from "@/components/ui/Button";
import { Edit, Pen } from "lucide-react";
import React from "react";

type Props = {};

function page({}: Props) {
  return (
    <div>
      <div className="flex justify-between w-full">
        <div className="inline-flex my-3 md:text-sm text-xs lg:text-base">
          <p>Program {">"}</p>
          <p className="font-medium text-green ">
            SME Growth & Formalization Program – Nigeria 2025
          </p>
        </div>
        <div>
          <Button className="text-green" variant="tertiary">
            <Edit className="text-green w-3 h-3" />
            Edit
          </Button>
        </div>
      </div>

      <DashboardCardLayout>
        <div className="py-3">
          <p className="lg:text-4xl text-2xl text-green font-bold ">
            SME Growth & Formalization Program – Nigeria 2025
          </p>
          <p className="text-sm font-normal text-black">
            Hosted by Afreximbank
          </p>
        </div>
        <div className="max-w-5xl flex-col flex gap-3">
          <p>
            A capacity-building and funding-readiness initiative targeting 500
            early-stage SMEs across Nigeria. Focused on improving formalization,
            financial transparency, and regional market access under AfCFTA
          </p>
          <div>
            <p className="font-bold text-base">Program Objective</p>
            <ol className="list-disc font-normal text-base ml-5">
              <li>Improve SME compliance and documentation</li>
              <li>Raise average Investment Readiness Scores</li>
              <li>Support 50% of participants in meeting investor criteria</li>
              <li>Promote regional trade awareness (AfCFTA, ECOWAS)</li>
            </ol>
          </div>
          <div>
            <p className="font-bold text-base">Program Duration</p>
            <p className="font-normal text-base">
              May 1 – August 31, 2025 (4 months)
            </p>
          </div>
          <div>
            <p className="font-bold text-normal">Target Region</p>
            <p className="font-normal text-base">
              Nigeria (with focus on Lagos, Abuja, Enugu)
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
              Capalyze, Afreximbank, SMEDAN, ECOWAS Business Council
            </p>
          </div>
        </div>
      </DashboardCardLayout>
    </div>
  );
}

export default page;
