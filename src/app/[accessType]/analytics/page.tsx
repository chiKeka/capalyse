"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  useGetInvestorAnalytics,
  useGetInvestmentAnalytics,
  useGetInvestorPortfolioSummary,
} from "@/hooks/investors/useInvestorAnalytics";
import { useSentInvestmentInterest, useInvestmentPipeline } from "@/hooks/useInvesmentInterest";
import { formatCurrency } from "@/lib/uitils/fns";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  PieChartIcon,
  BarChart2Icon,
  BriefcaseIcon,
  ActivityIcon,
  DollarSignIcon,
} from "lucide-react";

// ---- Helpers ----------------------------------------------------------------

const getChangeIndicator = (value: number) => {
  if (value > 0) return { icon: ArrowUpIcon, color: "text-green", label: `+${value}%` };
  if (value < 0) return { icon: ArrowDownIcon, color: "text-red-500", label: `${value}%` };
  return { icon: null, color: "text-gray-400", label: "0%" };
};

function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100 h-[120px]", className)} />;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-100", className)} />;
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <p className="font-semibold text-base mb-1">{title}</p>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}

function ProgressBar({ value, color = "bg-green" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={cn("h-2 rounded-full transition-all duration-500", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ---- Main Page --------------------------------------------------------------

export default function InvestorAnalyticsPage() {
  const { data: analyticsData, isLoading: analyticsLoading } = useGetInvestorAnalytics();
  const { data: investmentData, isLoading: investmentLoading } = useGetInvestmentAnalytics();
  const { data: portfolioData, isLoading: portfolioLoading } = useGetInvestorPortfolioSummary();
  const { data: sentInterests, isLoading: sentLoading } = useSentInvestmentInterest();
  const { data: pipeline, isLoading: pipelineLoading } = useInvestmentPipeline();

  const isLoading = analyticsLoading || investmentLoading || portfolioLoading;

  // Safely extract nested data (APIs may return { data: ... } or flat)
  const analytics = analyticsData?.data ?? analyticsData ?? {};
  const investments = investmentData?.data ?? investmentData ?? {};
  const portfolio = portfolioData?.data ?? portfolioData ?? {};

  // Portfolio metrics
  const totalInvested = portfolio?.totalInvested ?? portfolio?.totalAmount ?? 0;
  const totalReturns = portfolio?.totalReturns ?? portfolio?.returns ?? 0;
  const portfolioCurrency = portfolio?.currency ?? "USD";
  const portfolioCount = portfolio?.count ?? portfolio?.totalInvestments ?? 0;
  const roi = portfolio?.roi ?? (totalInvested > 0 ? ((totalReturns / totalInvested) * 100) : 0);

  // Pipeline / interest counts
  const sentCount = Array.isArray(sentInterests) ? sentInterests.length : 0;
  const pipelineItems = Array.isArray(pipeline) ? pipeline : [];
  const activeDeals = pipelineItems.filter(
    (d: any) => d.status === "accepted" || d.status === "in_progress" || d.status === "due_diligence",
  ).length;
  const pendingDeals = pipelineItems.filter((d: any) => d.status === "pending").length;

  // Analytics extras (match rate, activity stats, etc.)
  const matchRate = analytics?.matchRate ?? analytics?.match_rate ?? null;
  const totalMatches = analytics?.totalMatches ?? analytics?.total_matches ?? null;
  const responseRate = analytics?.responseRate ?? analytics?.response_rate ?? null;

  // Investment allocation breakdown
  const allocation: { name: string; value: number; percentage: number }[] =
    portfolio?.allocation ??
    portfolio?.sectorAllocation ??
    investments?.allocation ??
    [];

  // Overview stat cards
  const overviewCards = [
    {
      id: 1,
      icon: CIcons.portfolioIcon,
      label: "Total Invested",
      value: isLoading ? null : formatCurrency(totalInvested, 0, 0, portfolioCurrency),
    },
    {
      id: 2,
      icon: CIcons.walletMoney,
      label: "Total Returns",
      value: isLoading ? null : formatCurrency(totalReturns, 0, 0, portfolioCurrency),
      change: roi,
    },
    {
      id: 3,
      icon: CIcons.overview,
      label: "Active Investments",
      value: isLoading ? null : portfolioCount,
    },
    {
      id: 4,
      icon: CIcons.heartTick,
      label: "Interests Sent",
      value: sentLoading ? null : sentCount,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#18181B]">Investor Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your investment performance, pipeline activity, and portfolio metrics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading || sentLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          overviewCards.map((card) => {
            const change = card.change != null ? getChangeIndicator(Number(card.change.toFixed(1))) : null;
            return (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm text-[#18181B]">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-3xl font-bold text-[#18181B]">
                        {card.value !== null && card.value !== undefined ? card.value : "\u2014"}
                      </span>
                      {change && (
                        <div className="flex items-center gap-1">
                          {change.icon && <change.icon className={cn("w-3.5 h-3.5", change.color)} />}
                          <span className={cn("text-xs font-medium", change.color)}>
                            {change.label} ROI
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2 shrink-0">
                      {card.icon()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pipeline Overview + Portfolio Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <ActivityIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Pipeline Overview</span>
            </div>

            {pipelineLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : pipelineItems.length === 0 ? (
              <EmptyState
                icon={<BriefcaseIcon className="w-10 h-10" />}
                title="No pipeline activity"
                description="Your investment pipeline will appear here once you express interest in SMEs."
              />
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Pending", count: pendingDeals, color: "bg-yellow-500" },
                  { label: "Active / In Progress", count: activeDeals, color: "bg-green" },
                  {
                    label: "Declined",
                    count: pipelineItems.filter((d: any) => d.status === "declined").length,
                    color: "bg-red-500",
                  },
                  {
                    label: "Completed",
                    count: pipelineItems.filter(
                      (d: any) => d.status === "completed" || d.status === "invested",
                    ).length,
                    color: "bg-blue-500",
                  },
                ].map((stage) => {
                  const pct = pipelineItems.length > 0 ? (stage.count / pipelineItems.length) * 100 : 0;
                  return (
                    <div key={stage.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#18181B]">{stage.label}</span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {stage.count} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <ProgressBar value={pct} color={stage.color} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Allocation */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Portfolio Allocation</span>
            </div>

            {portfolioLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : allocation.length === 0 ? (
              <EmptyState
                icon={<PieChartIcon className="w-10 h-10" />}
                title="No allocation data"
                description="Portfolio allocation will appear here once you have active investments."
              />
            ) : (
              <div className="space-y-4">
                {allocation.map((item: any, index: number) => {
                  const pct = item.percentage ?? 0;
                  return (
                    <div key={item.name ?? index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#18181B]">{item.name}</span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {pct.toFixed(1)}%
                          {item.value != null && (
                            <span className="ml-1 text-muted-foreground">
                              ({formatCurrency(item.value, 0, 0, portfolioCurrency)})
                            </span>
                          )}
                        </span>
                      </div>
                      <ProgressBar value={pct} color="bg-green" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Match & Activity Metrics */}
      {!analyticsLoading && (matchRate !== null || totalMatches !== null || responseRate !== null) && (
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUpIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Match & Activity Metrics</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchRate !== null && (
                <div className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] space-y-0.5">
                  <p className="text-xs text-muted-foreground">Match Rate</p>
                  <p className="text-lg font-bold text-green">{matchRate}%</p>
                </div>
              )}
              {totalMatches !== null && (
                <div className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] space-y-0.5">
                  <p className="text-xs text-muted-foreground">Total Matches</p>
                  <p className="text-lg font-bold text-green">{totalMatches}</p>
                </div>
              )}
              {responseRate !== null && (
                <div className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] space-y-0.5">
                  <p className="text-xs text-muted-foreground">Response Rate</p>
                  <p className="text-lg font-bold text-green">{responseRate}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Analytics (dynamic key-value from API) */}
      {!investmentLoading &&
        investments &&
        Object.keys(investments).length > 0 && (
          <Card className="shadow-none">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2Icon className="w-4 h-4 text-green" />
                <span className="font-bold text-sm text-[#18181B]">Investment Analytics</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(investments)
                  .filter(
                    ([key, val]) =>
                      !["success", "data", "allocation", "id", "_id"].includes(key) &&
                      typeof val !== "object",
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] space-y-0.5"
                    >
                      <p className="text-xs text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                      </p>
                      <p className="text-lg font-bold text-green">{String(value)}</p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* If everything is loaded and there's truly nothing */}
      {!isLoading &&
        !sentLoading &&
        !pipelineLoading &&
        totalInvested === 0 &&
        portfolioCount === 0 &&
        sentCount === 0 &&
        pipelineItems.length === 0 &&
        allocation.length === 0 &&
        matchRate === null &&
        totalMatches === null && (
          <Card className="shadow-none">
            <CardContent className="py-4">
              <EmptyState
                icon={<DollarSignIcon className="w-12 h-12" />}
                title="No analytics data yet"
                description="Start exploring the SME directory and express interest in businesses to see your analytics here."
              />
            </CardContent>
          </Card>
        )}
    </div>
  );
}
