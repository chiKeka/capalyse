'use client';
import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import { OverviewHeaderCard } from '@/components/sections/dashboardCards/overviewHeaderCard';
import { routes } from '@/lib/routes';
import { useParams } from 'next/navigation';
import IconCards from '../sections/dashboardCards/iconCards';
import { CIcons } from '../ui/CIcons';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useGetAdminDashboardStats } from '@/hooks/useAdmin';
import { useAtomValue } from 'jotai';
import { authAtom } from '@/lib/atoms/atoms';
import { formatInvestmentData } from '@/lib/uitils/fns';

export default function AdminDashBoard() {
  const params = useParams();
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
          }
        />
        <div className="grid grid-cols-2 gap-5">
          {overviewCards.map((card) => (
            <IconCards {...card} key={card?.id} />
          ))}
        </div>
        {/* <IconCards {...card} key={card?.id} /> */}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 ">
        <div className="lg:col-span-2 h-auto w-full ">
          <InvestmentOpportunitiesCard investmentData={investmentData} />
        </div>

        <div className="lg:col-span-3 w-full">
          <DashboardCardLayout caption="Support Tickets Open (0)">
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
          </DashboardCardLayout>
        </div>
      </div>
    </div>
  );
}

function formatNumberShort(num: number): string {
  if (num >= 1_000_000_000) {
    const val = Math.floor((num / 1_000_000_000) * 100) / 100;
    return val + 'b';
  }
  if (num >= 1_000_000) {
    const val = Math.floor((num / 1_000_000) * 100) / 100;
    return val + 'm';
  }
  if (num >= 1_000) {
    const val = Math.floor((num / 1_000) * 100) / 100;
    return val + 'k';
  }
  return num.toString();
}

function InvestmentOpportunitiesCard({
  investmentData,
}: {
  investmentData: any;
}) {
  const allZero = investmentData.every((entry: any) => entry.value === 0);
  const emptyTrackColor = '#E6F9ED'; // light green for empty state
  const total = investmentData.reduce(
    (sum: number, entry: any) => sum + entry.value,
    0
  );
  return (
    <DashboardCardLayout caption="Investment Opportunities (₦)">
      <div className="flex flex-col items-center justify-center h-full py-6">
        <div className="relative w-56 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allZero ? [{ name: 'Empty', value: 1 }] : investmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                stroke="none"
                startAngle={90}
                endAngle={-270}
              >
                {allZero ? (
                  <Cell fill={emptyTrackColor} />
                ) : (
                  investmentData.map((entry: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))
                )}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">
              ₦{formatNumberShort(total)}
            </span>
            <span className="text-gray-400 text-base">Total</span>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-8">
          {investmentData.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: entry.color, opacity: 0.7 }}
              />
              <span className="text-gray-500 text-base font-medium">
                {entry.name} {formatNumberShort(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCardLayout>
  );
}

const tickets = [
  { label: 'SME Issues', count: 0 },
  { label: 'Investor Inquiries', count: 0 },
  { label: 'Platform Feedback', count: 0 },
];
