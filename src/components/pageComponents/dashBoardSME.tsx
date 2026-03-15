"use client";
import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CheckListProgressCard from "@/components/sections/dashboardCards/checkListProgressCard";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import LearningCard from "@/components/sections/dashboardCards/learningCard";
import { OnboardingBanner } from "@/components/sections/dashboardCards/onboardingBanner";
import { OverviewHeaderCard } from "@/components/sections/dashboardCards/overviewHeaderCard";
import Programs from "@/components/sections/dashboardCards/programs";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import SuggestedConnection from "@/components/sections/dashboardCards/suggestedConnection";
import AIAssistantsSection from "@/components/ui/ai-assistants-section";
import { useSmeMatches } from "@/hooks/useDirectories";
import { GetPrograms } from "@/hooks/usePrograms";
import { useGetReadinessScore } from "@/hooks/useReadiness";
import { useGetSmeAssesmentsProgress } from "@/hooks/useSmeAssessments";
import { getCurrentProfile } from "@/hooks/useUpdateProfile";
import { useParams } from "next/navigation";

export default function SmeDashBoard() {
  const params = useParams();

  const { data: assessmentsProgress } = useGetSmeAssesmentsProgress();
  const ProfileDetails = getCurrentProfile();
  const { data: user, isLoading, error } = ProfileDetails;
  // Fetch readiness score data
  const { data: readinessScore, isLoading: isReadinessLoading } = useGetReadinessScore();
  const learningCards: any[] = [];

  const { data: programs } = GetPrograms({ page: 1, limit: 10 });
  // const finaceProgressKey = assessmentsProgress?.ompletedSections.map(
  //   (x: string) => x
  // );

  const sectionCompletion = assessmentsProgress?.sectionCompletion || {};
  const completedSections = assessmentsProgress?.completedSections || [];

  const nextSectionName = completedSections.find(
    (section: string) => sectionCompletion[section] !== true,
  );
  const { data: investorMatches } = useSmeMatches({
    page: 1,
    limit: 1,
  });

  const checklist = [
    {
      icon: "/icons/profile.svg",
      label: "Complete profile",
      status: (user?.completedSteps?.length / user?.totalSteps) * 100 || undefined,
    },
    {
      icon: "/icons/presentation.svg",
      label: "Start Readiness Assessment",
      status: assessmentsProgress?.completionPercentage || undefined,
    },
    {
      icon: "/icons/money_out.svg",
      label: "Finish financial section",
      status: sectionCompletion?.financial || undefined,
    },
    {
      icon: "/icons/status_up.svg",
      label: "Explore investor matches",
      status: investorMatches?.total > 0 ? 100 : 0,
    },
  ];

  const suggestedConnections: any[] = [];

  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OnboardingBanner />
      <OverviewHeaderCard
        value={Math.round((user?.completedSteps?.length / user?.totalSteps) * 100)}
        link={`/${params.accessType}/profile`}
        user={{ name: user?.personalInfo?.firstName }}
        showProgress={true}
        showButton={true}
        buttonProps={{
          className: "max-w-max !border-black-50 !text-black-400",
          variant: "secondary",
          iconPosition: "right",
        }}
      />
      <div className="flex flex-col gap-6 md:flex-wrap lg:grid lg:grid-cols-2 xl:grid-cols-[1fr_2fr_1fr] ">
        <div className="h-auto w-full ">
          <ReadinessScoreCard
            readinessData={readinessScore}
            isLoading={isReadinessLoading}
            scoreValue={readinessScore?.overallScore?.percentage ?? 0} // fallback value
            showAssessment={
              readinessScore?.overallScore?.percentage
                ? readinessScore?.overallScore?.percentage < 100
                : true
            }
          />
        </div>

        <div className="w-full">
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
        <div className="w-full h-full justify-between flex flex-1 gap-4 flex-col">
          <DashboardCardLayout icon={"/images/bulb.svg"} caption="Quick Tip" height="h-full">
            <p className="text-sm my-7 font-normal w-[244px]">
              Keep your profile and documents updated to boost your readiness score and attract
              investors.
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
      <div className="flex flex-col w-full gap-4 lg:grid lg:grid-cols-[3fr_2fr]">
        <div className="flex lg:flex-row md:flex-wrap flex-col w-full">
          <DashboardCardLayout
            caption="Learning Hub"
            link={`/${params.accessType}/learning`}
            linkName="See all Resources"
          >
            <div className="flex gap-4 my-8 flex-col lg:flex-row items-start ">
              {learningCards?.length === 0 ? (
                <EmptyBox
                  caption="No Learning Courses Yet!"
                  caption2="You have not enrolled in any courses yet."
                  showButton={false}
                />
              ) : (
                learningCards?.map((card, idx) => (
                  <LearningCard href={card?.href} header={card?.header} key={idx} />
                ))
              )}
            </div>
          </DashboardCardLayout>
        </div>
        <div>
          <DashboardCardLayout height="h-full " caption="Matched Investors">
            <div className="mb-2">
              <EmptyBox
                caption2={
                  assessmentsProgress?.completionPercentage >= 0 &&
                  assessmentsProgress?.completionPercentage < 100
                    ? `Your about ${
                        assessmentsProgress?.completionPercentage ?? 0
                      }% done with your Investment readiness assement, click the button below to continue`
                    : assessmentsProgress?.isComplete
                      ? "Assessment Complete awaiting investor matches"
                      : ""
                }
                buttonText={
                  assessmentsProgress?.completionPercentage > 0
                    ? "Complete Assessment"
                    : "Start Assessment"
                }
                showButton={assessmentsProgress?.completionPercentage < 100}
              />
            </div>
          </DashboardCardLayout>
        </div>
      </div>
      <div className="flex w-full lg:grid lg:grid-cols-[2fr_3fr] flex-col gap-4">
        <div className=" w-full flex">
          <DashboardCardLayout
            link={`/${params.accessType}/networking`}
            linkName="See all"
            caption="Suggested Connections"
          >
            <div className="flex my-8 flex-col gap-3">
              {suggestedConnections?.length > 0 ? (
                suggestedConnections.map((item) => (
                  <SuggestedConnection key={item.id} icon={item.icon} name={item.name} />
                ))
              ) : (
                <EmptyBox
                  caption="No Suggested Connections Yet!"
                  caption2="You have not been matched with any investors yet."
                  showButton={false}
                />
              )}
            </div>
          </DashboardCardLayout>
        </div>
        <div className="flex-1 ">
          <DashboardCardLayout
            height="h-full"
            caption="Develolopment Programs"
            linkName="See all"
            link={`/${params.accessType}/programs`}
          >
            {programs?.programs?.length > 0 ? (
              <div className="my-8">
                <Programs status={programs.programs[0].status} program={programs.programs[0]} />
              </div>
            ) : (
              <EmptyBox
                caption="No Development Programs Yet!"
                caption2="You have not enrolled in any development programs yet."
                showButton={false}
              />
            )}
          </DashboardCardLayout>
        </div>
      </div>

      {/* AI Assistants */}
      <AIAssistantsSection
        segment="smb_formation"
        prioritize={[
          "business_plan",
          "market_analysis",
          "funding_readiness",
          "startup_financial_model",
        ]}
      />
    </div>
  );
}
