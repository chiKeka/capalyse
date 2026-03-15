"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import {
  useGetInvestorAnalytics,
  useGetInvestmentAnalytics,
  useGetInvestorPortfolioSummary,
} from "@/hooks/investors/useInvestorAnalytics";
import { useSentInvestmentInterest, useInvestmentPipeline } from "@/hooks/useInvesmentInterest";
import {
  useInvestmentPipelineAnalytics,
  useInvestmentActivity,
  usePortfolioBreakdown,
  useDealVelocity,
  useInvestmentROI,
} from "@/hooks/investors/useInvestmentAnalytics";
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
  DownloadIcon,
  ClockIcon,
  TargetIcon,
  ArrowRightIcon,
  GlobeIcon,
  LayersIcon,
} from "lucide-react";
import { useCallback, useMemo } from "react";

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

const STAGE_LABELS: Record<string, string> = {
  discovered: "Discovery",
  interested: "Screening",
  screening: "Screening",
  due_diligence: "Due Diligence",
  negotiation: "Negotiation",
  invested: "Closed",
  closed: "Closed",
  exited: "Exited",
};

const STAGE_COLORS: Record<string, string> = {
  discovered: "#64748b",
  interested: "#3b82f6",
  screening: "#3b82f6",
  due_diligence: "#f59e0b",
  negotiation: "#8b5cf6",
  invested: "#008060",
  closed: "#008060",
  exited: "#6b7280",
};

