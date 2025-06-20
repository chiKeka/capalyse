"use client";
import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CheckListProgressCard from "@/components/sections/dashboardCards/checkListProgressCard";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import LearningCard from "@/components/sections/dashboardCards/learningCard";
import Programs from "@/components/sections/dashboardCards/programs";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import SuggestedConnection from "@/components/sections/dashboardCards/suggestedConnection";

export default function Page() {
  const learningCards = [
    {
      href: "/",
      header: "Trading Across Africa: How AfCFTA Is Changing the Game",
    },
    {
      href: "/",
      header: "Trading Across Africa: How AfCFTA Is Changing the Game",
    },
  ];
  const checklist = [
    {
      icon: "/icons/profile.svg",
      label: "Complete profile",
      status: "Not Started",
    },
    {
      icon: "/icons/presentation.svg",
      label: "Start Readiness Assessment",
      status: "Not Started",
    },
    {
      icon: "/icons/money_out.svg",
      label: "Finish financial section",
      status: "Not Started",
    },
    {
      icon: "/icons/status_up.svg",
      label: "Explore investor matches",
      status: "Not Started",
    },
  ];

  const suggestedConnections = [
    { id: 1, icon: "/icons/user1.svg", name: "Suggested Connection 1" },
    { id: 2, icon: "/icons/user2.svg", name: "Suggested Connection 2" },
    { id: 3, icon: "/icons/user3.svg", name: "Suggested Connection 3" },
    { id: 4, icon: "/icons/user4.svg", name: "Suggested Connection 4" },
    { id: 5, icon: "/icons/user5.svg", name: "Suggested Connection 5" },
  ];

  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <div className="flex flex-col gap-6 md:flex-wrap lg:flex-row ">
        <div className="lg:w-[25%] h-auto w-full ">
          <ReadinessScoreCard scoreValue={5} />
        </div>

        <div className="lg:w-[45%] w-full">
          <DashboardCardLayout caption="Checklist Progress">
            <div className="flex my-8 flex-col gap-3">
              {checklist.map((item, idx) => (
                <CheckListProgressCard
                  caption={item.label}
                  status={item.status}
                  img={item.icon}
                />
              ))}
            </div>
          </DashboardCardLayout>
        </div>
        <div className="w-full h-full justify-between flex flex-1 gap-4 flex-col lg:w-[25%]">
          <DashboardCardLayout
            icon={"/images/bulb.svg"}
            caption="Quick Tip"
            height="h-full"
          >
            <p className="text-sm my-7 font-normal w-[244px]">
              Keep your profile and documents updated to boost your readiness
              score and attract investors.
            </p>
          </DashboardCardLayout>
          <DashboardCardLayout
            icon={"/icons/warning.svg"}
            caption="Compliance Flag"
            height="h-full"
          >
            {/* <p className="text-sm my-7 font-normal  w-[244px]"></p> */}
          </DashboardCardLayout>
        </div>
      </div>
      <div className="flex flex-col w-full gap-4 lg:flex-row">
        <div className="flex lg:flex-row md:flex-wrap flex-col w-full lg:w-[70%]">
          <DashboardCardLayout
            caption="Learning Hub"
            link="/"
            linkName="See all Resources"
          >
            <div className="flex gap-4 my-8 flex-col lg:flex-row items-start ">
              {learningCards.map((card, idx) => (
                <LearningCard href={card.href} header={card.header} key={idx} />
              ))}
            </div>
          </DashboardCardLayout>
        </div>
        <div>
          <DashboardCardLayout height="h-full" caption="Matched Investors">
            <EmptyBox />
          </DashboardCardLayout>
        </div>
      </div>
      <div className="flex w-full lg:flex-row flex-col gap-4">
        <div className="lg:w-[35%] w-full flex">
          <DashboardCardLayout
            link="/dashboard/"
            linkName="See all"
            caption="Suggested Connections"
          >
            <div className="flex my-8 flex-col gap-3">
              {suggestedConnections.map((item) => (
                <SuggestedConnection
                  key={item.id}
                  icon={item.icon}
                  name={item.name}
                />
              ))}
            </div>
          </DashboardCardLayout>
        </div>
        <div className="flex-1 ">
          <DashboardCardLayout height="h-full" caption="Develolopment Programs">
            <div className="my-8">
              <Programs />
            </div>
          </DashboardCardLayout>
        </div>
      </div>

      {/* <DashboardCardLayout caption="Matched Investors">
        base font-normal text-start md:w-'284px]
        <MatchedInvetors />
      </DashboardCardLayout>


      <DashboardCardLayout caption="Development Programs">
        <Programs />
      </DashboardCardLayout>


      */}
    </div>
  );
}
