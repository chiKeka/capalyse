"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { CIcons } from "@/components/ui/CIcons";
import {
  useImpactSummary,
  useImpactByCountry,
  useImpactMonthly,
  useDevOrgAnalytics,
} from "@/hooks/useImpactTracking";
import { formatCurrency } from "@/lib/uitils/fns";
import { cn } from "@/lib/utils";
import { format, subDays } from "date-fns";
import {
  Calendar,
  Download,
  Globe,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  MapPin,
  Activity,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { BarChart } from "./barchart";
import { PieChart } from "./pieChart";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ── Types ──────────────────────────────────────────────────────────────────

type OverviewCard = {
  id: number;
  label: string;
  amount: number;
  formattedAmount?: string;
  percentage?: number;
  direction: "up" | "down";
  icon: any;
  icon2: any;
};

type ActiveTab = "overview" | "countries" | "trends";

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "NGN", label: "NGN (₦)" },
  { value: "KES", label: "KES (KSh)" },
  { value: "GHS", label: "GHS (GH₵)" },
  { value: "ZAR", label: "ZAR (R)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
];

const DATE_RANGES = [
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "180", label: "Last 6 months" },
  { value: "365", label: "Last 12 months" },
];

// ── CSV Export Utility ─────────────────────────────────────────────────────

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ── Monthly Trend Chart (inline SVG) ───────────────────────────────────────

