"use client";
import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CheckListProgressCard from "@/components/sections/dashboardCards/checkListProgressCard";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import LearningCard from "@/components/sections/dashboardCards/learningCard";
import { OverviewHeaderCard } from "@/components/sections/dashboardCards/overviewHeaderCard";
import Programs from "@/components/sections/dashboardCards/programs";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import SuggestedConnection from "@/components/sections/dashboardCards/suggestedConnection";
import { useGetCurrentProfile } from "@/hooks/useProfileManagement";
import { useGetSmeAssesmentsProgress } from "@/hooks/useSmeAssessments";
import { useParams, useRouter } from "next/navigation";

export default function SmeDashBoard() {
  const params = useParams();

  const { data: assessmentsProgress } = useGetSmeAssesmentsProgress();
  const ProfileDetails = useGetCurrentProfile();
  const { data: user, isLoading, error } = ProfileDetails;
  console.log({ assessmentsProgress, user });
  const learningCards = [
    {
      id: "1",
      href: "/",
      header: "Trading Across Africa: How AfCFTA Is Changing the Game",
    },
    {
      id: "1",
      href: "/",
      header: "Trading Across Africa: How AfCFTA Is Changing the Game",
    },
  ];
  // const finaceProgressKey = assessmentsProgress?.ompletedSections.map(
  //   (x: string) => x
  // );

  const sectionCompletion = assessmentsProgress?.sectionCompletion || {};
  const completedSections = assessmentsProgress?.completedSections || [];

  const nextSectionName = completedSections.find(
    (section: string) => sectionCompletion[section] !== true
  );

  const label =
    nextSectionName !== undefined ? `Finish ${nextSectionName}` : "Completed";

  const renderFinanceStatus = () => {
    const values = Object.values(sectionCompletion);

    if (values.length === 0) return "";

    const allTrue = values.every((v) => v === true);
    const allFalse = values.every((v) => v === false);

    if (allTrue) return 100;
    if (allFalse) return 50;
    return undefined;
  };
  const checklist = [
    {
      icon: "/icons/profile.svg",
      label: "Complete profile",
      status: user?.completionPercentage || undefined,
    },
    {
      icon: "/icons/presentation.svg",
      label: "Start Readiness Assessment",
      status: assessmentsProgress?.overallCompletionPercentage || undefined,
    },
    {
      icon: "/icons/money_out.svg",
      label: label,
      status: renderFinanceStatus() || undefined,
    },
    {
      icon: "/icons/status_up.svg",
      label: "Explore investor matches",
      status: undefined,
    },
  ];

  const suggestedConnections = [
    { id: 1, icon: "/icons/user1.svg", name: "Suggested Connection 1" },
    { id: 2, icon: "/icons/user2.svg", name: "Suggested Connection 2" },
    { id: 3, icon: "/icons/user3.svg", name: "Suggested Connection 3" },
    { id: 4, icon: "/icons/user4.svg", name: "Suggested Connection 4" },
    { id: 5, icon: "/icons/user5.svg", name: "Suggested Connection 5" },
  ];
  const router = useRouter();

  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={user?.completionPercentage}
        link={`/${params.accessType}/profile`}
        user={{ name: user?.firstName }}
        showProgress={true}
        showButton={true}
        buttonProps={{
          className: "max-w-max !border-black-50 !text-black-400",
          variant: "secondary",
          iconPosition: "right",
        }}
      />
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
                  key={idx}
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
            link={`/${params.accessType}/learning`}
            linkName="See all Resources"
          >
            <div className="flex gap-4 my-8 flex-col lg:flex-row items-start ">
              {learningCards.map((card, idx) => (
                <LearningCard
                  // onClick={router.push(
                  //   `/${params.accessType}/learning/${card?.id}`
                  // )}
                  href={card.href}
                  header={card.header}
                  key={idx}
                />
              ))}
            </div>
          </DashboardCardLayout>
        </div>
        <div>
          <DashboardCardLayout height="h-full" caption="Matched Investors">
            <EmptyBox
              caption2={
                assessmentsProgress?.overallCompletionPercentage > 0 &&
                assessmentsProgress?.overallCompletionPercentage < 100
                  ? `Your about ${
                      assessmentsProgress?.overallCompletionPercentage ?? 0
                    }% done with your Investment readiness assement, click the button below to continue`
                  : assessmentsProgress?.overallCompletionPercentage === 100
                  ? "Assessment Complete awaiting investor matches"
                  : ""
              }
              buttonText={
                assessmentsProgress?.overallCompletionPercentage > 0
                  ? "Complete Assessment"
                  : "Start Assessment"
              }
              showButton={
                assessmentsProgress?.overallCompletionPercentage &&
                assessmentsProgress?.overallCompletionPercentage < 100
              }
            />
          </DashboardCardLayout>
        </div>
      </div>
      <div className="flex w-full lg:flex-row flex-col gap-4">
        <div className="lg:w-[35%] w-full flex">
          <DashboardCardLayout
            link={`/${params.accessType}/networking`}
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
    </div>
  );
}
