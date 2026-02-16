"use client";
import SmeDashBoard from "@/components/pageComponents/dashBoardSME";
import { notFound, useParams } from "next/navigation";
import InvestorDashBoard from "@/components/pageComponents/dashBoardInvestor";
import DevelopmentDashBoard from "@/components/pageComponents/dashBoardDevelopment";

export default function Page() {
  const params = useParams();
  const renderDashBoard = (accessType: string) => {
    switch (accessType) {
      case "sme":
        return <SmeDashBoard />;
      case "investor":
        return <InvestorDashBoard />;
      case "development":
        return <DevelopmentDashBoard />;
      default:
        return notFound();
    }
  };
  return renderDashBoard(params.accessType as string);
}