function MonthlyTrendChart({
  data,
  currency,
}: {
  data: { month: string; amount: { amount: number; currency: string }; smesCount?: number }[];
  currency: string;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No monthly data available for the selected period.
      </div>
    );
  }

  const values = data.map((d) => d.amount?.amount ?? 0);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const chartWidth = 800;
  const chartHeight = 280;
  const paddingLeft = 70;
  const paddingRight = 30;
  const paddingTop = 20;
  const paddingBottom = 60;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * plotWidth;
    const y = paddingTop + plotHeight - ((d.amount?.amount ?? 0) - minValue) / range * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

  // Y-axis grid lines
  const gridLines = 5;
  const yTicks = Array.from({ length: gridLines + 1 }, (_, i) => {
    const value = minValue + (range / gridLines) * i;
    const y = paddingTop + plotHeight - (i / gridLines) * plotHeight;
    return { value, y };
  });

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {yTicks.map((tick, i) => (
        <g key={i}>
          <line
            x1={paddingLeft}
            y1={tick.y}
            x2={chartWidth - paddingRight}
            y2={tick.y}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray={i === 0 ? "0" : "4,4"}
          />
          <text
            x={paddingLeft - 10}
            y={tick.y + 4}
            textAnchor="end"
            fill="#6b7280"
            fontSize="11"
            fontFamily="system-ui"
          >
            {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(0)}k` : tick.value.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="url(#greenGradient)" />

      {/* Gradient definition */}
      <defs>
        <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#008060" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#008060" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Line */}
      <path d={linePath} fill="none" stroke="#008060" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="#008060" stroke="white" strokeWidth="2" />
          {/* X-axis label */}
          <text
            x={p.x}
            y={chartHeight - paddingBottom + 20}
            textAnchor="middle"
            fill="#6b7280"
            fontSize="10"
            fontFamily="system-ui"
            transform={`rotate(-30, ${p.x}, ${chartHeight - paddingBottom + 20})`}
          >
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Country Flag Emoji Helper ──────────────────────────────────────────────

function getCountryFlag(countryName: string): string {
  const flagMap: Record<string, string> = {
    "Nigeria": "🇳🇬", "Kenya": "🇰🇪", "Ghana": "🇬🇭", "South Africa": "🇿🇦",
    "Tanzania": "🇹🇿", "Uganda": "🇺🇬", "Rwanda": "🇷🇼", "Ethiopia": "🇪🇹",
    "Cameroon": "🇨🇲", "Senegal": "🇸🇳", "Egypt": "🇪🇬", "Morocco": "🇲🇦",
    "Tunisia": "🇹🇳", "Côte d'Ivoire": "🇨🇮", "Ivory Coast": "🇨🇮",
    "Mozambique": "🇲🇿", "Zambia": "🇿🇲", "Zimbabwe": "🇿🇼", "Botswana": "🇧🇼",
    "Namibia": "🇳🇦", "Mali": "🇲🇱", "Burkina Faso": "🇧🇫", "Niger": "🇳🇪",
    "Malawi": "🇲🇼", "Angola": "🇦🇴", "DRC": "🇨🇩", "Congo": "🇨🇬",
  };
  return flagMap[countryName] ?? "🌍";
}

// ── Page Component ─────────────────────────────────────────────────────────

function ImpactTrackingPage() {
  const [summaryDays, setSummaryDays] = useState("365");
  const [currency, setCurrency] = useState("USD");
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const dateFrom = useMemo(
    () => format(subDays(new Date(), Number(summaryDays)), "yyyy-MM-dd"),
    [summaryDays],
  );
  const dateTo = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const queryParams = useMemo(
    () => ({ from: dateFrom, to: dateTo, currency }),
    [dateFrom, dateTo, currency],
  );

  // ── Data Queries ───────────────────────────────────────────────────────

  const { data: summaryStat, isLoading: summaryLoading } = useImpactSummary(queryParams);

  const { data: countryData, isLoading: countryLoading } = useImpactByCountry(queryParams);

  const { data: monthlyRaw, isLoading: monthlyLoading } = useImpactMonthly({
    ...queryParams,
    includeZeros: true,
  });

  const { data: analytics } = useDevOrgAnalytics();

  const monthlyData = useMemo(() => {
    if (!monthlyRaw) return [];
    return Array.isArray(monthlyRaw) ? monthlyRaw : (monthlyRaw as any)?.data ?? [];
  }, [monthlyRaw]);

  // ── KPI Summary Cards ─────────────────────────────────────────────────

  const kpiCards = useMemo(() => {
    const totalSMEs = summaryStat?.totalFundedSMEs ?? 0;
    const totalAmount = summaryStat?.totalAmount?.amount ?? 0;
    const countriesCount = countryData?.items?.length ?? summaryStat?.countriesImpacted ?? 0;
    const activePrograms = analytics?.activePrograms ?? summaryStat?.activePrograms ?? 0;

    return [
      {
        id: 1,
        label: "Total SMEs Reached",
        value: totalSMEs.toLocaleString(),
        icon: Users,
        color: "text-[#008060]",
        bgColor: "bg-[#008060]/10",
      },
      {
        id: 2,
        label: "Total Funding Disbursed",
        value: formatCurrency(totalAmount, 0, 0, currency),
        icon: DollarSign,
        color: "text-[#008060]",
        bgColor: "bg-[#008060]/10",
      },
      {
        id: 3,
        label: "Countries Impacted",
        value: String(countriesCount),
        icon: Globe,
        color: "text-[#008060]",
        bgColor: "bg-[#008060]/10",
      },
      {
        id: 4,
        label: "Active Programs",
        value: String(activePrograms),
        icon: Activity,
        color: "text-[#008060]",
        bgColor: "bg-[#008060]/10",
      },
    ];
  }, [summaryStat, countryData, analytics, currency]);

  // ── Legacy Overview Cards (preserved from original) ────────────────────

  const overviewCards: OverviewCard[] = useMemo(() => {
    return [
      {
        id: 1,
        label: "Total SMEs Funded",
        amount: summaryStat?.totalFundedSMEs ?? 0,
        percentage: 0,
        direction: "up",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
      {
        id: 2,
        label: "Total Amount",
        amount: summaryStat?.totalAmount?.amount ?? 0,
        formattedAmount: formatCurrency(
          summaryStat?.totalAmount?.amount ?? 0,
          0,
          2,
          summaryStat?.totalAmount?.currency ?? currency,
        ),
        percentage: 0,
        direction: "up",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
      {
        id: 3,
        label: "Average Funded",
        amount: summaryStat?.averageFunded ?? 0,
        formattedAmount: formatCurrency(
          summaryStat?.averageFunded ?? 0,
          0,
          2,
          currency,
        ),
        percentage: 0,
        direction: "up",
        icon: CIcons.chars,
        icon2: CIcons.bars,
      },
    ];
  }, [summaryStat, currency]);

  // ── CSV Export ─────────────────────────────────────────────────────────

  const handleExportCSV = useCallback(() => {
    const rows: string[] = [];

    // Summary section
    rows.push("Impact Tracking Report");
    rows.push(`Period,${dateFrom} to ${dateTo}`);
    rows.push(`Currency,${currency}`);
    rows.push("");

    // KPI Summary
    rows.push("KPI Summary");
    rows.push("Metric,Value");
    kpiCards.forEach((kpi) => {
      rows.push(`${kpi.label},"${kpi.value}"`);
    });
    rows.push("");

    // Country Breakdown
    if (countryData?.items?.length) {
      rows.push("Country Breakdown");
      rows.push("Country,Amount,Percentage,SMEs Reached,Programs Active");
      countryData.items.forEach((item) => {
        rows.push(
          `${item.country},${item.amount?.amount ?? 0},${item.percentage ?? 0}%,${item.smesReached ?? "-"},${item.programsActive ?? "-"}`,
        );
      });
      rows.push("");
    }

    // Monthly Trends
    if (monthlyData.length) {
      rows.push("Monthly Trends");
      rows.push("Month,Amount,SMEs Count");
      monthlyData.forEach((item: any) => {
        rows.push(
          `${item.month},${item.amount?.amount ?? 0},${item.smesCount ?? "-"}`,
        );
      });
    }

    downloadCSV(`impact-report-${dateFrom}-to-${dateTo}.csv`, rows.join("\n"));
  }, [dateFrom, dateTo, currency, kpiCards, countryData, monthlyData]);

  // ── Tab Config ─────────────────────────────────────────────────────────

  const tabs: { key: ActiveTab; label: string; icon: typeof Globe }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "countries", label: "By Country", icon: MapPin },
    { key: "trends", label: "Monthly Trends", icon: TrendingUp },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Page Header & Controls ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impact Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your development programs&apos; impact across regions and time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={summaryDays} onValueChange={setSummaryDays}>
              <SelectTrigger className="w-[160px] border rounded-lg">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[130px] border rounded-lg">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((cur) => (
                  <SelectItem key={cur.value} value={cur.value}>
                    {cur.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Button */}
          <Button
            variant="secondary"
            size="small"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── KPI Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.id} className="shadow-none border hover:shadow-md transition-shadow">
              <CardContent className="flex items-start gap-4 py-5 px-5">
                <div className={cn("p-2.5 rounded-lg", kpi.bgColor)}>
                  <Icon className={cn("h-5 w-5", kpi.color)} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm text-muted-foreground font-medium truncate">
                    {kpi.label}
                  </span>
                  <span className="text-2xl font-bold text-gray-900 truncate">
                    {summaryLoading ? (
                      <span className="inline-block w-20 h-7 bg-gray-100 animate-pulse rounded" />
                    ) : (
                      kpi.value
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer",
                activeTab === tab.key
                  ? "border-[#008060] text-[#008060]"
                  : "border-transparent text-muted-foreground hover:text-gray-700 hover:border-gray-300",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Original summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {overviewCards.map((card: OverviewCard) => (
              <Card key={card.id} className="min-h-[155px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <div className="flex items-center gap-2 justify-between">
                    <div className="flex flex-row gap-2 w-fit items-center rounded-full bg-[#FFFFFF]/50 text-green p-2">
                      {card.icon2()}
                      <span className="font-medium text-base text-[#7A7A9D]">{card.label}</span>
                    </div>
                    <Select
                      value={summaryDays}
                      onValueChange={setSummaryDays}
                    >
                      <SelectTrigger className="w-fit border-none rounded-lg">
                        <SelectValue placeholder="Range" defaultValue={summaryDays} />
                      </SelectTrigger>
                      <SelectContent>
                        {DATE_RANGES.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <span className="xl:text-5xl lg:text-4xl text-3xl font-bold">
                      {card.formattedAmount ?? card.amount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bar chart */}
          <div className="w-full">
            <BarChart />
          </div>

          {/* Pie chart */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PieChart />

            {/* Quick Country Summary in overview */}
            <Card className="shadow-none">
              <CardContent className="py-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base lg:text-lg font-bold">Country Breakdown</h3>
                  <Badge variant="outline" className="text-[#008060] border-[#008060]">
                    {countryData?.items?.length ?? 0} countries
                  </Badge>
                </div>
                {countryLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : countryData?.items?.length ? (
                  <div className="space-y-3">
                    {countryData.items.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getCountryFlag(item.country)}</span>
                          <span className="text-sm font-medium text-gray-700">{item.country}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">
                            {formatCurrency(item.amount?.amount ?? 0, 0, 0, item.amount?.currency ?? currency)}
                          </span>
                          <Badge className="bg-[#008060]/10 text-[#008060] border-0 text-xs">
                            {item.percentage ?? 0}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(countryData.items.length > 5) && (
                      <button
                        onClick={() => setActiveTab("countries")}
                        className="text-sm text-[#008060] font-medium hover:underline cursor-pointer"
                      >
                        View all {countryData.items.length} countries
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No country data available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Countries Tab */}
      {activeTab === "countries" && (
        <div className="space-y-6">
          {/* Total amount header */}
          {countryData?.totalAmount && (
            <Card className="shadow-none bg-[#008060]/5 border-[#008060]/20">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Impact Across All Countries</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(
                      countryData.totalAmount.amount,
                      0,
                      0,
                      countryData.totalAmount.currency ?? currency,
                    )}
                  </p>
                </div>
                <Badge className="bg-[#008060] text-white border-0 w-fit">
                  {countryData.items?.length ?? 0} countries
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Country cards grid */}
          {countryLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg border" />
              ))}
            </div>
          ) : countryData?.items?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {countryData.items.map((item, index) => (
                <Card
                  key={index}
                  className="shadow-none hover:shadow-md transition-shadow border"
                >
                  <CardContent className="py-5 px-5 space-y-4">
                    {/* Country header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCountryFlag(item.country)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{item.country}</h4>
                          {item.countryCode && (
                            <span className="text-xs text-muted-foreground">{item.countryCode}</span>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-[#008060]/10 text-[#008060] border-0">
                        {item.percentage ?? 0}%
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#008060] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(item.percentage ?? 0, 100)}%` }}
                      />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Funding Disbursed</p>
                        <p className="text-sm font-semibold">
                          {formatCurrency(item.amount?.amount ?? 0, 0, 0, item.amount?.currency ?? currency)}
                        </p>
                      </div>
                      {item.smesReached !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">SMEs Reached</p>
                          <p className="text-sm font-semibold">{item.smesReached}</p>
                        </div>
                      )}
                      {item.programsActive !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">Programs Active</p>
                          <p className="text-sm font-semibold">{item.programsActive}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-none">
              <CardContent className="py-12 text-center">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No country breakdown data available for the selected period.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Monthly Trends Tab */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          {/* Trend Chart */}
          <Card className="shadow-none">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base lg:text-lg font-bold">Funding Disbursed Over Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Monthly funding trend for the selected period
                  </p>
                </div>
                <Badge variant="outline" className="text-[#008060] border-[#008060]">
                  {monthlyData.length} months
                </Badge>
              </div>

              {monthlyLoading ? (
                <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
              ) : (
                <MonthlyTrendChart data={monthlyData} currency={currency} />
              )}
            </CardContent>
          </Card>

          {/* Monthly Data Table */}
          <Card className="shadow-none">
            <CardContent className="py-5">
              <h3 className="text-base lg:text-lg font-bold mb-4">Monthly Breakdown</h3>

              {monthlyLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : monthlyData.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Month</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Amount</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.map((item: any, index: number) => {
                        const prevAmount = index > 0 ? (monthlyData[index - 1] as any)?.amount?.amount ?? 0 : 0;
                        const currentAmount = item.amount?.amount ?? 0;
                        const change = index > 0 && prevAmount > 0
                          ? ((currentAmount - prevAmount) / prevAmount) * 100
                          : 0;

                        return (
                          <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{item.month}</td>
                            <td className="py-3 px-4 text-right font-semibold">
                              {formatCurrency(currentAmount, 0, 0, item.amount?.currency ?? currency)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              {index > 0 ? (
                                <span
                                  className={cn(
                                    "text-xs font-medium px-2 py-0.5 rounded-full",
                                    change >= 0
                                      ? "bg-green-50 text-green-700"
                                      : "bg-red-50 text-red-700",
                                  )}
                                >
                                  {change >= 0 ? "+" : ""}
                                  {change.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No monthly data available for the selected period.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ImpactTrackingPage;
