"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  Dialog,
  DialogContent,
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
import {
  useRecievedInvestmentInterest,
  useSentInvestmentInterest,
  useInvestmentInterestMutations,
  useInvestmentPipeline,
} from "@/hooks/useInvesmentInterest";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  Loader2Icon,
  HandshakeIcon,
  TrendingUpIcon,
  TargetIcon,
  DollarSignIcon,
  BarChart3Icon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircle2Icon,
  ArchiveIcon,
  CalendarIcon,
  BuildingIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = "pipeline" | "active" | "archived" | "analytics";

type PipelineStage =
  | "discovered"
  | "due_diligence"
  | "negotiation"
  | "committed"
  | "disbursed";

interface PipelineItem {
  id?: string;
  _id?: string;
  sme?: any;
  investor?: any;
  status?: string;
  stage?: string;
  amount?: number;
  matchScore?: number;
  message?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActivity?: string;
  sector?: string;
  outcome?: string;
  notes?: string;
  finalAmount?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: "discovered", label: "Discovered", color: "bg-gray-100 text-gray-700" },
  { key: "due_diligence", label: "Due Diligence", color: "bg-blue-100 text-blue-700" },
  { key: "negotiation", label: "Negotiation", color: "bg-yellow-100 text-yellow-700" },
  { key: "committed", label: "Committed", color: "bg-emerald-100 text-emerald-700" },
  { key: "disbursed", label: "Disbursed", color: "bg-green-100 text-green-800" },
];

const SECTORS = [
  "All Sectors",
  "Technology",
  "Agriculture",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Energy",
  "Education",
  "Retail",
];

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "accepted":
    case "committed":
    case "disbursed":
      return "bg-green-100 text-green-800";
    case "pending":
    case "discovered":
      return "bg-yellow-100 text-yellow-800";
    case "declined":
    case "withdrawn":
    case "expired":
      return "bg-red-100 text-red-800";
    case "due_diligence":
      return "bg-blue-100 text-blue-800";
    case "negotiation":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (s: string) =>
  s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

