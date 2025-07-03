"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import Programs from "@/components/sections/dashboardCards/programs";

type Props = {};
const programs = [1, 2];
function page({}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <DashboardCardLayout height="h-full" caption="">
          <div>
                      <div>
                          <img src={''}/>
              <p className="text-green text-base font-bold">Program</p>
            </div>
          </div>
        </DashboardCardLayout>
      </div>
      {programs.length > 0 ? (
        <div className="flex-1 ">
          <DashboardCardLayout height="h-full" caption="Recent Programs">
            <div className="my-8 flex-col flex gap-2">
              {programs.map(() => {
                return <Programs />;
              })}
            </div>
          </DashboardCardLayout>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4 lg:flex-row">
          <DashboardCardLayout height="h-full" caption="Recent Programs">
            <div className="w-full h-full py-24 flex items-center justify-center">
              <EmptyBox
                buttonText="Create Program"
                caption="No Programs Yet!"
                caption2="You have not created any programs yet."
              />
            </div>
          </DashboardCardLayout>
        </div>
      )}
    </div>
  );
}

export default page;
