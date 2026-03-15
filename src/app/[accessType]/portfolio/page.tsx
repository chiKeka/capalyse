"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReusableTable } from "@/components/ui/table";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import {
  useGetInvestorPortfolioSummary,
  useInvestments,
} from "@/hooks/useInvestments";
import { useInvestmentROI } from "@/hooks/investors/useInvestmentAnalytics";
import { formatCurrency } from "@/lib/uitils/fns";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DownloadIcon,
  Loader2Icon,
  MessageSquareIcon,
  FolderOpenIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Stage helpers
// ---------------------------------------------------------------------------
const STAGE_LABELS: Record<string, string> = {
  discovered: "Discovery",
  discovery: "Discovery",
  interested: "Interested",
  screening: "Screening",
  due_diligence: "Due Diligence",
  negotiation: "Negotiation",
  invested: "Closed/Won",
  closed: "Closed/Won",
  exited: "Exited",
  closed_lost: "Closed/Lost",
};

const STAGE_COLORS: Record<string, string> = {
  discovered: "bg-blue-100 text-blue-800",
  discovery: "bg-blue-100 text-blue-800",
  interested: "bg-blue-100 text-blue-800",
  screening: "bg-purple-100 text-purple-800",
  due_diligence: "bg-yellow-100 text-yellow-800",
  negotiation: "bg-orange-100 text-orange-800",
  invested: "bg-green-100 text-green-800",
  closed: "bg-green-100 text-green-800",
  exited: "bg-gray-100 text-gray-800",
  closed_lost: "bg-red-100 text-red-800",
};

const BAR_PALETTE = [
  "#008060",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

// ---------------------------------------------------------------------------
// Tab filter options
// ---------------------------------------------------------------------------
type TabKey = "all" | "active" | "due_diligence" | "closed";
const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "due_diligence", label: "In Due Diligence" },
  { key: "closed", label: "Closed" },
];

function matchesTab(investment: any, tab: TabKey) {
  if (tab === "all") return true;
  const stage = (investment?.stage || investment?.status || "discovered").toLowerCase();
  if (tab === "active")
    return ["discovered", "discovery", "interested", "screening", "negotiation"].includes(stage);
  if (tab === "due_diligence") return stage === "due_diligence";
  if (tab === "closed") return ["invested", "closed", "exited", "closed_lost"].includes(stage);
  return true;
}

