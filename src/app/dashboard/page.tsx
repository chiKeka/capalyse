"use client";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import CheckListProgressCard from "@/components/sections/dashboardCards/checkListProgressCard";
import DocumentsTableDemo from "@/components/sections/dashboardCards/documentList";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import MatchedInvetors from "@/components/sections/dashboardCards/matchedInvetors";
import Programs from "@/components/sections/dashboardCards/programs";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import SuggestedConnection from "@/components/sections/dashboardCards/suggestedConnection";

export default function Page() {
  return (
    <div>
      <ReadinessScoreCard />
      <CheckListProgressCard />
      <EmptyBox />
      <MatchedInvetors />
      <SuggestedConnection />
      <Programs />
      <CategoryBreakdown />
      <DocumentsTableDemo />
    </div>
  );
}
