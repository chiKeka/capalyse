"use client";
import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import { OverviewHeaderCard } from "@/components/sections/dashboardCards/overviewHeaderCard";
import Programs from "@/components/sections/dashboardCards/programs";
import { routes } from "@/lib/routes";
import { formatCurrency } from "@/lib/uitils/fns";
import { useParams } from "next/navigation";
import { Card, CardContent } from "../ui/card";
import { CIcons } from "../ui/CIcons";

const overviewCards = [
  {
    id: 3,
    icon: CIcons.profile2,
    label: "Active Programs",
    amount: 0,
  },
  {
    id: 2,
    icon: CIcons.profile2,
    label: "SMEs Engaged",
    amount: 0,
  },
  {
    id: 1,
    icon: CIcons.walletMoney,
    label: "Funds Deployed",
    amount: 0,
    currency: "NGN",
    percentage: 0,
    direction: "up",
  },
];
const programs = [1, 2];
export default function DevelopmentDashBoard() {
  const params = useParams();

  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={30}
        link={routes.investor.smeDirectory}
        user={{ name: "Welcome PMC NGO 👋" }}
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
