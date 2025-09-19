'use client';
import DashboardCardLayout from '@/components/layout/dashboardCardLayout';
import { OverviewHeaderCard } from '@/components/sections/dashboardCards/overviewHeaderCard';
import {
  ProfileData,
  useGetInvestorsAnalytics,
} from '@/hooks/useProfileManagement';
import { useGetReadinessScore } from '@/hooks/useReadiness';
import { useGetResources } from '@/hooks/useResources';
import { routes } from '@/lib/routes';
import { formatCurrency, formatInvestmentData } from '@/lib/uitils/fns';
import { useParams, useRouter } from 'next/navigation';
import EmptyBox from '../sections/dashboardCards/emptyBox';
import ResourceCard from '../sections/dashboardCards/ResourceCard';
import { Card, CardContent } from '../ui/card';
import { CIcons } from '../ui/CIcons';
import InvestmentOpportunitiesCard from '../InvesmentOpportunitiesCard';

export default function InvestorDashBoard() {
  const router = useRouter();
  const params = useParams();
  const { data: resources } = useGetResources();
  // Fetch readiness score data
  const { data: readinessData, isLoading: isReadinessLoading } =
    useGetReadinessScore();
  const { data: user } = ProfileData();
  const { data: investorsAnalytics } = useGetInvestorsAnalytics();
  console.log({ investorsAnalytics });
  const investmentData = formatInvestmentData(
    investorsAnalytics?.investmentOpportunities ?? []
  );
  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: 'Total Amount Invested',
      amount: investorsAnalytics?.totalAmountInvested ?? 0,
      currency: 'NGN',
      percentage: 0,
      direction: 'up',
    },
    {
      id: 2,
      icon: CIcons.profile2,
      label: 'Total Verified SMEs',
      amount: investorsAnalytics?.totalPlatformSMEs ?? 0,
    },
    {
      id: 3,
      icon: CIcons.profile2,
      label: 'Active SMEs',
      amount: investorsAnalytics?.activeSMEs ?? 0,
    },
  ];
  return (
    <div className="flex flex-col w-full gap-6 h-auto">
      <OverviewHeaderCard
        value={30}
        link={routes.investor.smeDirectory}
        user={{ name: user?.personalInfo?.lastName }}
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
        <InvestmentOpportunitiesCard
          caption="Investor Opportunities by Sector"
          investmentData={investmentData}
        />

        <div className="flex flex-col w-full">
          <DashboardCardLayout
            caption="Resources"
            link={routes.investor.resources}
            linkName="See all Resources"
          >
            <div className="flex gap-4 my-8 flex-col lg:flex-row items-start ">
              {!resources?.resources || resources.resources.length === 0 ? (
                <EmptyBox
                  caption="No Learning Resources Available"
                  caption2="There are currently no learning resources available. Check back later for new content."
                  showButton={false}
                />
              ) : (
                resources.resources
                  .slice(0, 2)
                  .map((card: any, idx: any) => (
                    <ResourceCard key={idx} {...card} />
                  ))
              )}
            </div>
          </DashboardCardLayout>
        </div>
      </div>
    </div>
  );
}
