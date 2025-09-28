"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import Programs from "@/components/sections/dashboardCards/programs";
import Button from "@/components/ui/Button";
import CreateProgram from "@/components/ui/createProgram";

import { GetPrograms } from "@/hooks/usePrograms";
import { useState } from "react";

type Props = {};

const tabs = ["active", "closed"];

function page({}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const filterParams = {
    page: 1,
    limit: 10,
    industry: undefined,
    country: undefined,
    stage: undefined,
    supportType: undefined,
    status: undefined,
    sortBy: undefined,
  };
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const { data: programs } = GetPrograms(filterParams);
  const filteredPrograms = programs?.programs?.filter((p: any) =>
    currentTab === "active"
      ? p.status === "published" ||
        p.status === "draft" ||
        p.status === "active"
      : p.status === "closed" ||
        p.status === "completed" ||
        p.status === "cancelled"
  );

  console.log({ filteredPrograms });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <DashboardCardLayout height="h-full" caption="">
          <div className="flex flex-row justify-between">
            <div>
              <div className="flex flex-row gap-3">
                <img src={"/icons/code.svg"} />
                <p className="text-green text-base font-bold">Program</p>
              </div>
              <div className="flex gap-0 my-5">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(tab)}
                    className={`transition-all capitalize duration-300 ease-in-out  px-4 py-2 text-sm h-[39px] whitespace-nowrap ${
                      currentTab === tab
                        ? "text-green border-b-green border-b font-bold"
                        : "text-[#A0A4A8] border-b border-b-[#A0A4A8] hover:font-bold"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <Button size="small" onClick={() => setIsOpen(true)}>
              Create New Program
            </Button>
          </div>
        </DashboardCardLayout>
      </div>
      {filteredPrograms?.length > 0 ? (
        <div className="flex-1 ">
          <DashboardCardLayout
            height="h-full"
            // caption={`Recent ${currentTab} Programs`}
          >
            <div className="my-8 flex-col flex gap-2">
              {filteredPrograms?.map((program: any) => {
                return (
                  <Programs
                    program={program}
                    status={program.status}
                    key={program.id}
                  />
                );
              })}
            </div>
          </DashboardCardLayout>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4 lg:flex-row">
          <DashboardCardLayout
            height="h-full"
            caption={`Recent ${currentTab} Programs`}
          >
            <div className="w-full h-full py-24 flex items-center justify-center">
              <EmptyBox
                buttonText="Create Program"
                caption="No Programs Yet!"
                caption2={`You have not created any ${currentTab.toLowerCase()} programs yet.`}
                actionType="createProgram"
              />
            </div>
          </DashboardCardLayout>
        </div>
      )}
      <CreateProgram isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

export default page;
