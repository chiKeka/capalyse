"use client";
import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import { OverviewHeaderCard } from "@/components/sections/dashboardCards/overviewHeaderCard";
import Programs from "@/components/sections/dashboardCards/programs";
import { GetDevOrgAnalytics } from "@/hooks/devOrg/devOrgsAnalytics";
import { ProfileData } from "@/hooks/useProfileManagement";
import { GetPrograms } from "@/hooks/usePrograms";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/uitils/fns";
import { useParams } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { CIcons } from "../ui/CIcons";
import { useAtomValue } from "jotai";
import { authAtom } from "@/lib/atoms/atoms";

export default function DevelopmentDashBoard() {
  const params = useParams();
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
  const { data: devOrgAnalytics } = GetDevOrgAnalytics();
  const { data: programs } = GetPrograms(filterParams);
  const { data: profile } = ProfileData();
    const auth = useAtomValue(authAtom);
  const filteredPrograms = programs?.programs?.filter((p: any) => {
    // First filter by current user's programs
    const isMyProgram = p.developmentOrgId === auth?.id;
    return isMyProgram;
  });
  const overviewCards = [
    {
      id: 3,
      icon: CIcons.profile2,
      label: "Active Programs",
      amount: devOrgAnalytics?.totals?.active ?? 0,
    },
    {
      id: 2,
      icon: CIcons.profile2,
      label: "SMEs Engaged",
      amount: devOrgAnalytics?.applications?.accepted ?? 0,
    },
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Funds Deployed",
      amount: devOrgAnalytics?.applications?.total ?? 0,
      currency: "NGN",
      percentage: 0,
      direction: "up",
    },
  ];
  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={30}
        link={routes.investor.smeDirectory}
        user={{
          name: `Welcome PMC ${profile?.devOrgInfo?.organizationName}`,
        }}
        showButton={false}
        textContent=""
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_2fr] gap-6">
        {overviewCards.map((card) => (
          <Card key={card.id} className="min-h-[155px] shadow-none">
            <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
              <span className="font-bold">{card.label}</span>
              <div className="flex items-center justify-between gap-2 mt-auto">
                <span className="text-5xl font-bold">
                  {card.currency
                    ? formatCurrency(card.amount, 0, 0, card.currency)
                    : card.amount}
                </span>
                <div className="text-center">
                  {card?.percentage !== undefined &&
                    (card.direction === "up" ? (
                      <span className="text-sm text-success-100 font-bold">
                        {card.percentage}%
                      </span>
                    ) : (
                      <span className="text-sm text-red font-bold">
                        {card.percentage && card.percentage < 0
                          ? card.percentage
                          : 0}
                        %
                      </span>
                    ))}
                  <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                    {card.icon()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms?.length > 0 ? (
        <div className="flex-1 ">
          <DashboardCardLayout
            linkName="See all Programs"
            link={`/${params.accessType}/programs`}
            height="h-full"
            caption="Recent Programs"
          >
            <div className="my-8 flex-col flex gap-2">
              {filteredPrograms?.map((program: any, index: string) => {
                return <Programs key={index} program={program} />;
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
                actionType="createProgram"
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
