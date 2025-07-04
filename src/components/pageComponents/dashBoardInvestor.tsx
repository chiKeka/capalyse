'use client';
import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import { OverviewHeaderCard } from '@/components/sections/dashboardCards/overviewHeaderCard';
import ReadinessScoreCard from '@/components/sections/dashboardCards/readinessScoreCard';
import { routes } from '@/lib/routes';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '../ui/card';
import { useRouter } from 'next/navigation';
import { CIcons } from '../ui/CIcons';
import { formatCurrency } from '@/lib/uitils/fns';
import ResourceCard from '../sections/dashboardCards/ResourceCard';

const learningCards = [
  {
    id: 1,
    href: '/',
    category: 'AgriTech',
    header: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    image: '/images/resource.png',
  },
  {
    id: 2,
    category: 'AgriTech',
    href: '/',
    header: 'Trading Across Africa: How AfCFTA Is Changing the Game',
    image: '/images/resource.png',
  },
];
const overviewCards = [
  {
    id: 1,
    icon: CIcons.walletMoney,
    label: 'Total Amount Invested',
    amount: 0,
    currency: 'NGN',
    percentage: 0,
    direction: 'up',
  },
  {
    id: 2,
    icon: CIcons.profile2,
    label: 'Total Verified SMEs',
    amount: 0,
  },
  {
    id: 3,
    icon: CIcons.profile2,
    label: 'Active SMEs',
    amount: 0,
  },
];
export default function InvestorDashBoard() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={30}
        link={routes.investor.smeDirectory}
        user={{ name: 'Paul' }}
        textContent="Here's a snapshot of active SMEs, matches, and opportunities."
        showButton={true}
        buttonText="View SMEs"
        buttonProps={{
          className: 'max-w-max',
          variant: 'primary',
          iconPosition: 'right',
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-6">
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
                    (card.direction === 'up' ? (
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <ReadinessScoreCard scoreValue={5} />

        <div className="flex flex-col w-full">
          <DashboardCardLayout
            caption="Resources"
            link={routes.investor.resources}
            linkName="See all Resources"
          >
            <div className="flex gap-4 my-8 flex-col lg:flex-row items-start ">
              {learningCards.map((card, idx) => (
                <ResourceCard key={idx} {...card} />
              ))}
            </div>
          </DashboardCardLayout>
        </div>
      </div>
    </div>
  );
}
