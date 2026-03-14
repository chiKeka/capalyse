"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  useGetReadinessScore,
  useGetScoreHistory,
  useGetScoreAnalytics,
  useGetScoreInsight,
} from "@/hooks/useReadiness";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  TrendingUpIcon,
  ClipboardListIcon,
  CalendarIcon,
  LightbulbIcon,
  BarChart2Icon,
  HistoryIcon,
  AlertCircleIcon,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getScoreColor = (score: number) => {
  if (score >= 75) return "text-green";
  if (score >= 50) return "text-yellow-600";
  return "text-red-500";
};

const getScoreBg = (score: number) => {
  if (score >= 75) return "bg-[#F4FFFC] border-[#ABD2C7] text-green";
  if (score >= 50) return "bg-yellow-50 border-yellow-200 text-yellow-700";
  return "bg-red-50 border-red-200 text-red-600";
};

const getScoreStatus = (score: number) => {
  if (score >= 75) return "Strong";
  if (score >= 50) return "Moderate";
  return "Needs Work";
};

const getPriorityBadge = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-700 border-green-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-xl bg-gray-100 h-[120px]", className)} />
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-100", className)} />;
}

// ─── Empty State ─────────────────────────────────────────────────────────────

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

// ─── Circular Progress ───────────────────────────────────────────────────────

