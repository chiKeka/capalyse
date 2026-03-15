"use client";
import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import { OverviewHeaderCard } from "@/components/sections/dashboardCards/overviewHeaderCard";
import { useGetAdminAnalytics } from "@/hooks/useAdmin";
import { useSmeMatches } from "@/hooks/useDirectories";
import { useGetSupport } from "@/hooks/useSupport";
import { authAtom } from "@/lib/atoms/atoms";
import { routes } from "@/lib/routes";
import { formatInvestmentData } from "@/lib/uitils/fns";
import { useAtomValue } from "jotai";
import { BotIcon, Loader2Icon } from "lucide-react";
import InvestmentOpportunitiesCard from "../InvesmentOpportunitiesCard";
import IconCards from "../sections/dashboardCards/iconCards";
import { CIcons } from "../ui/CIcons";
import { isEmpty } from "lodash";
import EmptyBox from "../sections/dashboardCards/emptyBox";
import { useAgentInstances } from "@/hooks/useAgents";
import { formatAgentName, statusConfig } from "@/lib/uitils/agentTypes";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";

export default function AdminDashBoard() {
  const auth: any = useAtomValue(authAtom);

  const { data: adminAnalytics, isLoading } = useGetAdminAnalytics("NGN");
  const { data: matches, isLoading: isLoadingSmeMatches } = useSmeMatches();
  const investmentData = formatInvestmentData(adminAnalytics?.data?.investmentOpportunities ?? []);
  const { data: supportTicket } = useGetSupport();
  const { data: agentInstances = [], isLoading: agentsLoading } = useAgentInstances();

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Funds Disbursed",
      amount: adminAnalytics?.data?.investmentsRecorded?.[0]?.amount ?? 0,
      currency: adminAnalytics?.data?.investmentsRecorded?.[0]?.currency ?? "NGN",
      percentage: 152000,
      direction: "up",
    },
    {
      id: 2,
      icon: CIcons.profile2,
      label: "Pending Verifications",
      amount: adminAnalytics?.data?.pendingUserVerification ?? 10,
    },
    {
      id: 3,
      icon: CIcons.profile2,
      label: "Active Programs",
      amount: adminAnalytics?.data?.programs?.total ?? 10,
    },
    {
      id: 4,
      icon: CIcons.profile2,
      label: "Investor-SME Matches",
      amount: matches?.items?.length ?? 0,
    },
  ];

  const groups = [
    {
      group: "SMEs",
      count: adminAnalytics?.data?.users?.byRole?.sme ?? "0",
      color: "#5CEBB4",
    },
    {
      group: "Investors",
      count: adminAnalytics?.data?.users?.byRole?.investor ?? "0",
      color: "#A5BDFA",
    },
    {
      group: "Dev Orgs",
      count: adminAnalytics?.data?.users?.byRole?.development_org ?? "0",
      color: "#FCA5A5",
    },
  ];
  // console.log({ adminAnalytics, matches });
  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={30}
        link={routes.admin.profile}
        user={{ name: auth?.name }}
        textContent="Monitor overall activity, verify users, and manage performance across the ecosystem"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <IconCards
          label="Total Registered Users"
          amount={adminAnalytics?.data?.users?.total ?? 0}
          icon={CIcons.profile2}
          extraContent={
            isLoading ? (
              <Loader2Icon className="animate-spin text-green w-12 h-12" />
            ) : (
              <div className="flex justify-between mt-auto">
                {groups?.map((item) => (
                  <div key={item?.group} className="text-black-500 text-2xl">
                    <div className="flex gap-1 items-center text-sm">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.group}</span>
                    </div>
                    <h2>{item.count}</h2>
                  </div>
                ))}
              </div>
            )
          }
        />
        <div className="grid grid-cols-2 gap-5">
          {isLoading ? (
            <Loader2Icon className="animate-spin text-green w-12 h-12" />
          ) : (
            overviewCards.map((card) => <IconCards {...card} key={card?.id} />)
          )}
        </div>
        {/* <IconCards {...card} key={card?.id} /> */}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 ">
        <div className="lg:col-span-2 h-auto w-full ">
          <InvestmentOpportunitiesCard
            caption="Investment Opportunities (₦)"
            investmentData={investmentData}
          />
        </div>

        <div className="lg:col-span-3 w-full">
          <DashboardCardLayout
            caption={`Support Tickets Open (${
              supportTicket?.tickets?.filter((ticket: any) => ticket.status === "open")?.length ?? 0
            })`}
          >
            {isLoading ? (
              <Loader2Icon className="animate-spin  mx-auto text-green w-12 h-12" />
            ) : (
              <div className="flex my-8 flex-col gap-3">
                <div className="flex flex-col gap-4">
                  {isEmpty((adminAnalytics as any)?.openTicketsCountByRoles) ? (
                    <EmptyBox
                      caption="No Open Tickets by role yet"
                      caption2=""
                      showButton={false}
                    />
                  ) : (
                    (adminAnalytics as any)?.openTicketsCountByRoles?.map((ticket: any) => (
                      <div
                        key={ticket.userRole}
                        className="flex items-center justify-between border border-gray-200 rounded-lg px-6 py-5  text-xl font-medium bg-transparent"
                      >
                        <span>{ticket.userRole}</span>
                        <span>{ticket.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </DashboardCardLayout>
        </div>
      </div>

      {/* Platform AI Agents Overview */}
      <DashboardCardLayout caption="AI Agents Overview">
        {agentsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2Icon className="animate-spin text-green w-8 h-8" />
          </div>
        ) : agentInstances.length === 0 ? (
          <div className="my-4">
            <EmptyBox
              caption="No Agent Activity"
              caption2="No AI agents have been launched across the platform yet."
              showButton={false}
            />
          </div>
        ) : (
          <div className="my-4 space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Running",
                  count: agentInstances.filter((i) => i.status === "running").length,
                  color: "bg-blue-50 text-blue-700 border-blue-200",
                },
                {
                  label: "Completed",
                  count: agentInstances.filter((i) => i.status === "completed").length,
                  color: "bg-green-50 text-green-700 border-green-200",
                },
                {
                  label: "Failed",
                  count: agentInstances.filter((i) => i.status === "failed").length,
                  color: "bg-red-50 text-red-700 border-red-200",
                },
                {
                  label: "Total",
                  count: agentInstances.length,
                  color: "bg-gray-50 text-gray-700 border-gray-200",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "rounded-lg border px-4 py-3 text-center",
                    stat.color,
                  )}
                >
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent agent instances list */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#18181B]">Recent Activity</p>
              {agentInstances.slice(0, 5).map((inst) => {
                const status = statusConfig(inst.status);
                return (
                  <div
                    key={inst.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 bg-white"
                  >
                    <BotIcon className="w-4 h-4 text-green shrink-0" />
                    <span className="text-sm font-medium text-[#18181B] flex-1 truncate">
                      {formatAgentName(inst.agent_type)}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border",
                        status.color,
                      )}
                    >
                      {status.pulse && (
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
                        </span>
                      )}
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DashboardCardLayout>
    </div>
  );
}
