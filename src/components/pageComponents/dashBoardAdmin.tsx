'use client';
import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import { OverviewHeaderCard } from '@/components/sections/dashboardCards/overviewHeaderCard';
import { routes } from '@/lib/routes';
import IconCards from '../sections/dashboardCards/iconCards';
import { CIcons } from '../ui/CIcons';
import { useGetAdminDashboardStats } from '@/hooks/useAdmin';
import { useAtomValue } from 'jotai';
import { authAtom } from '@/lib/atoms/atoms';
import { formatInvestmentData } from '@/lib/uitils/fns';
import { Loader2Icon } from 'lucide-react';
import InvestmentOpportunitiesCard from '../InvesmentOpportunitiesCard';

export default function AdminDashBoard() {
  const auth: any = useAtomValue(authAtom);
  const { data: adminDashboardStats, isLoading } = useGetAdminDashboardStats();
  console.log({ adminDashboardStats, auth });

  const investmentData = formatInvestmentData(
    adminDashboardStats?.investmentOpportunities ?? []
  );
  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: 'Funds Disbursed',
      amount: adminDashboardStats?.fundsDisbursed?.amount ?? 0,
      currency: adminDashboardStats?.fundsDisbursed?.currency ?? 'NGN',
      percentage: 152000,
      direction: 'up',
    },
    {
      id: 2,
      icon: CIcons.profile2,
      label: 'Pending Verifications',
      amount: adminDashboardStats?.pendingVerifications ?? 10,
    },
    {
      id: 3,
      icon: CIcons.profile2,
      label: 'Active Programs',
      amount: adminDashboardStats?.activePrograms ?? 10,
    },
    {
      id: 4,
      icon: CIcons.profile2,
      label: 'Investor-SME Matches',
      amount: adminDashboardStats?.investorMatches ?? 10,
    },
  ];

  const groups = [
    {
      group: 'SMEs',
      count: adminDashboardStats?.totalRegisteredSMEs ?? '0',
      color: '#5CEBB4',
    },
    {
      group: 'Investors',
      count: adminDashboardStats?.totalRegisteredInvestors ?? '0',
      color: '#A5BDFA',
    },
    {
      group: 'Dev Orgs',
      count: adminDashboardStats?.totalRegisteredDevelopmentOrgs ?? '0',
      color: '#FCA5A5',
    },
  ];

  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={30}
        link={routes.admin.profile}
        user={{ name: auth?.firstName }}
        textContent="Monitor overall activity, verify users, and manage performance across the ecosystem"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <IconCards
          label="Total Registered Users"
          amount={adminDashboardStats?.totalRegisteredUsers ?? 0}
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
          <DashboardCardLayout caption="Support Tickets Open (0)">
            {isLoading ? (
              <Loader2Icon className="animate-spin text-green w-12 h-12" />
            ) : (
              <div className="flex my-8 flex-col gap-3">
                <div className="flex flex-col gap-4">
                  {adminDashboardStats?.openTicketsCountByRoles.map(
                    (ticket: any) => (
                      <div
                        key={ticket.userRole}
                        className="flex items-center justify-between border border-gray-200 rounded-lg px-6 py-5  text-xl font-medium bg-transparent"
                      >
                        <span>{ticket.userRole}</span>
                        <span>{ticket.count}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </DashboardCardLayout>
        </div>
      </div>
    </div>
  );
}