function CircularScore({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "#009872" : score >= 50 ? "#ca8a04" : "#ef4444";

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-3xl font-bold leading-none", getScoreColor(score))}>
          {score}
        </span>
        <span className="text-xs text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReadinessAnalyticsPage() {
  const { data: readinessData, isLoading: scoreLoading } = useGetReadinessScore();
  const { data: historyData, isLoading: historyLoading } = useGetScoreHistory();
  const { data: analyticsData, isLoading: analyticsLoading } = useGetScoreAnalytics();
  const { data: insightData, isLoading: insightLoading } = useGetScoreInsight();

  const overallScore = readinessData?.overallScore?.percentage ?? 0;
  const categoryBreakdown = readinessData?.categoryBreakdown ?? [];
  const recommendations = readinessData?.recommendations ?? [];
  const lastAssessmentDate = readinessData?.lastAssessmentDate;

  // History items — support both array at root or nested under data/history
  const historyItems: any[] = Array.isArray(historyData)
    ? historyData
    : Array.isArray(historyData?.data)
      ? historyData.data
      : Array.isArray(historyData?.history)
        ? historyData.history
        : [];

  // Analytics extras (server may return richer data)
  const analyticsExtras = analyticsData ?? {};

  // Insights — support both array at root or nested
  const insights: any[] = Array.isArray(insightData)
    ? insightData
    : Array.isArray(insightData?.data)
      ? insightData.data
      : Array.isArray(insightData?.insights)
        ? insightData.insights
        : recommendations; // fall back to recommendations from score response

  // Derive trend from history
  const latestTwo = historyItems.slice(-2);
  const scoreDiff =
    latestTwo.length === 2
      ? (latestTwo[1]?.overallScore ?? latestTwo[1]?.score ?? 0) -
        (latestTwo[0]?.overallScore ?? latestTwo[0]?.score ?? 0)
      : 0;

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.overview,
      label: "Current Score",
      value: scoreLoading ? null : overallScore,
      suffix: "%",
      badge: scoreLoading ? null : getScoreStatus(overallScore),
      badgeClass: scoreLoading ? "" : getScoreBg(overallScore),
    },
    {
      id: 2,
      icon: CIcons.linearGraph,
      label: "Score Trend",
      value: scoreLoading || historyLoading ? null : Math.abs(scoreDiff),
      suffix: scoreDiff !== 0 ? "pts" : "",
      direction: scoreDiff > 0 ? "up" : scoreDiff < 0 ? "down" : "neutral",
    },
    {
      id: 3,
      icon: CIcons.portfolioIcon,
      label: "Total Assessments",
      value: historyLoading ? null : historyItems.length,
    },
    {
      id: 4,
      icon: CIcons.readiness,
      label: "Last Assessment",
      value:
        scoreLoading ? null : lastAssessmentDate
          ? format(new Date(lastAssessmentDate), "MMM d, yyyy")
          : "Not taken",
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#18181B]">Readiness Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your investment readiness over time and identify areas for improvement.
        </p>
      </div>

      {/* ── Overview Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreLoading || historyLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          overviewCards.map((card) => (
            <Card key={card.id} className="min-h-[120px] shadow-none">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <span className="font-bold text-sm text-[#18181B]">{card.label}</span>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-3xl font-bold text-[#18181B]">
                      {card.value !== null && card.value !== undefined
                        ? `${card.value}${card.suffix ?? ""}`
                        : "—"}
                    </span>
                    {card.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium rounded-full border w-fit",
                          card.badgeClass,
                        )}
                      >
                        {card.badge}
                      </span>
                    )}
                    {card.direction && (
                      <div className="flex items-center gap-1">
                        {card.direction === "up" ? (
                          <ArrowUpIcon className="w-3.5 h-3.5 text-green" />
                        ) : card.direction === "down" ? (
                          <ArrowDownIcon className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <MinusIcon className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-medium",
                            card.direction === "up"
                              ? "text-green"
                              : card.direction === "down"
                                ? "text-red-500"
                                : "text-gray-400",
                          )}
                        >
                          {card.direction === "neutral" ? "No change" : card.direction}
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
          ))
        )}
      </div>

      {/* ── Score Overview + Category Breakdown ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        {/* Circular score card */}
        <Card className="shadow-none min-w-[220px]">
          <CardContent className="flex flex-col items-center justify-center py-6 gap-3 h-full">
            <span className="font-bold text-sm text-[#18181B] self-start w-full">
              Overall Score
            </span>
            {scoreLoading ? (
              <SkeletonBlock className="w-36 h-36 rounded-full" />
            ) : (
              <CircularScore score={overallScore} />
            )}
            {!scoreLoading && (
              <span
                className={cn(
                  "px-3 py-1 text-sm font-semibold rounded-full border",
                  getScoreBg(overallScore),
                )}
              >
                {readinessData?.overallScore?.status ?? getScoreStatus(overallScore)}
              </span>
            )}
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <Card className="shadow-none">
          <CardContent className="py-4 h-full">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2Icon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Category Breakdown</span>
            </div>

            {scoreLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <SkeletonBlock className="h-3.5 w-32" />
                    <SkeletonBlock className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : categoryBreakdown.length === 0 ? (
              <EmptyState
                icon={<BarChart2Icon className="w-10 h-10" />}
                title="No breakdown available"
                description="Complete your assessment to see your score breakdown by category."
              />
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((cat: any) => {
                  const pct = cat.percentage ?? 0;
                  const barColor =
                    pct >= 75 ? "bg-green" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-[#18181B]">
                          {cat.name ?? cat.category}
                        </span>
                        <span className={cn("font-bold text-xs", getScoreColor(pct))}>
                          {pct}%
                        </span>
                      </div>
                      <ProgressBar value={pct} color={barColor} />
                      {cat.description && (
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Score History ─────────────────────────────────────────────────── */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <HistoryIcon className="w-4 h-4 text-green" />
            <span className="font-bold text-sm text-[#18181B]">Score History</span>
          </div>

          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-4 flex-1" />
                  <SkeletonBlock className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : historyItems.length === 0 ? (
            <EmptyState
              icon={<HistoryIcon className="w-10 h-10" />}
              title="No history yet"
              description="Your assessment history will appear here once you complete your first assessment."
            />
          ) : (
            <div className="space-y-0 divide-y divide-gray-100">
              {[...historyItems].reverse().map((item: any, index: number) => {
                const score = item.overallScore ?? item.score ?? item.percentage ?? 0;
                const prevItem = [...historyItems].reverse()[index + 1];
                const prevScore = prevItem
                  ? (prevItem.overallScore ?? prevItem.score ?? prevItem.percentage ?? 0)
                  : null;
                const diff = prevScore !== null ? score - prevScore : null;
                const date = item.calculatedAt ?? item.createdAt ?? item.date;

                return (
                  <div
                    key={item.id ?? item._id ?? index}
                    className="flex items-center gap-4 py-3"
                  >
                    <div className="flex flex-col min-w-[100px]">
                      <span className="text-xs font-medium text-[#18181B]">
                        {date ? format(new Date(date), "MMM d, yyyy") : "—"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {date
                          ? formatDistanceToNow(new Date(date), { addSuffix: true })
                          : ""}
                      </span>
                    </div>

                    <div className="flex-1">
                      <ProgressBar
                        value={score}
                        color={
                          score >= 75 ? "bg-green" : score >= 50 ? "bg-yellow-500" : "bg-red-500"
                        }
                      />
                    </div>

                    <div className="flex items-center gap-1.5 min-w-[60px] justify-end">
                      <span className={cn("text-sm font-bold", getScoreColor(score))}>
                        {score}%
                      </span>
                      {diff !== null && diff !== 0 && (
                        <div
                          className={cn(
                            "flex items-center gap-0.5 text-xs font-medium",
                            diff > 0 ? "text-green" : "text-red-500",
                          )}
                        >
                          {diff > 0 ? (
                            <ArrowUpIcon className="w-3 h-3" />
                          ) : (
                            <ArrowDownIcon className="w-3 h-3" />
                          )}
                          {Math.abs(diff)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Analytics Section ─────────────────────────────────────────────── */}
      {!analyticsLoading && analyticsExtras && Object.keys(analyticsExtras).length > 0 && (
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUpIcon className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-[#18181B]">Analytics</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analyticsExtras)
                .filter(
                  ([key]) =>
                    !["success", "smeId", "id", "_id"].includes(key) &&
                    typeof (analyticsExtras as any)[key] !== "object",
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] space-y-0.5"
                  >
                    <p className="text-xs text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-lg font-bold text-green">{String(value)}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Insights & Recommendations ────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <LightbulbIcon className="w-4 h-4 text-green" />
          <span className="font-bold text-sm text-[#18181B]">Insights & Recommendations</span>
        </div>

        {insightLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-none">
                <CardContent className="py-4 space-y-3">
                  <SkeletonBlock className="h-4 w-20" />
                  <SkeletonBlock className="h-5 w-3/4" />
                  <SkeletonBlock className="h-3.5 w-full" />
                  <SkeletonBlock className="h-3.5 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="py-4">
              <EmptyState
                icon={<LightbulbIcon className="w-10 h-10" />}
                title="No insights yet"
                description="Complete your assessment to receive personalised insights and recommendations."
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight: any, index: number) => {
              const priority = insight.priority ?? "medium";
              const actionItems: string[] = insight.actionItems ?? insight.actions ?? [];

              return (
                <Card
                  key={insight.id ?? insight._id ?? index}
                  className="shadow-none hover:shadow-sm transition-shadow"
                >
                  <CardContent className="py-4 space-y-3">
                    {/* Priority + Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 text-[11px] font-semibold rounded-full border capitalize",
                          getPriorityBadge(priority),
                        )}
                      >
                        {priority} priority
                      </span>
                      {insight.category && (
                        <span className="px-2 py-0.5 text-[11px] rounded-full bg-gray-100 text-gray-600 border border-gray-200 capitalize">
                          {insight.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="font-semibold text-sm text-[#18181B]">
                      {insight.title ?? insight.recommendation ?? "Recommendation"}
                    </p>

                    {/* Description */}
                    {insight.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.description}
                      </p>
                    )}

                    {/* Impact */}
                    {(insight.estimatedImpact ?? insight.impact) !== undefined && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <AlertCircleIcon className="w-3 h-3 text-green" />
                        <span className="text-muted-foreground">
                          Potential score increase:
                        </span>
                        <span className="font-semibold text-green">
                          +{insight.estimatedImpact ?? insight.impact} pts
                        </span>
                      </div>
                    )}

                    {/* Action items */}
                    {actionItems.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-gray-100">
                        <p className="text-xs font-semibold text-[#18181B] flex items-center gap-1.5">
                          <ClipboardListIcon className="w-3.5 h-3.5 text-green" />
                          Action items
                        </p>
                        <ul className="space-y-1">
                          {actionItems.map((action: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sub-Category Drill-Down ────────────────────────────────────────── */}
      {!scoreLoading && categoryBreakdown.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2Icon className="w-4 h-4 text-green" />
            <span className="font-bold text-sm text-[#18181B]">Detailed Sub-Category Scores</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {categoryBreakdown.map((cat: any) => {
              const subCats = cat.subCategories ?? [];
              if (subCats.length === 0) return null;
              return (
                <Card key={cat.category} className="shadow-none">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-sm text-[#18181B]">
                        {cat.name ?? cat.category}
                      </p>
                      <span className={cn("text-xs font-bold", getScoreColor(cat.percentage ?? 0))}>
                        {cat.percentage ?? 0}%
                      </span>
                    </div>
                    <div className="space-y-3">
                      {subCats.map((sub: any, i: number) => {
                        const pct = sub.percentage ?? 0;
                        const barColor =
                          pct >= 75 ? "bg-green" : pct >= 50 ? "bg-yellow-500" : "bg-red-500";
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{sub.name}</span>
                              <span className={cn("font-semibold", getScoreColor(pct))}>
                                {pct}%
                              </span>
                            </div>
                            <ProgressBar value={pct} color={barColor} />
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
