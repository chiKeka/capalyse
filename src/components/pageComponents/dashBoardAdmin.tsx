'use client';
import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import { OverviewHeaderCard } from '@/components/sections/dashboardCards/overviewHeaderCard';
import { routes } from '@/lib/routes';
import { useParams } from 'next/navigation';
import IconCards from '../sections/dashboardCards/iconCards';
import { CIcons } from '../ui/CIcons';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function AdminDashBoard() {
  const params = useParams();
  const learningCards = [
    {
      href: '/',
      header: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    },
    {
      href: '/',
      header: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    },
  ];
  const checklist = [
    {
      icon: '/icons/profile.svg',
      label: 'Complete profile',
      status: 'Not Started',
    },
    {
      icon: '/icons/presentation.svg',
      label: 'Start Readiness Assessment',
      status: 'Not Started',
    },
    {
      icon: '/icons/money_out.svg',
      label: 'Finish financial section',
      status: 'Not Started',
    },
    {
      icon: '/icons/status_up.svg',
      label: 'Explore investor matches',
      status: 'Not Started',
    },
  ];

  const suggestedConnections = [
    { id: 1, icon: '/icons/user1.svg', name: 'Suggested Connection 1' },
    { id: 2, icon: '/icons/user2.svg', name: 'Suggested Connection 2' },
    { id: 3, icon: '/icons/user3.svg', name: 'Suggested Connection 3' },
    { id: 4, icon: '/icons/user4.svg', name: 'Suggested Connection 4' },
    { id: 5, icon: '/icons/user5.svg', name: 'Suggested Connection 5' },
  ];

  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={30}
        link={routes.admin.profile}
        user={{ name: 'Paul' }}
        textContent="Monitor overall activity, verify users, and manage performance across the ecosystem"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <IconCards
          label="Total Registered Users"
          amount={0}
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
      <div className="flex flex-col gap-6 md:flex-wrap lg:flex-row ">
        <div className="lg:w-[32%] h-auto w-full ">
          <InvestmentOpportunitiesCard />
        </div>

        <div className="lg:w-[60%] w-full">
          <DashboardCardLayout caption="Support Tickets Open (0)">
            <div className="flex my-8 flex-col gap-3">
              <div className="flex flex-col gap-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.label}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-6 py-5  text-xl font-medium bg-transparent"
                  >
                    <span>{ticket.label}</span>
                    <span>{ticket.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCardLayout>
        </div>
      </div>
    </div>
  );
}
const overviewCards = [
  {
    id: 1,
    icon: CIcons.walletMoney,
    label: 'Funds Disbursed',
    amount: 0,
    currency: 'NGN',
    percentage: 152000,
    direction: 'up',
  },
  {
    id: 2,
    icon: CIcons.profile2,
    label: 'Pending Verifications',
    amount: 10,
  },
  {
    id: 3,
    icon: CIcons.profile2,
    label: 'Active Programs',
    amount: 10,
  },
  {
    id: 4,
    icon: CIcons.profile2,
    label: 'Investor-SME Matches',
    amount: 10,
  },
];

const groups = [
  {
    group: 'SMEs',
    count: '0',
    color: '#5CEBB4',
  },
  {
    group: 'Investors',
    count: '0',
    color: '#A5BDFA',
  },
  {
    group: 'Dev Orgs',
    count: '0',
    color: '#FCA5A5',
  },
];

const investmentData = [
  { name: 'Agriculture', value: 500000, color: '#5EE173' },
  { name: 'Finance', value: 500000, color: '#A3B8FF' },
  { name: 'Health', value: 70000, color: '#FFB3B3' },
  { name: 'Tech', value: 50000, color: '#FFE6A3' },
];

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

function InvestmentOpportunitiesCard() {
  const allZero = investmentData.every((entry) => entry.value === 0);
  const emptyTrackColor = '#E6F9ED'; // light green for empty state
  const total = investmentData.reduce((sum, entry) => sum + entry.value, 0);
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
                  investmentData.map((entry, idx) => (
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
          {investmentData.map((entry) => (
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