const formatMoney = (n?: number) => {
  if (!n) return "$0";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

// ── Component ────────────────────────────────────────────────────────────────

export default function InvestmentInterestsPage() {
  const [tab, setTab] = useState<Tab>("pipeline");
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [sortField, setSortField] = useState<"date" | "amount" | "score">("date");
  const [selectedInterest, setSelectedInterest] = useState<PipelineItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: session } = useSession();
  const role = session?.user?.role;

  const { data: received = [], isLoading: receivedLoading } = useRecievedInvestmentInterest();
  const { data: sent = [], isLoading: sentLoading } = useSentInvestmentInterest();
  const { data: pipeline = [], isLoading: pipelineLoading } = useInvestmentPipeline();
  const { respondToInterest, withdrawInterest, requestDueDiligence } =
    useInvestmentInterestMutations();

  const allItems: PipelineItem[] = useMemo(
    () => [...(received || []), ...(sent || []), ...(pipeline || [])],
    [received, sent, pipeline],
  );

  const isLoading = receivedLoading || sentLoading || pipelineLoading;

  // ── KPI calculations ────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const total = allItems.length;
    const active = allItems.filter(
      (i) =>
        !["declined", "withdrawn", "expired", "disbursed"].includes(
          (i.status || i.stage || "").toLowerCase(),
        ),
    ).length;
    const converted = allItems.filter(
      (i) =>
        (i.status || i.stage || "").toLowerCase() === "disbursed" ||
        (i.status || i.stage || "").toLowerCase() === "committed",
    ).length;
    const amounts = allItems
      .map((i) => i.amount || i.finalAmount || 0)
      .filter((a) => a > 0);
    const avgDeal = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
    return { total, active, converted, avgDeal };
  }, [allItems]);

  // ── Pipeline grouping ──────────────────────────────────────────────────

  const pipelineGroups = useMemo(() => {
    const groups: Record<PipelineStage, PipelineItem[]> = {
      discovered: [],
      due_diligence: [],
      negotiation: [],
      committed: [],
      disbursed: [],
    };
    const items = [...(pipeline || []), ...(sent || [])];
    items.forEach((item: PipelineItem) => {
      const stage = (item.stage || item.status || "discovered").toLowerCase() as PipelineStage;
      if (groups[stage]) {
        groups[stage].push(item);
      } else {
        groups.discovered.push(item);
      }
    });
    return groups;
  }, [pipeline, sent]);

  // ── Active interests filtering ─────────────────────────────────────────

  const activeInterests = useMemo(() => {
    let items = allItems.filter(
      (i) =>
        !["declined", "withdrawn", "expired"].includes(
          (i.status || "").toLowerCase(),
        ),
    );
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.sme?.businessName?.toLowerCase().includes(q) ||
          i.investor?.organizationName?.toLowerCase().includes(q) ||
          i.sector?.toLowerCase().includes(q) ||
          i.status?.toLowerCase().includes(q),
      );
    }
    if (sectorFilter && sectorFilter !== "All Sectors") {
      items = items.filter(
        (i) =>
          (i.sme?.industry || i.sector || "").toLowerCase() ===
          sectorFilter.toLowerCase(),
      );
    }
    if (stageFilter) {
      items = items.filter(
        (i) => (i.stage || i.status || "").toLowerCase() === stageFilter,
      );
    }
    items.sort((a, b) => {
      if (sortField === "amount") return (b.amount || 0) - (a.amount || 0);
      if (sortField === "score") return (b.matchScore || 0) - (a.matchScore || 0);
      return (
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
    });
    return items;
  }, [allItems, search, sectorFilter, stageFilter, sortField]);

  // ── Archived interests ─────────────────────────────────────────────────

  const archivedInterests = useMemo(() => {
    return allItems.filter((i) =>
      ["declined", "withdrawn", "expired", "disbursed"].includes(
        (i.status || "").toLowerCase(),
      ),
    );
  }, [allItems]);

  // ── Analytics data ─────────────────────────────────────────────────────

  const funnelData = useMemo(() => {
    return STAGES.map((s) => ({
      ...s,
      count: pipelineGroups[s.key]?.length || 0,
    }));
  }, [pipelineGroups]);

  const sectorData = useMemo(() => {
    const map: Record<string, number> = {};
    allItems.forEach((i) => {
      const sector = i.sme?.industry || i.sector || "Other";
      map[sector] = (map[sector] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [allItems]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, number> = {};
    allItems.forEach((i) => {
      if (i.createdAt) {
        const key = format(new Date(i.createdAt), "MMM yyyy");
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([month, count]) => ({ month, count }))
      .slice(-6);
  }, [allItems]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleAccept = useCallback(
    (id: string) => {
      respondToInterest.mutate(
        { id, response: "accepted" },
        {
          onSuccess: () => toast.success("Interest accepted"),
          onError: () => toast.error("Failed to accept"),
        },
      );
    },
    [respondToInterest],
  );

  const handleDecline = useCallback(
    (id: string) => {
      respondToInterest.mutate(
        { id, response: "declined" },
        {
          onSuccess: () => toast.success("Interest declined"),
          onError: () => toast.error("Failed to decline"),
        },
      );
    },
    [respondToInterest],
  );

  const handleWithdraw = useCallback(
    (id: string) => {
      withdrawInterest.mutate(id, {
        onSuccess: () => toast.success("Interest withdrawn"),
        onError: () => toast.error("Failed to withdraw"),
      });
    },
    [withdrawInterest],
  );

  const handleDueDiligence = useCallback(
    (id: string) => {
      requestDueDiligence.mutate(id, {
        onSuccess: () => toast.success("Due diligence requested"),
        onError: () => toast.error("Failed to request due diligence"),
      });
    },
    [requestDueDiligence],
  );

  const openDetail = useCallback((item: PipelineItem) => {
    setSelectedInterest(item);
    setDetailOpen(true);
  }, []);

  // ── Columns for active interests table ─────────────────────────────────

  const activeColumns = [
    {
      header: "SME / Investor",
      accessor: (row: PipelineItem) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => openDetail(row)}
        >
          {(row.sme?.logo || row.investor?.logo) ? (
            <Image
              src={row.sme?.logo || row.investor?.logo}
              alt=""
              width={28}
              height={28}
              className="rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
              <BuildingIcon className="w-3.5 h-3.5 text-green" />
            </div>
          )}
          <div>
            <span className="font-medium text-sm block">
              {row.sme?.businessName || row.investor?.organizationName || "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.sme?.industry || row.sector || ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Amount",
      accessor: (row: PipelineItem) => (
        <span className="text-sm font-medium">{formatMoney(row.amount)}</span>
      ),
    },
    {
      header: "Stage",
      accessor: (row: PipelineItem) => (
        <Badge variant="status" className={cn("capitalize", getStatusClass(row.stage || row.status || ""))}>
          {formatStatus(row.stage || row.status || "")}
        </Badge>
      ),
    },
    {
      header: "Match Score",
      accessor: (row: PipelineItem) => {
        const score = row.matchScore || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  score >= 75 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-400",
                )}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{score}%</span>
          </div>
        );
      },
    },
    {
      header: "Last Activity",
      accessor: (row: PipelineItem) =>
        row.updatedAt || row.lastActivity
          ? formatDistanceToNow(new Date(row.updatedAt || row.lastActivity || ""), {
              addSuffix: true,
            })
          : "—",
    },
    {
      header: "Actions",
      accessor: (row: PipelineItem) => {
        const id = row.id || row._id || "";
        const status = (row.status || "").toLowerCase();
        return (
          <div className="flex gap-1.5">
            <Button variant="secondary" size="small" onClick={() => openDetail(row)}>
              View
            </Button>
            {status === "pending" && (
              <>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => handleAccept(id)}
                  state={respondToInterest.isPending ? "loading" : "default"}
                >
                  Accept
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => handleDecline(id)}
                  state={respondToInterest.isPending ? "loading" : "default"}
                >
                  Decline
                </Button>
              </>
            )}
            {status === "accepted" && (
              <Button
                variant="primary"
                size="small"
                onClick={() => handleDueDiligence(id)}
                state={requestDueDiligence.isPending ? "loading" : "default"}
              >
                Due Diligence
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // ── Archived table columns ─────────────────────────────────────────────

  const archivedColumns = [
    {
      header: "SME / Investor",
      accessor: (row: PipelineItem) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
            <BuildingIcon className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <span className="font-medium text-sm">
            {row.sme?.businessName || row.investor?.organizationName || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      header: "Outcome",
      accessor: (row: PipelineItem) => (
        <Badge
          variant="status"
          className={cn(
            "capitalize",
            (row.outcome || row.status) === "converted" || (row.outcome || row.status) === "disbursed"
              ? "bg-green-100 text-green-800"
              : (row.outcome || row.status) === "declined"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-700",
          )}
        >
          {formatStatus(row.outcome || row.status || "")}
        </Badge>
      ),
    },
    {
      header: "Final Amount",
      accessor: (row: PipelineItem) => (
        <span className="text-sm">{formatMoney(row.finalAmount || row.amount)}</span>
      ),
    },
    {
      header: "Date",
      accessor: (row: PipelineItem) =>
        row.createdAt
          ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
          : "—",
    },
    {
      header: "Notes",
      accessor: (row: PipelineItem) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.notes || row.message || "—"}
        </span>
      ),
    },
  ];

  // ── KPI cards ──────────────────────────────────────────────────────────

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Total Interests",
      amount: kpis.total,
      sub: "All pipeline",
      subIcon: <HandshakeIcon className="w-3.5 h-3.5" />,
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Active Pipeline",
      amount: kpis.active,
      sub: "In progress",
      subIcon: <TrendingUpIcon className="w-3.5 h-3.5" />,
    },
    {
      id: 3,
      icon: CIcons.profile2,
      label: "Converted",
      amount: kpis.converted,
      sub: "Committed / Disbursed",
      subIcon: <CheckCircle2Icon className="w-3.5 h-3.5" />,
    },
    {
      id: 4,
      icon: CIcons.walletMoney,
      label: "Avg Deal Size",
      amount: formatMoney(kpis.avgDeal),
      isString: true,
      sub: "Per interest",
      subIcon: <DollarSignIcon className="w-3.5 h-3.5" />,
    },
  ];

  // ── Tab definitions ────────────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      key: "pipeline",
      label: "Pipeline",
      icon: <TargetIcon className="w-4 h-4" />,
      count: (pipeline || []).length + (sent || []).length,
    },
    {
      key: "active",
      label: "Active Interests",
      icon: <TrendingUpIcon className="w-4 h-4" />,
      count: activeInterests.length,
    },
    {
      key: "archived",
      label: "Archived",
      icon: <ArchiveIcon className="w-4 h-4" />,
      count: archivedInterests.length,
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: <BarChart3Icon className="w-4 h-4" />,
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="min-h-[120px] shadow-none animate-pulse">
                <CardContent className="h-full py-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))
          : overviewCards.map((card) => (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <span className="text-4xl font-bold">
                        {card.isString ? card.amount : card.amount}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        {card.subIcon}
                        {card.sub}
                      </div>
                    </div>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                      {card.icon()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center my-8 justify-between max-lg:flex-wrap">
        <div className="flex items-center gap-3 mb-4 lg:mb-0 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition",
                tab === t.key
                  ? "bg-[#F4FFFC] text-green border border-green"
                  : "text-muted-foreground hover:bg-gray-100",
              )}
            >
              {t.icon}
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-green text-white">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters for active / archived tabs */}
        {(tab === "active" || tab === "archived") && (
          <div className="flex gap-2 items-center w-full lg:w-auto justify-end flex-wrap">
            <SearchForm
              className="w-full sm:w-auto md:min-w-[240px]"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
            <Select
              value={sectorFilter || "__all__"}
              onValueChange={(v) => setSectorFilter(v === "__all__" ? "" : v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s === "All Sectors" ? "__all__" : s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tab === "active" && (
              <>
                <Select
                  value={stageFilter || "__all__"}
                  onValueChange={(v) => setStageFilter(v === "__all__" ? "" : v)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Stages</SelectItem>
                    {STAGES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sortField}
                  onValueChange={(v) => setSortField(v as any)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Newest</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="score">Match Score</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* PIPELINE TAB */}
          {tab === "pipeline" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {STAGES.map((stage) => {
                const items = pipelineGroups[stage.key] || [];
                return (
                  <div key={stage.key} className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            stage.color,
                          )}
                        >
                          {stage.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {items.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-3 min-h-[200px]">
                      {items.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-lg p-4 text-center">
                          <p className="text-xs text-muted-foreground">
                            No items
                          </p>
                        </div>
                      ) : (
                        items.map((item: PipelineItem, idx: number) => (
                          <Card
                            key={item.id || item._id || idx}
                            className="shadow-none hover:shadow-sm transition cursor-pointer border border-gray-100"
                            onClick={() => openDetail(item)}
                          >
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                                  <BuildingIcon className="w-3 h-3 text-green" />
                                </div>
                                <span className="text-sm font-medium truncate">
                                  {item.sme?.businessName ||
                                    item.investor?.organizationName ||
                                    "Unknown"}
                                </span>
                              </div>
                              {item.amount ? (
                                <p className="text-xs text-muted-foreground">
                                  {formatMoney(item.amount)}
                                </p>
                              ) : null}
                              {(item.sme?.industry || item.sector) && (
                                <Badge
                                  variant="status"
                                  className="bg-gray-100 text-gray-600 text-[10px]"
                                >
                                  {item.sme?.industry || item.sector}
                                </Badge>
                              )}
                              {item.matchScore ? (
                                <div className="flex items-center gap-1">
                                  <StarIcon className="w-3 h-3 text-yellow-500" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {item.matchScore}% match
                                  </span>
                                </div>
                              ) : null}
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <ClockIcon className="w-3 h-3" />
                                {item.updatedAt
                                  ? formatDistanceToNow(new Date(item.updatedAt), {
                                      addSuffix: true,
                                    })
                                  : "—"}
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACTIVE INTERESTS TAB */}
          {tab === "active" && (
            <>
              {activeInterests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <HandshakeIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-semibold text-lg mb-1">
                    No active investment interests
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Express interest in SMEs from the directory to start building
                    your pipeline.
                  </p>
                </div>
              ) : (
                <ReusableTable
                  columns={activeColumns}
                  data={activeInterests}
                  totalPages={Math.ceil(activeInterests.length / 10)}
                />
              )}
            </>
          )}

          {/* ARCHIVED TAB */}
          {tab === "archived" && (
            <>
              {archivedInterests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ArchiveIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-semibold text-lg mb-1">No archived interests</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Completed, declined, or expired interests will appear here.
                  </p>
                </div>
              ) : (
                <ReusableTable
                  columns={archivedColumns}
                  data={archivedInterests}
                  totalPages={Math.ceil(archivedInterests.length / 10)}
                />
              )}
            </>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <div className="space-y-8">
              {/* Conversion Funnel */}
              <Card className="shadow-none">
                <CardContent className="py-6">
                  <p className="font-bold text-base mb-6">Conversion Funnel</p>
                  <div className="space-y-3">
                    {funnelData.map((s, idx) => {
                      const maxCount = Math.max(...funnelData.map((f) => f.count), 1);
                      const pct = (s.count / maxCount) * 100;
                      return (
                        <div key={s.key} className="flex items-center gap-4">
                          <span className="text-sm font-medium w-28 shrink-0">
                            {s.label}
                          </span>
                          <div className="flex-1 h-8 bg-gray-50 rounded-md overflow-hidden relative">
                            <div
                              className="h-full rounded-md transition-all duration-500"
                              style={{
                                width: `${Math.max(pct, 4)}%`,
                                background:
                                  idx === 0
                                    ? "#e5e7eb"
                                    : idx === 1
                                      ? "#bfdbfe"
                                      : idx === 2
                                        ? "#fef3c7"
                                        : idx === 3
                                          ? "#d1fae5"
                                          : "#bbf7d0",
                              }}
                            />
                            <span className="absolute inset-y-0 left-3 flex items-center text-xs font-medium">
                              {s.count} {s.count === 1 ? "interest" : "interests"}
                            </span>
                          </div>
                          {idx < funnelData.length - 1 && (
                            <ChevronRightIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sector Distribution */}
                <Card className="shadow-none">
                  <CardContent className="py-6">
                    <p className="font-bold text-base mb-6">
                      Sector Distribution
                    </p>
                    {sectorData.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No data available yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {sectorData.map((s) => {
                          const max = Math.max(
                            ...sectorData.map((d) => d.count),
                            1,
                          );
                          return (
                            <div key={s.name} className="flex items-center gap-3">
                              <span className="text-sm w-28 shrink-0 truncate">
                                {s.name}
                              </span>
                              <div className="flex-1 h-6 bg-gray-50 rounded overflow-hidden">
                                <div
                                  className="h-full bg-[#008060]/20 rounded"
                                  style={{
                                    width: `${(s.count / max) * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm font-medium w-8 text-right">
                                {s.count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card className="shadow-none">
                  <CardContent className="py-6">
                    <p className="font-bold text-base mb-6">Monthly Interest Trend</p>
                    {monthlyTrend.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No data available yet.
                      </p>
                    ) : (
                      <div className="flex items-end gap-3 h-48">
                        {monthlyTrend.map((m) => {
                          const max = Math.max(
                            ...monthlyTrend.map((d) => d.count),
                            1,
                          );
                          const h = (m.count / max) * 100;
                          return (
                            <div
                              key={m.month}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <span className="text-xs font-medium">{m.count}</span>
                              <div className="w-full bg-gray-50 rounded-t flex-1 relative">
                                <div
                                  className="absolute bottom-0 w-full bg-[#008060]/30 rounded-t transition-all duration-500"
                                  style={{ height: `${Math.max(h, 8)}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {m.month.split(" ")[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-none">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Conversion Rate
                    </p>
                    <p className="text-3xl font-bold">
                      {kpis.total > 0
                        ? `${Math.round((kpis.converted / kpis.total) * 100)}%`
                        : "0%"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-none">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Pipeline Value
                    </p>
                    <p className="text-3xl font-bold">
                      {formatMoney(
                        allItems.reduce(
                          (sum, i) => sum + (i.amount || 0),
                          0,
                        ),
                      )}
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-none">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Active Sectors
                    </p>
                    <p className="text-3xl font-bold">{sectorData.length}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Interest Detail Dialog ─────────────────────────────────────── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                <BuildingIcon className="w-5 h-5 text-green" />
              </div>
              {selectedInterest?.sme?.businessName ||
                selectedInterest?.investor?.organizationName ||
                "Interest Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedInterest && (
            <div className="space-y-5 py-2">
              {/* Status & stage */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="status"
                  className={cn(
                    "capitalize",
                    getStatusClass(
                      selectedInterest.stage || selectedInterest.status || "",
                    ),
                  )}
                >
                  {formatStatus(
                    selectedInterest.stage || selectedInterest.status || "",
                  )}
                </Badge>
                {selectedInterest.matchScore ? (
                  <Badge variant="status" className="bg-yellow-50 text-yellow-700">
                    <StarIcon className="w-3 h-3 mr-1" />
                    {selectedInterest.matchScore}% match
                  </Badge>
                ) : null}
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedInterest.amount ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="font-medium">
                      {formatMoney(selectedInterest.amount)}
                    </p>
                  </div>
                ) : null}
                {(selectedInterest.sme?.industry || selectedInterest.sector) && (
                  <div>
                    <p className="text-xs text-muted-foreground">Sector</p>
                    <p className="font-medium">
                      {selectedInterest.sme?.industry || selectedInterest.sector}
                    </p>
                  </div>
                )}
                {selectedInterest.sme?.location && (
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {selectedInterest.sme.location}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {selectedInterest.createdAt
                      ? format(new Date(selectedInterest.createdAt), "MMM dd, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Message */}
              {selectedInterest.message && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message</p>
                  <div className="bg-gray-50 rounded-md p-3 text-sm">
                    {selectedInterest.message}
                  </div>
                </div>
              )}

              {/* Timeline placeholder */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Investment Timeline
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Interest Created",
                      date: selectedInterest.createdAt,
                      done: true,
                    },
                    {
                      label: "Due Diligence",
                      date: selectedInterest.stage === "due_diligence" ? selectedInterest.updatedAt : null,
                      done: ["due_diligence", "negotiation", "committed", "disbursed"].includes(
                        (selectedInterest.stage || "").toLowerCase(),
                      ),
                    },
                    {
                      label: "Negotiation",
                      date: null,
                      done: ["negotiation", "committed", "disbursed"].includes(
                        (selectedInterest.stage || "").toLowerCase(),
                      ),
                    },
                    {
                      label: "Committed",
                      date: null,
                      done: ["committed", "disbursed"].includes(
                        (selectedInterest.stage || "").toLowerCase(),
                      ),
                    },
                    {
                      label: "Disbursed",
                      date: null,
                      done: (selectedInterest.stage || "").toLowerCase() === "disbursed",
                    },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          step.done
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-400",
                        )}
                      >
                        {step.done ? (
                          <CheckCircle2Icon className="w-3 h-3" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-sm flex-1",
                          step.done ? "font-medium" : "text-muted-foreground",
                        )}
                      >
                        {step.label}
                      </span>
                      {step.date && (
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(step.date), "MMM dd")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t">
                {(selectedInterest.status || "").toLowerCase() === "pending" && (
                  <>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => {
                        handleAccept(
                          selectedInterest.id || selectedInterest._id || "",
                        );
                        setDetailOpen(false);
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        handleDecline(
                          selectedInterest.id || selectedInterest._id || "",
                        );
                        setDetailOpen(false);
                      }}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {(selectedInterest.status || "").toLowerCase() === "accepted" && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => {
                      handleDueDiligence(
                        selectedInterest.id || selectedInterest._id || "",
                      );
                      setDetailOpen(false);
                    }}
                  >
                    Request Due Diligence
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setDetailOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