// ---------------------------------------------------------------------------
// CSV Export
// ---------------------------------------------------------------------------
function exportCSV(investments: any[]) {
  const headers = [
    "Name",
    "Industry",
    "Country",
    "Stage",
    "Investment Amount",
    "Readiness Score",
    "Revenue",
    "Team Size",
    "Last Updated",
  ];
  const rows = investments.map((inv) => [
    inv.metadata?.name ?? "",
    inv.metadata?.industry ?? "",
    inv.metadata?.location ?? "",
    STAGE_LABELS[inv.stage || inv.status || "discovered"] ?? inv.stage ?? "",
    inv.amount ?? inv.metadata?.investmentAmount ?? "",
    inv.metadata?.readiness?.overallScore ?? "",
    inv.metadata?.totalRevenue ?? "",
    inv.metadata?.teamSize ?? "",
    inv.updatedAt ? format(new Date(inv.updatedAt), "yyyy-MM-dd") : "",
  ]);

  const csvContent = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `portfolio-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
function PortfolioPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const { data: portfolioSummary, isLoading: isPortfolioSummaryLoading } =
    useGetInvestorPortfolioSummary();
  const { data: investments = [], isLoading } = useInvestments();
  const { data: industries = [] } = useIndustries();
  const { data: roiData } = useInvestmentROI();

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  // Filtered investments
  const filteredInvestments = useMemo(() => {
    return investments.filter((investment: any) => {
      const matchesSearch =
        !debouncedSearch ||
        investment?.metadata?.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        investment?.metadata?.industry?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        investment?.metadata?.location?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesIndustry =
        industryFilter === "all" ||
        investment?.metadata?.industry?.toLowerCase() === industryFilter.toLowerCase();
      return matchesSearch && matchesIndustry && matchesTab(investment, activeTab);
    });
  }, [investments, debouncedSearch, industryFilter, activeTab]);

  // Computed: sector allocation from investments
  const sectorAllocation = useMemo(() => {
    if (!investments.length) return [];
    const map: Record<string, number> = {};
    for (const inv of investments) {
      const sector = inv.metadata?.industry || "Other";
      map[sector] = (map[sector] || 0) + 1;
    }
    const total = investments.length;
    return Object.entries(map)
      .map(([sector, count]) => ({
        sector,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [investments]);

  // Computed: stage distribution
  const stageDistribution = useMemo(() => {
    if (!investments.length) return [];
    const map: Record<string, number> = {};
    for (const inv of investments) {
      const stage = inv.stage || inv.status || "discovered";
      const label = STAGE_LABELS[stage] || stage;
      map[label] = (map[label] || 0) + 1;
    }
    return Object.entries(map)
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count);
  }, [investments]);

  // Computed: avg readiness
  const avgReadiness = useMemo(() => {
    const scores = investments
      .map((i: any) => i.metadata?.readiness?.overallScore)
      .filter((s: any) => typeof s === "number");
    if (!scores.length) return 0;
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  }, [investments]);

  const openDetail = useCallback((investment: any) => {
    setSelectedInvestment(investment);
    setDialogOpen(true);
  }, []);

  // ---- Table columns -------------------------------------------------------
  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <button
          type="button"
          className="flex items-center gap-2 hover:underline text-left"
          onClick={() => openDetail(row)}
        >
          {row.avatar ? (
            <Image
              src={row.avatar}
              alt={row.metadata?.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[#F4FFFC] flex items-center justify-center text-xs font-bold text-[#008060]">
              {(row.metadata?.name ?? "?")[0]}
            </div>
          )}
          <span className="font-medium text-sm text-[#008060]">{row.metadata?.name ?? "-"}</span>
        </button>
      ),
    },
    {
      header: "Industry",
      accessor: (row: any) => row.metadata?.industry ?? "-",
    },
    {
      header: "Country",
      accessor: (row: any) => row.metadata?.location ?? "-",
    },
    {
      header: "Stage",
      accessor: (row: any) => {
        const stage = row.stage || row.status || "discovered";
        return (
          <Badge
            className={cn("text-[11px] font-medium", STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-700")}
          >
            {STAGE_LABELS[stage] ?? stage}
          </Badge>
        );
      },
    },
    {
      header: "Investment Amount",
      accessor: (row: any) => {
        const amount = row.amount ?? row.metadata?.investmentAmount;
        if (!amount) return "-";
        return formatCurrency(Number(amount), 0, 0, row.currency || portfolioSummary?.totalAmountInvested?.currency || "NGN");
      },
    },
    {
      header: "Readiness Score",
      accessor: (row: any) => {
        const score = row.metadata?.readiness?.overallScore;
        if (score == null) return "-";
        return (
          <span className={cn("font-semibold", score >= 70 ? "text-green-700" : score >= 40 ? "text-yellow-700" : "text-red-600")}>
            {score}%
          </span>
        );
      },
    },
    {
      header: "Revenue",
      accessor: (row: any) => row.metadata?.totalRevenue ?? "-",
    },
    {
      header: "Team Size",
      accessor: (row: any) => row.metadata?.teamSize ?? "-",
    },
    {
      header: "Last Update",
      accessor: (row: any) =>
        row.updatedAt ? format(new Date(row.updatedAt), "MMM dd, yyyy") : "-",
    },
  ];

  // ---- Overview cards -------------------------------------------------------
  const overviewCards = useMemo(() => {
    return [
      {
        id: 1,
        icon: CIcons.walletMoney,
        label: "Total Amount Invested",
        amount: portfolioSummary?.totalAmountInvested?.amount ?? 0,
        currency: portfolioSummary?.totalAmountInvested?.currency ?? "NGN",
      },
      {
        id: 2,
        icon: CIcons.stickyNote,
        label: "Total Investments",
        amount: portfolioSummary?.totalInvestments ?? 0,
      },
      {
        id: 3,
        icon: CIcons.profile2,
        label: "Active Investments",
        amount: portfolioSummary?.activeInvestments ?? 0,
      },
      {
        id: 4,
        icon: CIcons.badgeCheck,
        label: roiData?.roi != null ? "Portfolio ROI" : "Avg Readiness Score",
        amount: roiData?.roi != null ? roiData.roi : avgReadiness,
        suffix: "%",
      },
    ];
  }, [portfolioSummary, roiData, avgReadiness]);

  // ---- Render ---------------------------------------------------------------
  return (
    <div>
      {/* ===== KPI Cards ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isPortfolioSummaryLoading ? (
          <div className="col-span-full flex items-center justify-center h-40">
            <Loader2Icon className="w-12 h-12 animate-spin text-[#008060]" />
          </div>
        ) : (
          overviewCards.map((card) => (
            <Card
              key={card.id}
              className="min-h-[140px] shadow-none border-l-4 border-l-[#008060] bg-white"
            >
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <span className="font-bold text-sm text-gray-600">{card.label}</span>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-3xl lg:text-4xl font-bold text-[#18181B]">
                    {card.currency
                      ? formatCurrency(card.amount, 0, 0, card.currency)
                      : `${card.amount}${card.suffix ?? ""}`}
                  </span>
                  <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-[#008060] rounded-md p-2 shrink-0">
                    {card.icon()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ===== Portfolio Allocation ===== */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* By Sector */}
          <Card className="shadow-none">
            <CardContent className="py-5 px-6">
              <h3 className="font-bold text-base text-[#18181B] mb-4">Allocation by Sector</h3>
              <div className="space-y-3">
                {sectorAllocation.length === 0 && (
                  <p className="text-sm text-gray-400">No sector data available</p>
                )}
                {sectorAllocation.map((item, idx) => (
                  <div key={item.sector} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-28 truncate shrink-0">
                      {item.sector}
                    </span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(item.percentage, 4)}%`,
                          backgroundColor: BAR_PALETTE[idx % BAR_PALETTE.length],
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-12 text-right">
                      {item.percentage}% <span className="text-gray-400">({item.count})</span>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Stage */}
          <Card className="shadow-none">
            <CardContent className="py-5 px-6">
              <h3 className="font-bold text-base text-[#18181B] mb-4">Distribution by Stage</h3>
              <div className="space-y-3">
                {stageDistribution.length === 0 && (
                  <p className="text-sm text-gray-400">No stage data available</p>
                )}
                {stageDistribution.map((item, idx) => {
                  const maxCount = stageDistribution[0]?.count || 1;
                  const pct = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={item.stage} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 w-28 truncate shrink-0">
                        {item.stage}
                      </span>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, 6)}%`,
                            backgroundColor: BAR_PALETTE[idx % BAR_PALETTE.length],
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== Portfolio Table Header ===== */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Portfolio Summary
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-[#008060]">
              {filteredInvestments.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center flex-wrap justify-end">
          <Button
            variant="secondary"
            size="small"
            onClick={() => exportCSV(investments)}
          >
            <DownloadIcon className="w-4 h-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ===== Tab Filters ===== */}
      <div className="flex items-center gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
              activeTab === tab.key
                ? "border-[#008060] text-[#008060]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Filters Row ===== */}
      <div className="flex gap-2 items-center w-full mb-4 flex-wrap">
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SearchForm
          className="w-full sm:w-auto md:min-w-sm"
          inputClassName="h-11 pl-9"
          iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
      </div>

      {/* ===== Table ===== */}
      <ReusableTable
        columns={columns}
        data={filteredInvestments}
        totalPages={Math.ceil(filteredInvestments.length / 10) || 1}
        loading={isLoading}
        noDataText="No investments found. Adjust your filters or explore new opportunities."
        noDataCaption="No investments found"
      />

      {/* ===== Investment Detail Dialog ===== */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedInvestment && (
            <InvestmentDetailContent
              investment={selectedInvestment}
              currency={portfolioSummary?.totalAmountInvested?.currency || "NGN"}
              onClose={() => setDialogOpen(false)}
              router={router}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Investment Detail Dialog Content
// ---------------------------------------------------------------------------
function InvestmentDetailContent({
  investment,
  currency,
  onClose,
  router,
}: {
  investment: any;
  currency: string;
  onClose: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const meta = investment.metadata ?? {};
  const stage = investment.stage || investment.status || "discovered";
  const amount = investment.amount ?? meta.investmentAmount;
  const readinessScore = meta.readiness?.overallScore;

  return (
    <>
      <DialogHeader>
        <div className="flex items-start gap-4">
          {investment.avatar ? (
            <Image
              src={investment.avatar}
              alt={meta.name ?? "Business"}
              width={48}
              height={48}
              className="rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#F4FFFC] flex items-center justify-center text-lg font-bold text-[#008060] shrink-0">
              {(meta.name ?? "?")[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl">{meta.name ?? "Unknown Business"}</DialogTitle>
            <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
              {meta.industry && (
                <Badge className="bg-[#F4FFFC] text-[#008060] border-[#ABD2C7] text-xs">
                  {meta.industry}
                </Badge>
              )}
              <Badge
                className={cn(
                  "text-xs font-medium",
                  STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-700",
                )}
              >
                {STAGE_LABELS[stage] ?? stage}
              </Badge>
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
        <MetricCard
          label="Investment Amount"
          value={amount ? formatCurrency(Number(amount), 0, 0, currency) : "-"}
        />
        <MetricCard
          label="Readiness Score"
          value={readinessScore != null ? `${readinessScore}%` : "-"}
          highlight={readinessScore != null}
          highlightColor={
            readinessScore >= 70
              ? "text-green-700"
              : readinessScore >= 40
                ? "text-yellow-700"
                : "text-red-600"
          }
        />
        <MetricCard label="Team Size" value={meta.teamSize ?? "-"} />
        <MetricCard label="Revenue" value={meta.totalRevenue ?? "-"} />
        <MetricCard label="Country" value={meta.location ?? "-"} />
        <MetricCard
          label="Last Updated"
          value={
            investment.updatedAt
              ? format(new Date(investment.updatedAt), "MMM dd, yyyy")
              : "-"
          }
        />
      </div>

      {/* Business Summary */}
      {meta.description && (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-gray-700 mb-1">Business Summary</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>
        </div>
      )}

      {/* Recent Activity placeholder */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity</h4>
        <div className="space-y-2">
          {investment.updatedAt && (
            <ActivityItem
              text={`Investment updated`}
              date={format(new Date(investment.updatedAt), "MMM dd, yyyy HH:mm a")}
            />
          )}
          {investment.createdAt && (
            <ActivityItem
              text={`Investment created`}
              date={format(new Date(investment.createdAt), "MMM dd, yyyy HH:mm a")}
            />
          )}
          {!investment.updatedAt && !investment.createdAt && (
            <p className="text-sm text-gray-400">No recent activity</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-5">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Investor Notes</h4>
        <textarea
          className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#008060]/30 focus:border-[#008060]"
          placeholder="Add your private notes about this investment..."
          defaultValue={investment.notes ?? ""}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
        <Button
          variant="primary"
          size="small"
          onClick={() => {
            onClose();
            router.push(
              `/investor/deal-flow?investment=${investment._id || investment.id}`,
            );
          }}
        >
          <FolderOpenIcon className="w-4 h-4 mr-1.5" />
          View Due Diligence Room
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={() => {
            onClose();
            router.push("/investor/messages");
          }}
        >
          <MessageSquareIcon className="w-4 h-4 mr-1.5" />
          Message
        </Button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------
function MetricCard({
  label,
  value,
  highlight,
  highlightColor,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={cn("text-sm font-semibold text-[#18181B]", highlight && highlightColor)}>
        {value}
      </p>
    </div>
  );
}

function ActivityItem({ text, date }: { text: string; date: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-2 h-2 rounded-full bg-[#008060] shrink-0" />
      <span className="text-sm text-gray-600 flex-1">{text}</span>
      <span className="text-xs text-gray-400 shrink-0">{date}</span>
    </div>
  );
}

export default PortfolioPage;
