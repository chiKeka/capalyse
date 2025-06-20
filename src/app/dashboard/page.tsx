"use client";
import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import CheckListProgressCard from "@/components/sections/dashboardCards/checkListProgressCard";
import DocumentsTable from "@/components/sections/dashboardCards/documentList";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import MatchedInvetors from "@/components/sections/dashboardCards/matchedInvetors";
import Programs from "@/components/sections/dashboardCards/programs";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import SuggestedConnection from "@/components/sections/dashboardCards/suggestedConnection";

export default function Page() {
  return (
    <div>
      <ReadinessScoreCard />
      <DashboardCardLayout caption="Checklist Progress">
        <CheckListProgressCard />
      </DashboardCardLayout>

      <DashboardCardLayout caption="Matched Investors">
        <EmptyBox />
      </DashboardCardLayout>
      <DashboardCardLayout caption="Matched Investors">
        <MatchedInvetors />
      </DashboardCardLayout>

      <DashboardCardLayout
        link="/dashboard/"
        linkName="See all"
        caption="Suggested Connections"
      >
        <SuggestedConnection />
      </DashboardCardLayout>

      <DashboardCardLayout caption="Development Programs">
        <Programs />
      </DashboardCardLayout>

      <DashboardCardLayout caption="Category Breakdown">
        <CategoryBreakdown />
      </DashboardCardLayout>
      <DocumentsTable />
    </div>
  );
}