const SECTOR_COLORS = [
  "#008060",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

// ---- Inline SVG Charts ------------------------------------------------------

function FunnelChart({
  stages,
}: {
  stages: { stage: string; count: number; value: number }[];
}) {
  if (!stages || stages.length === 0) return null;
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 8);
        const color = STAGE_COLORS[stage.stage] || "#008060";
        return (
          <div key={stage.stage} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#18181B]">
                {STAGE_LABELS[stage.stage] || stage.stage.replace(/_/g, " ")}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {stage.count} deals
              </span>
            </div>
            <div className="relative h-8 w-full bg-gray-50 rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-700 flex items-center pl-3"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: color,
                  opacity: 0.85,
                }}
              >
                {stage.value > 0 && (
                  <span className="text-xs text-white font-medium truncate">
                    {formatCurrencySafe(stage.value)}
                  </span>
                )}
              </div>
            </div>
            {idx < stages.length - 1 && (
              <div className="flex justify-center">
                <ArrowDownIcon className="w-3.5 h-3.5 text-gray-300" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BarChart({
  data,
  barColor = "#008060",
}: {
  data: { label: string; value: number }[];
  barColor?: string;
}) {
  if (!data || data.length === 0) return null;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 160;

  return (
    <div className="flex items-end gap-2 h-[200px] pt-4 pb-6 relative">
      {/* Y-axis labels */}
      <div className="flex flex-col justify-between h-[160px] text-xs text-muted-foreground pr-1 w-8 shrink-0">
        <span>{maxVal}</span>
        <span>{Math.round(maxVal / 2)}</span>
        <span>0</span>
      </div>
      {/* Bars */}
      <div className="flex items-end gap-1.5 flex-1 h-[160px]">
        {data.map((item, idx) => {
          const barHeight = Math.max((item.value / maxVal) * chartHeight, 2);
          return (
            <div
              key={idx}
              className="flex flex-col items-center flex-1 gap-1"
            >
              <div className="w-full flex justify-center">
                <span className="text-[10px] font-bold text-[#18181B]">
                  {item.value > 0 ? item.value : ""}
                </span>
              </div>
              <div
                className="w-full rounded-t transition-all duration-500 min-w-[16px] max-w-[40px] mx-auto"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: barColor,
                  opacity: 0.85,
                }}
              />
              <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-[50px]">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CSSPieChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  if (!segments || segments.length === 0) return null;

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  // Build conic gradient stops
  let accumulated = 0;
  const gradientParts: string[] = [];
  for (const seg of segments) {
    const pct = (seg.value / total) * 100;
    gradientParts.push(`${seg.color} ${accumulated}% ${accumulated + pct}%`);
    accumulated += pct;
  }
  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="flex items-center gap-6">
      {/* Pie */}
      <div
        className="w-32 h-32 rounded-full shrink-0"
        style={{ background: gradient }}
      />
      {/* Legend */}
      <div className="space-y-2 flex-1 min-w-0">
        {segments.map((seg, idx) => {
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : "0";
          return (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate flex-1 text-[#18181B]">{seg.label}</span>
              <span className="text-xs font-bold text-muted-foreground shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VelocityChart({
  data,
}: {
  data: { stage: string; avgDays: number }[];
}) {
  if (!data || data.length === 0) return null;
  const maxDays = Math.max(...data.map((d) => d.avgDays), 1);
  const totalDays = data.reduce((sum, d) => sum + d.avgDays, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">
          Total avg. cycle: <span className="font-bold text-[#18181B]">{totalDays} days</span>
        </span>
      </div>
      {data.map((item) => {
        const pct = Math.max((item.avgDays / maxDays) * 100, 4);
        const color = STAGE_COLORS[item.stage] || "#008060";
        return (
          <div key={item.stage} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[#18181B]">
                {STAGE_LABELS[item.stage] || item.stage.replace(/_/g, " ")}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                {item.avgDays} {item.avgDays === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- Utility ----------------------------------------------------------------

function formatCurrencySafe(value: number, currency = "USD") {
  try {
    return formatCurrency(value, 0, 0, currency);
  } catch {
    return `$${value.toLocaleString()}`;
  }
}

// ---- Export Report ----------------------------------------------------------

function generateCSVReport(data: {
  pipelineData: any;
  activityData: any;
  roiData: any;
  breakdownData: any;
  velocityData: any;
}) {
  const lines: string[] = [];
  lines.push("Capalyse Investment Analytics Report");
  lines.push(`Generated: ${new Date().toLocaleDateString()}`);
  lines.push("");

  // ROI Section
  if (data.roiData) {
    lines.push("--- ROI Metrics ---");
    lines.push(`Total Invested,${data.roiData.totalInvested}`);
    lines.push(`Total Returns,${data.roiData.totalReturns}`);
    lines.push(`ROI,${data.roiData.roi}%`);
    if (data.roiData.irr != null) lines.push(`IRR,${data.roiData.irr}%`);
    lines.push(`Multiple,${data.roiData.multiple}x`);
    lines.push("");
  }

  // Pipeline Section
  if (data.pipelineData?.stages) {
    lines.push("--- Pipeline Stages ---");
    lines.push("Stage,Deals,Value");
    for (const stage of data.pipelineData.stages) {
      lines.push(
        `${STAGE_LABELS[stage.stage] || stage.stage},${stage.count},${stage.value}`,
      );
    }
    lines.push("");

    if (data.pipelineData.conversionRates?.length > 0) {
      lines.push("--- Conversion Rates ---");
      lines.push("From,To,Rate");
      for (const cr of data.pipelineData.conversionRates) {
        lines.push(
          `${STAGE_LABELS[cr.from] || cr.from},${STAGE_LABELS[cr.to] || cr.to},${cr.rate}%`,
        );
      }
      lines.push("");
    }
  }

  // Activity Section
  if (data.activityData?.length > 0) {
    lines.push("--- Monthly Activity ---");
    lines.push("Month,Deals,Amount");
    for (const item of data.activityData) {
      lines.push(`${item.month},${item.deals},${item.amount}`);
    }
    lines.push("");
  }

  // Velocity Section
  if (data.velocityData?.length > 0) {
    lines.push("--- Deal Velocity ---");
    lines.push("Stage,Avg Days");
    for (const item of data.velocityData) {
      lines.push(
        `${STAGE_LABELS[item.stage] || item.stage},${item.avgDays}`,
      );
    }
    lines.push("");
  }

  // Sector Breakdown
  if (data.breakdownData?.sectors?.length > 0) {
    lines.push("--- Sector Breakdown ---");
    lines.push("Sector,Count,Value,Percentage");
    for (const item of data.breakdownData.sectors) {
      lines.push(
        `${item.sector || item.name},${item.count},${item.value},${item.percentage}%`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ---- Main Page --------------------------------------------------------------

export default function InvestorAnalyticsPage() {
  // Existing hooks
  const { data: analyticsData, isLoading: analyticsLoading } = useGetInvestorAnalytics();
  const { data: investmentData, isLoading: investmentLoading } = useGetInvestmentAnalytics();
  const { data: portfolioData, isLoading: portfolioLoading } = useGetInvestorPortfolioSummary();
  const { data: sentInterests, isLoading: sentLoading } = useSentInvestmentInterest();
  const { data: pipeline, isLoading: pipelineLoading } = useInvestmentPipeline();

  // New enhanced hooks
  const { data: pipelineAnalytics, isLoading: pipelineAnalyticsLoading } =
    useInvestmentPipelineAnalytics();
  const { data: activityData, isLoading: activityLoading } = useInvestmentActivity({
    months: 6,
  });
  const { data: breakdownData, isLoading: breakdownLoading } = usePortfolioBreakdown();
  const { data: velocityData, isLoading: velocityLoading } = useDealVelocity();
  const { data: roiData, isLoading: roiLoading } = useInvestmentROI();

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

  // Pipeline analytics
  const pipelineStages = pipelineAnalytics?.stages ?? [];
  const conversionRates = pipelineAnalytics?.conversionRates ?? [];

  // Activity data for bar chart
  const activityChartData = useMemo(() => {
    if (!activityData || !Array.isArray(activityData)) return [];
    return activityData.map((item: any) => ({
      label: item.month,
      value: item.deals,
    }));
  }, [activityData]);

  // Sector pie chart data
  const sectorPieData = useMemo(() => {
    const sectors = breakdownData?.sectors ?? allocation ?? [];
    return sectors.map((item: any, idx: number) => ({
      label: item.sector || item.name || `Sector ${idx + 1}`,
      value: item.value ?? item.count ?? item.percentage ?? 0,
      color: SECTOR_COLORS[idx % SECTOR_COLORS.length],
    }));
  }, [breakdownData?.sectors, allocation]);

  // Geography data
  const geographyData = useMemo(() => {
    return breakdownData?.geography ?? [];
  }, [breakdownData?.geography]);

  // Deal velocity
  const velocityItems = useMemo(() => {
    if (!velocityData) return [];
    return Array.isArray(velocityData) ? velocityData : [];
  }, [velocityData]);

  // Export handler
  const handleExportReport = useCallback(() => {
    const csv = generateCSVReport({
      pipelineData: pipelineAnalytics,
      activityData,
      roiData: roiData ?? {
        totalInvested,
        totalReturns,
        roi: Number(roi.toFixed?.(1) ?? roi),
        multiple: totalInvested > 0 ? Number((totalReturns / totalInvested).toFixed(2)) : 0,
        currency: portfolioCurrency,
      },
      breakdownData,
      velocityData: velocityItems,
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capalyse-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [
    pipelineAnalytics,
    activityData,
    roiData,
    totalInvested,
    totalReturns,
    roi,
    portfolioCurrency,
    breakdownData,
    velocityItems,
  ]);

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">Investor Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your investment performance, pipeline activity, and portfolio metrics.
          </p>
        </div>
        <Button
          variant="secondary"
          size="small"
          onClick={handleExportReport}
          className="shrink-0"
        >
          <DownloadIcon className="w-4 h-4 mr-1.5" />
          Export Report
        </Button>
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

      {/* ROI Tracking Cards */}
      {!roiLoading && roiData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-none border-l-4 border-l-green">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground mb-1">Portfolio ROI</p>
              <p className="text-2xl font-bold text-[#18181B]">
                {roiData.roi > 0 ? "+" : ""}
                {roiData.roi}%
              </p>
              <div className="flex items-center gap-1 mt-1">
                {roiData.roi > 0 ? (
                  <ArrowUpIcon className="w-3 h-3 text-green" />
                ) : roiData.roi < 0 ? (
                  <ArrowDownIcon className="w-3 h-3 text-red-500" />
                ) : null}
                <span className="text-xs text-muted-foreground">Return on investment</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none border-l-4 border-l-blue-400">
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground mb-1">Investment Multiple</p>
              <p className="text-2xl font-bold text-[#18181B]">{roiData.multiple}x</p>
              <span className="text-xs text-muted-foreground">MOIC</span>
            </CardContent>
          </Card>

          {roiData.irr != null && (
            <Card className="shadow-none border-l-4 border-l-purple-400">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground mb-1">IRR</p>
                <p className="text-2xl font-bold text-[#18181B]">{roiData.irr}%</p>
                <span className="text-xs text-muted-foreground">Internal rate of return</span>
              </CardContent>
            </Card>
          )}

          {(roiData.realizedGains > 0 || roiData.unrealizedGains > 0) && (
            <Card className="shadow-none border-l-4 border-l-amber-400">
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground mb-1">Realized Gains</p>
                <p className="text-2xl font-bold text-[#18181B]">
                  {formatCurrencySafe(roiData.realizedGains, roiData.currency)}
                </p>
                {roiData.unrealizedGains > 0 && (
                  <span className="text-xs text-muted-foreground">
                    + {formatCurrencySafe(roiData.unrealizedGains, roiData.currency)} unrealized
                  </span>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Pipeline Funnel + Conversion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <TargetIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Pipeline Funnel</span>
              {pipelineAnalytics?.totalDeals != null && (
                <Badge variant="outline" className="ml-auto text-xs">
                  {pipelineAnalytics.totalDeals} total deals
                </Badge>
              )}
            </div>

            {pipelineAnalyticsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : pipelineStages.length === 0 ? (
              <EmptyState
                icon={<TargetIcon className="w-10 h-10" />}
                title="No pipeline data"
                description="Your pipeline funnel will appear here once you have deals in the pipeline."
              />
            ) : (
              <FunnelChart stages={pipelineStages} />
            )}
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <ArrowRightIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Stage Conversion Rates</span>
            </div>

            {pipelineAnalyticsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : conversionRates.length === 0 ? (
              <EmptyState
                icon={<ArrowRightIcon className="w-10 h-10" />}
                title="No conversion data"
                description="Conversion rates between pipeline stages will appear here."
              />
            ) : (
              <div className="space-y-3">
                {conversionRates.map(
                  (cr: { from: string; to: string; rate: number }, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 text-sm min-w-0">
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0"
                          style={{
                            borderColor: STAGE_COLORS[cr.from] || "#008060",
                            color: STAGE_COLORS[cr.from] || "#008060",
                          }}
                        >
                          {STAGE_LABELS[cr.from] || cr.from}
                        </Badge>
                        <ArrowRightIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <Badge
                          variant="outline"
                          className="text-xs shrink-0"
                          style={{
                            borderColor: STAGE_COLORS[cr.to] || "#008060",
                            color: STAGE_COLORS[cr.to] || "#008060",
                          }}
                        >
                          {STAGE_LABELS[cr.to] || cr.to}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-green transition-all duration-500"
                            style={{ width: `${Math.min(cr.rate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-[#18181B] w-10 text-right">
                          {cr.rate}%
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deal Velocity + Monthly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deal Velocity */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Deal Velocity</span>
              <span className="text-xs text-muted-foreground ml-auto">Avg. days per stage</span>
            </div>

            {velocityLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : velocityItems.length === 0 ? (
              <EmptyState
                icon={<ClockIcon className="w-10 h-10" />}
                title="No velocity data"
                description="Deal velocity metrics will appear here once your pipeline has activity."
              />
            ) : (
              <VelocityChart data={velocityItems} />
            )}
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2Icon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Monthly Deal Activity</span>
              <span className="text-xs text-muted-foreground ml-auto">Last 6 months</span>
            </div>

            {activityLoading ? (
              <SkeletonBlock className="h-[200px] w-full" />
            ) : activityChartData.length === 0 ? (
              <EmptyState
                icon={<BarChart2Icon className="w-10 h-10" />}
                title="No activity data"
                description="Monthly investment activity will appear here once you start investing."
              />
            ) : (
              <BarChart data={activityChartData} barColor="#008060" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Allocation: Sector Pie + Geography + Deal Size */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation (Pie Chart) */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Sector Allocation</span>
            </div>

            {breakdownLoading || portfolioLoading ? (
              <SkeletonBlock className="h-40 w-full" />
            ) : sectorPieData.length === 0 ? (
              <EmptyState
                icon={<PieChartIcon className="w-10 h-10" />}
                title="No sector data"
                description="Portfolio sector allocation will appear here once you have active investments."
              />
            ) : (
              <CSSPieChart segments={sectorPieData} />
            )}
          </CardContent>
        </Card>

        {/* Geography Allocation */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <GlobeIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Geography Allocation</span>
            </div>

            {breakdownLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : geographyData.length === 0 ? (
              <EmptyState
                icon={<GlobeIcon className="w-10 h-10" />}
                title="No geography data"
                description="Geographic allocation breakdown will appear once you have investments across multiple regions."
              />
            ) : (
              <div className="space-y-4">
                {geographyData.map((item: any, index: number) => {
                  const pct = item.percentage ?? 0;
                  const color = SECTOR_COLORS[index % SECTOR_COLORS.length];
                  return (
                    <div key={item.country ?? index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#18181B]">{item.country}</span>
                        <span className="text-xs font-bold text-muted-foreground">
                          {pct.toFixed(1)}%
                          {item.value != null && (
                            <span className="ml-1 text-muted-foreground">
                              ({formatCurrencySafe(item.value, breakdownData?.currency)})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deal Size Breakdown (if available) */}
      {breakdownData?.dealSize?.length > 0 && (
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <LayersIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Deal Size Distribution</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {breakdownData.dealSize.map((item: any, index: number) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] space-y-0.5"
                >
                  <p className="text-xs text-muted-foreground">{item.range || item.label || item.name}</p>
                  <p className="text-lg font-bold text-green">
                    {item.count ?? item.value} {item.count != null ? "deals" : ""}
                  </p>
                  {item.percentage != null && (
                    <p className="text-xs text-muted-foreground">{item.percentage}% of portfolio</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Pipeline Overview + Portfolio Allocation (preserved) */}
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

        {/* Portfolio Allocation (original) */}
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
