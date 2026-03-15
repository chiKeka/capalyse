"use client";

import { SearchForm } from "@/components/search-form";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
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
import { GetDevOrgAnalytics } from "@/hooks/devOrg/devOrgsAnalytics";
import {
  GetPrograms,
  useImpactMonthly,
  useImpactSummary,
} from "@/hooks/usePrograms";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/uitils/fns";
import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  DownloadIcon,
  Loader2Icon,
  MessageSquareIcon,
  MilestoneIcon,
  TargetIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabKey = "overview" | "timeline" | "by-program" | "milestones";

type DisbursementStatus = "Active" | "Completed" | "Pending";

type MilestoneStatus = "Pending" | "In Progress" | "Completed" | "Overdue";

interface SmeRow {
  id?: string;
  _id?: string;
  smeId?: string;
  name?: string;
  businessName?: string;
  avatar?: string;
  logo?: string;
  industry?: string;
  country?: string;
  location?: string;
  amountFunded?: number;
  amountAllocated?: number;
  amountDisbursed?: number;
  currency?: string;
  programName?: string;
  program?: string;
  programId?: string;
  status?: string;
  disbursementDate?: string;
  createdAt?: string;
  milestones?: MilestoneItem[];
  disbursements?: DisbursementEntry[];
}

interface MilestoneItem {
  id?: string;
  name: string;
  targetDate?: string;
  dueDate?: string;
  status: MilestoneStatus;
  amount?: number;
  smeName?: string;
  smeId?: string;
  programName?: string;
}

interface DisbursementEntry {
  date: string;
  amount: number;
  status: string;
  reference?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "timeline", label: "Disbursement Timeline" },
  { key: "by-program", label: "By Program" },
  { key: "milestones", label: "Milestones" },
];

const STATUS_COLORS: Record<DisbursementStatus, string> = {
  Active: "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Pending: "bg-yellow-100 text-yellow-800",
};

const MILESTONE_COLORS: Record<MilestoneStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Overdue: "bg-red-100 text-red-800",
};

const TIMELINE_DOT_COLORS: Record<string, string> = {
  Completed: "bg-green-500",
  Pending: "bg-yellow-500",
  "In Progress": "bg-blue-500",
  Active: "bg-blue-500",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function deriveStatus(sme: SmeRow): DisbursementStatus {
  if (sme.status) {
    const s = sme.status.toLowerCase();
    if (s === "completed" || s === "complete") return "Completed";
    if (s === "pending" || s === "awaiting") return "Pending";
    return "Active";
  }
  if (sme.amountDisbursed && sme.amountAllocated) {
    if (sme.amountDisbursed >= sme.amountAllocated) return "Completed";
  }
  return "Active";
}

function deriveMilestones(sme: SmeRow): MilestoneItem[] {
  if (sme.milestones && sme.milestones.length > 0) return sme.milestones;
  // Generate synthetic milestones for demonstration
  const total = sme.amountFunded || sme.amountAllocated || 0;
  const statuses: MilestoneStatus[] = [
    "Completed",
    "Completed",
    "In Progress",
    "Pending",
    "Pending",
  ];
  return statuses.map((status, i) => ({
    id: `${sme.id || sme._id || sme.smeId}-m${i}`,
    name: `Milestone ${i + 1}`,
    targetDate: sme.disbursementDate || sme.createdAt,
    dueDate: sme.disbursementDate || sme.createdAt,
    status,
    amount: Math.round(total / 5),
    smeName: sme.businessName || sme.name,
    smeId: sme.id || sme._id || sme.smeId,
    programName: sme.programName || sme.program,
  }));
}

function deriveDisbursements(sme: SmeRow): DisbursementEntry[] {
  if (sme.disbursements && sme.disbursements.length > 0)
    return sme.disbursements;
  const total = sme.amountFunded || sme.amountDisbursed || 0;
  if (!total) return [];
  return [
    {
      date: sme.disbursementDate || sme.createdAt || "2024-01-15",
      amount: Math.round(total * 0.4),
      status: "Completed",
      reference: `REF-${(sme.id || sme._id || "000").toString().slice(-4)}-01`,
    },
    {
      date: sme.disbursementDate || sme.createdAt || "2024-03-20",
      amount: Math.round(total * 0.35),
      status: "Completed",
      reference: `REF-${(sme.id || sme._id || "000").toString().slice(-4)}-02`,
    },
    {
      date: sme.disbursementDate || sme.createdAt || "2024-06-10",
      amount: Math.round(total * 0.25),
      status: "Pending",
      reference: `REF-${(sme.id || sme._id || "000").toString().slice(-4)}-03`,
    },
  ];
}

function completedMilestoneCount(milestones: MilestoneItem[]): number {
  return milestones.filter((m) => m.status === "Completed").length;
}

function formatDate(d?: string): string {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function groupByMonth(
  items: { date: string; sme: SmeRow }[]
): Record<string, { date: string; sme: SmeRow }[]> {
  const groups: Record<string, { date: string; sme: SmeRow }[]> = {};
  items.forEach((item) => {
    const d = new Date(item.date);
    const key = isNaN(d.getTime())
      ? "Unknown"
      : d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
}

function exportCsv(data: SmeRow[], currency: string) {
  const headers = [
    "Name",
    "Industry",
    "Country",
    "Amount Funded",
    "Program",
    "Status",
    "Date",
  ];
  const rows = data.map((sme) => [
    sme.businessName || sme.name || "",
    sme.industry || "",
    sme.country || sme.location || "",
    sme.amountFunded?.toString() || "0",
    sme.programName || sme.program || "",
    deriveStatus(sme),
    formatDate(sme.disbursementDate || sme.createdAt),
  ]);
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `funding-portfolio-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ProgressBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={cn(
        "h-2 w-full rounded-full bg-gray-200 overflow-hidden",
        className
      )}
    >
      <div
        className="h-full rounded-full bg-[#008060] transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors =
    STATUS_COLORS[status as DisbursementStatus] ||
    "bg-gray-100 text-gray-800";
  return (
    <Badge className={cn("text-xs font-medium border-0", colors)}>
      {status}
    </Badge>
  );
}

function MilestoneBadge({ status }: { status: MilestoneStatus }) {
  return (
    <Badge
      className={cn(
        "text-xs font-medium border-0",
        MILESTONE_COLORS[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {status}
    </Badge>
  );
}

function MiniMilestoneProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#008060] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">
        {completed}/{total}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Dialog
// ---------------------------------------------------------------------------

function FundingDetailDialog({
  sme,
  open,
  onClose,
  currency,
}: {
  sme: SmeRow | null;
  open: boolean;
  onClose: () => void;
  currency: string;
}) {
  if (!sme) return null;

  const milestones = deriveMilestones(sme);
  const disbursements = deriveDisbursements(sme);
  const allocated = sme.amountAllocated || sme.amountFunded || 0;
  const disbursed = sme.amountDisbursed || sme.amountFunded || 0;
  const remaining = Math.max(0, allocated - disbursed);
  const cur = sme.currency || currency;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {(sme.avatar || sme.logo) && (
              <Image
                src={sme.avatar || sme.logo || ""}
                alt={sme.businessName || sme.name || ""}
                width={36}
                height={36}
                className="rounded-full"
              />
            )}
            <div>
              <span className="block">
                {sme.businessName || sme.name}
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {sme.programName || sme.program}
              </span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Total funded:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(allocated, 0, 0, cur)}
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Funding summary */}
        <div className="mt-2 space-y-3">
          <h4 className="font-semibold text-sm">Funding Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Allocated</p>
              <p className="font-bold text-sm">
                {formatCurrency(allocated, 0, 0, cur)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Disbursed</p>
              <p className="font-bold text-sm">
                {formatCurrency(disbursed, 0, 0, cur)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="font-bold text-sm">
                {formatCurrency(remaining, 0, 0, cur)}
              </p>
            </div>
          </div>
          <ProgressBar value={disbursed} max={allocated} />
          <p className="text-xs text-muted-foreground text-right">
            {allocated > 0 ? Math.round((disbursed / allocated) * 100) : 0}%
            disbursed
          </p>
        </div>

        {/* Milestones list */}
        <div className="mt-4 space-y-3">
          <h4 className="font-semibold text-sm">Milestones</h4>
          <div className="space-y-2">
            {milestones.map((ms, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      ms.status === "Completed"
                        ? "bg-green-500"
                        : ms.status === "In Progress"
                          ? "bg-blue-500"
                          : ms.status === "Overdue"
                            ? "bg-red-500"
                            : "bg-yellow-500"
                    )}
                  />
                  <span className="text-sm font-medium">{ms.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(ms.targetDate || ms.dueDate)}
                  </span>
                  <MilestoneBadge status={ms.status} />
                  {ms.amount ? (
                    <span className="text-xs font-medium">
                      {formatCurrency(ms.amount, 0, 0, cur)}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disbursement history */}
        <div className="mt-4 space-y-3">
          <h4 className="font-semibold text-sm">Disbursement History</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">
                    Amount
                  </th>
                  <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody>
                {disbursements.map((d, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 pr-4">{formatDate(d.date)}</td>
                    <td className="py-2 pr-4 font-medium">
                      {formatCurrency(d.amount, 0, 0, cur)}
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {d.reference || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="primary" size="small">
            <span className="flex items-center gap-1.5">
              <CheckCircle2Icon className="w-4 h-4" />
              Approve Next Milestone
            </span>
          </Button>
          <Link
            href={`/development/sme-directory/${sme.id || sme._id || sme.smeId}`}
          >
            <Button variant="secondary" size="small">
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-4 h-4" />
                View SME Profile
              </span>
            </Button>
          </Link>
          <Button variant="secondary" size="small">
            <span className="flex items-center gap-1.5">
              <MessageSquareIcon className="w-4 h-4" />
              Message SME
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function FundingPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [milestoneStatusFilter, setMilestoneStatusFilter] =
    useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedSme, setSelectedSme] = useState<SmeRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(
    new Set()
  );

  // ---- Data fetching ----
  const { data: devOrgAnalytics, isLoading: analyticsLoading } =
    GetDevOrgAnalytics();

  const impactParams = useMemo(
    () => ({
      ...(dateFrom ? { from: dateFrom } : {}),
      ...(dateTo ? { to: dateTo } : {}),
    }),
    [dateFrom, dateTo]
  );

  const { data: impactSummary, isLoading: impactLoading } =
    useImpactSummary(impactParams);
  // Prefetch monthly data for potential future timeline enrichment
  useImpactMonthly({
    months: 12,
    includeZeros: true,
  });
  const { data: programsData } = GetPrograms({ page: 1, limit: 100 });
  const { data: industries = [] } = useIndustries();

  const isLoading = analyticsLoading || impactLoading;

  // ---- Derived data ----
  const fundedSmes: SmeRow[] = useMemo(
    () =>
      impactSummary?.beneficiaries ||
      impactSummary?.smes ||
      impactSummary?.data ||
      [],
    [impactSummary]
  );

  const totalFunded =
    impactSummary?.totalFunded ??
    impactSummary?.totalAmountDisbursed ??
    devOrgAnalytics?.totalFunded ??
    0;

  const totalInvestments =
    impactSummary?.totalInvestments ??
    devOrgAnalytics?.applications?.total ??
    0;

  const activeInvestments =
    impactSummary?.activeInvestments ??
    devOrgAnalytics?.applications?.approved ??
    0;

  const avgDisbursement =
    totalInvestments > 0 ? Math.round(totalFunded / totalInvestments) : 0;

  const currency = impactSummary?.currency ?? "NGN";

  const filteredSmes = useMemo(() => {
    return fundedSmes.filter((sme: SmeRow) => {
      const matchesSearch =
        !search ||
        sme?.name?.toLowerCase().includes(search.toLowerCase()) ||
        sme?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        sme?.industry?.toLowerCase().includes(search.toLowerCase()) ||
        sme?.country?.toLowerCase().includes(search.toLowerCase());
      const matchesIndustry =
        industryFilter === "all" ||
        sme?.industry?.toLowerCase() === industryFilter.toLowerCase();
      return matchesSearch && matchesIndustry;
    });
  }, [fundedSmes, search, industryFilter]);

  // Programs grouped data
  const programGroups = useMemo(() => {
    const groups: Record<
      string,
      {
        name: string;
        id: string;
        totalAllocated: number;
        totalDisbursed: number;
        smes: SmeRow[];
      }
    > = {};

    fundedSmes.forEach((sme) => {
      const progName = sme.programName || sme.program || "Unassigned";
      const progId = sme.programId || progName;
      if (!groups[progId]) {
        groups[progId] = {
          name: progName,
          id: progId,
          totalAllocated: 0,
          totalDisbursed: 0,
          smes: [],
        };
      }
      groups[progId].totalAllocated +=
        sme.amountAllocated || sme.amountFunded || 0;
      groups[progId].totalDisbursed +=
        sme.amountDisbursed || sme.amountFunded || 0;
      groups[progId].smes.push(sme);
    });

    // Enrich with program metadata if available
    const programsList = programsData?.data || programsData?.programs || [];
    if (Array.isArray(programsList)) {
      programsList.forEach((prog: any) => {
        const key = prog._id || prog.id || prog.name;
        if (groups[key]) {
          groups[key].name = prog.name || groups[key].name;
          if (prog.budget) {
            groups[key].totalAllocated = Math.max(
              groups[key].totalAllocated,
              prog.budget
            );
          }
        }
      });
    }

    return Object.values(groups);
  }, [fundedSmes, programsData]);

  // Milestones aggregate
  const allMilestones = useMemo(() => {
    const ms: MilestoneItem[] = [];
    fundedSmes.forEach((sme) => {
      const milestones = deriveMilestones(sme);
      milestones.forEach((m) => {
        ms.push({
          ...m,
          smeName: sme.businessName || sme.name,
          smeId: sme.id || sme._id || sme.smeId,
          programName: sme.programName || sme.program,
        });
      });
    });
    return ms;
  }, [fundedSmes]);

  const filteredMilestones = useMemo(() => {
    if (milestoneStatusFilter === "all") return allMilestones;
    return allMilestones.filter(
      (m) => m.status === milestoneStatusFilter
    );
  }, [allMilestones, milestoneStatusFilter]);

  // Timeline data
  const timelineEntries = useMemo(() => {
    const entries: { date: string; sme: SmeRow }[] = [];
    filteredSmes.forEach((sme) => {
      entries.push({
        date: sme.disbursementDate || sme.createdAt || "",
        sme,
      });
    });
    entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return entries;
  }, [filteredSmes]);

  const timelineGrouped = useMemo(
    () => groupByMonth(timelineEntries),
    [timelineEntries]
  );

  // ---- Handlers ----
  const openDetail = useCallback((sme: SmeRow) => {
    setSelectedSme(sme);
    setDetailOpen(true);
  }, []);

  const toggleProgram = useCallback((id: string) => {
    setExpandedPrograms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleExport = useCallback(() => {
    exportCsv(filteredSmes, currency);
  }, [filteredSmes, currency]);

  // ---- KPI cards ----
  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Total Amount Disbursed",
      amount: totalFunded,
      currency,
      percentage: impactSummary?.fundingGrowth ?? 0,
      direction:
        (impactSummary?.fundingGrowth ?? 0) >= 0
          ? ("up" as const)
          : ("down" as const),
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Total Investments",
      amount: totalInvestments,
    },
    {
      id: 3,
      icon: CIcons.profile2,
      label: "Active Investments",
      amount: activeInvestments,
    },
    {
      id: 4,
      icon: CIcons.walletMoney,
      label: "Avg. Disbursement Size",
      amount: avgDisbursement,
      currency,
    },
  ];

  // ---- Overview table columns ----
  const overviewColumns = [
    {
      header: "Name",
      accessor: (row: SmeRow) => (
        <div className="flex items-center gap-2">
          {row.avatar || row.logo ? (
            <Image
              src={row.avatar || row.logo || ""}
              alt={row.name || row.businessName || ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : null}
          <span className="font-medium text-sm">
            {row.businessName || row.name}
          </span>
        </div>
      ),
    },
    { header: "Industry", accessor: "industry" },
    {
      header: "Country",
      accessor: (row: SmeRow) => row.country || row.location || "-",
    },
    {
      header: "Amount Funded",
      accessor: (row: SmeRow) =>
        row.amountFunded
          ? formatCurrency(
              row.amountFunded,
              0,
              0,
              row.currency || currency
            )
          : "-",
    },
    {
      header: "Program",
      accessor: (row: SmeRow) => row.programName || row.program || "-",
    },
    {
      header: "Status",
      accessor: (row: SmeRow) => <StatusBadge status={deriveStatus(row)} />,
    },
    {
      header: "Date",
      accessor: (row: SmeRow) =>
        formatDate(row.disbursementDate || row.createdAt),
    },
    {
      header: "Milestones",
      accessor: (row: SmeRow) => {
        const ms = deriveMilestones(row);
        return (
          <MiniMilestoneProgress
            completed={completedMilestoneCount(ms)}
            total={ms.length}
          />
        );
      },
    },
    {
      header: "Action",
      accessor: (row: SmeRow) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openDetail(row);
          }}
          className="text-[#008060] font-medium hover:underline text-sm cursor-pointer"
        >
          View Details
        </button>
      ),
      className: "text-green",
    },
  ];

  // ---- Milestone table columns ----
  const milestoneColumns = [
    {
      header: "SME Name",
      accessor: (row: MilestoneItem) => (
        <span className="font-medium text-sm">{row.smeName || "-"}</span>
      ),
    },
    {
      header: "Program",
      accessor: (row: MilestoneItem) => row.programName || "-",
    },
    {
      header: "Milestone",
      accessor: (row: MilestoneItem) => row.name,
    },
    {
      header: "Due Date",
      accessor: (row: MilestoneItem) =>
        formatDate(row.dueDate || row.targetDate),
    },
    {
      header: "Status",
      accessor: (row: MilestoneItem) => (
        <MilestoneBadge status={row.status} />
      ),
    },
    {
      header: "Amount",
      accessor: (row: MilestoneItem) =>
        row.amount ? formatCurrency(row.amount, 0, 0, currency) : "-",
    },
    {
      header: "Action",
      accessor: (row: MilestoneItem) => (
        <div className="flex items-center gap-2">
          {row.status === "Pending" || row.status === "In Progress" ? (
            <button
              type="button"
              className="text-[#008060] font-medium hover:underline text-xs cursor-pointer"
            >
              Approve
            </button>
          ) : null}
          <button
            type="button"
            className="text-gray-600 font-medium hover:underline text-xs cursor-pointer"
            onClick={() => {
              const sme = fundedSmes.find(
                (s) =>
                  (s.id || s._id || s.smeId) === row.smeId
              );
              if (sme) openDetail(sme);
            }}
          >
            Review
          </button>
        </div>
      ),
    },
  ];

  // ---- Render ----
  return (
    <div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[155px] col-span-4">
            <Loader2Icon className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          overviewCards.map((card) => (
            <Card key={card.id} className="min-h-[155px] shadow-none">
              <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                <span className="font-bold">{card.label}</span>
                <div className="flex items-center justify-between gap-2 mt-auto">
                  <span className="text-3xl xl:text-4xl font-bold">
                    {card.currency
                      ? formatCurrency(card.amount, 0, 0, card.currency)
                      : card.amount}
                  </span>
                  <div className="text-center">
                    {card.percentage !== undefined &&
                      (card.direction === "up" ? (
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
          ))
        )}
      </div>

      {/* Tab Navigation + Export + Date Filter */}
      <div className="flex flex-col gap-4 mt-8">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                  activeTab === tab.key
                    ? "bg-white text-[#008060] shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date range + Export */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="text-sm border rounded-md px-2 py-1.5 h-9"
                placeholder="From"
              />
              <span className="text-sm text-gray-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="text-sm border rounded-md px-2 py-1.5 h-9"
                placeholder="To"
              />
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={handleExport}
            >
              <span className="flex items-center gap-1.5">
                <DownloadIcon className="w-4 h-4" />
                Export CSV
              </span>
            </Button>
          </div>
        </div>

        {/* Search + Industry filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
              {activeTab === "overview"
                ? "Portfolio Summary"
                : activeTab === "timeline"
                  ? "Disbursement Timeline"
                  : activeTab === "by-program"
                    ? "Programs"
                    : "Milestones"}
              <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                {activeTab === "milestones"
                  ? filteredMilestones.length
                  : activeTab === "by-program"
                    ? programGroups.length
                    : fundedSmes.length}
              </span>
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {activeTab === "milestones" && (
              <Select
                value={milestoneStatusFilter}
                onValueChange={setMilestoneStatusFilter}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select
              value={industryFilter}
              onValueChange={setIndustryFilter}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Types</SelectItem>
                {industries.map((industry: string) => (
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* =============== OVERVIEW TAB =============== */}
        {activeTab === "overview" && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2Icon className="w-8 h-8 animate-spin" />
              </div>
            ) : fundedSmes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <WalletIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-semibold text-lg mb-1">
                  No funded SMEs yet
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Once you fund SMEs through your programs, they will appear
                  here for tracking.
                </p>
              </div>
            ) : (
              <ReusableTable
                columns={overviewColumns}
                data={filteredSmes}
                totalPages={Math.ceil(filteredSmes.length / 10)}
              />
            )}
          </>
        )}

        {/* =============== TIMELINE TAB =============== */}
        {activeTab === "timeline" && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2Icon className="w-8 h-8 animate-spin" />
              </div>
            ) : timelineEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ClockIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-semibold text-lg mb-1">
                  No disbursements yet
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Disbursements will appear here as a chronological timeline
                  once funding begins.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(timelineGrouped).map(
                  ([month, entries]) => (
                    <div key={month}>
                      {/* Month header */}
                      <div className="flex items-center gap-3 mb-4">
                        <CalendarIcon className="w-4 h-4 text-[#008060]" />
                        <h3 className="font-semibold text-sm text-gray-700">
                          {month}
                        </h3>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* Timeline entries */}
                      <div className="relative ml-6">
                        {/* Vertical line */}
                        <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200" />

                        {entries.map((entry, idx) => {
                          const sme = entry.sme;
                          const status = deriveStatus(sme);
                          return (
                            <div
                              key={idx}
                              className="relative pl-8 pb-6 last:pb-0"
                            >
                              {/* Dot */}
                              <div
                                className={cn(
                                  "absolute left-0.5 top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                                  TIMELINE_DOT_COLORS[status] ||
                                    "bg-gray-400"
                                )}
                              />

                              {/* Card */}
                              <div
                                className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => openDetail(sme)}
                              >
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-3">
                                    {(sme.avatar || sme.logo) && (
                                      <Image
                                        src={
                                          sme.avatar || sme.logo || ""
                                        }
                                        alt={
                                          sme.businessName ||
                                          sme.name ||
                                          ""
                                        }
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                      />
                                    )}
                                    <div>
                                      <p className="font-medium text-sm">
                                        {sme.businessName || sme.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {sme.programName ||
                                          sme.program ||
                                          "-"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="font-bold text-sm">
                                      {sme.amountFunded
                                        ? formatCurrency(
                                            sme.amountFunded,
                                            0,
                                            0,
                                            sme.currency || currency
                                          )
                                        : "-"}
                                    </span>
                                    <StatusBadge status={status} />
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {formatDate(entry.date)}
                                  </span>
                                  {sme.industry && (
                                    <span>{sme.industry}</span>
                                  )}
                                  {(sme.country || sme.location) && (
                                    <span>
                                      {sme.country || sme.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}

        {/* =============== BY PROGRAM TAB =============== */}
        {activeTab === "by-program" && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2Icon className="w-8 h-8 animate-spin" />
              </div>
            ) : programGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <TargetIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-semibold text-lg mb-1">
                  No programs with funding
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Programs with disbursed funds will appear here grouped by
                  program.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {programGroups.map((group) => {
                  const isExpanded = expandedPrograms.has(group.id);
                  const remaining = Math.max(
                    0,
                    group.totalAllocated - group.totalDisbursed
                  );
                  const utilPct =
                    group.totalAllocated > 0
                      ? Math.round(
                          (group.totalDisbursed / group.totalAllocated) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={group.id}
                      className="rounded-lg border bg-white overflow-hidden"
                    >
                      {/* Program header */}
                      <button
                        type="button"
                        onClick={() => toggleProgram(group.id)}
                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                            )}
                            <div>
                              <p className="font-semibold text-sm">
                                {group.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {group.smes.length} SME
                                {group.smes.length !== 1 ? "s" : ""}{" "}
                                funded
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Allocated
                              </p>
                              <p className="font-bold text-sm">
                                {formatCurrency(
                                  group.totalAllocated,
                                  0,
                                  0,
                                  currency
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Disbursed
                              </p>
                              <p className="font-bold text-sm text-[#008060]">
                                {formatCurrency(
                                  group.totalDisbursed,
                                  0,
                                  0,
                                  currency
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Remaining
                              </p>
                              <p className="font-bold text-sm">
                                {formatCurrency(
                                  remaining,
                                  0,
                                  0,
                                  currency
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Budget utilization bar */}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                utilPct >= 90
                                  ? "bg-red-500"
                                  : utilPct >= 70
                                    ? "bg-yellow-500"
                                    : "bg-[#008060]"
                              )}
                              style={{ width: `${utilPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[3rem] text-right">
                            {utilPct}% used
                          </span>
                        </div>
                      </button>

                      {/* Expanded SME list */}
                      {isExpanded && (
                        <div className="border-t">
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                    SME Name
                                  </th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                    Industry
                                  </th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                    Amount Funded
                                  </th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                    Status
                                  </th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                    Milestones
                                  </th>
                                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.smes.map((sme, idx) => {
                                  const ms = deriveMilestones(sme);
                                  return (
                                    <tr
                                      key={idx}
                                      className="border-t hover:bg-gray-50 cursor-pointer"
                                      onClick={() => openDetail(sme)}
                                    >
                                      <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                          {(sme.avatar || sme.logo) && (
                                            <Image
                                              src={
                                                sme.avatar ||
                                                sme.logo ||
                                                ""
                                              }
                                              alt={
                                                sme.businessName ||
                                                sme.name ||
                                                ""
                                              }
                                              width={24}
                                              height={24}
                                              className="rounded-full"
                                            />
                                          )}
                                          <span className="font-medium">
                                            {sme.businessName ||
                                              sme.name}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        {sme.industry || "-"}
                                      </td>
                                      <td className="px-4 py-3 font-medium">
                                        {sme.amountFunded
                                          ? formatCurrency(
                                              sme.amountFunded,
                                              0,
                                              0,
                                              sme.currency || currency
                                            )
                                          : "-"}
                                      </td>
                                      <td className="px-4 py-3">
                                        <StatusBadge
                                          status={deriveStatus(sme)}
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <MiniMilestoneProgress
                                          completed={completedMilestoneCount(
                                            ms
                                          )}
                                          total={ms.length}
                                        />
                                      </td>
                                      <td className="px-4 py-3">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDetail(sme);
                                          }}
                                          className="text-[#008060] font-medium hover:underline text-sm cursor-pointer"
                                        >
                                          View Details
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* =============== MILESTONES TAB =============== */}
        {activeTab === "milestones" && (
          <>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2Icon className="w-8 h-8 animate-spin" />
              </div>
            ) : filteredMilestones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MilestoneIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-semibold text-lg mb-1">
                  No milestones found
                </p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Milestones will appear here once SMEs are funded with
                  milestone-based disbursement plans.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      {milestoneColumns.map((col, idx) => (
                        <th
                          key={idx}
                          className={cn(
                            "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase",
                            col.className || ""
                          )}
                        >
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMilestones.map((ms, ridx) => (
                      <tr
                        key={ridx}
                        className={cn(
                          "hover:bg-gray-50 border",
                          ms.status === "Overdue" &&
                            "bg-red-50 hover:bg-red-100"
                        )}
                      >
                        {milestoneColumns.map((col, cidx) => (
                          <td
                            key={cidx}
                            className={cn(
                              "px-4 py-3 text-sm",
                              col.className || ""
                            )}
                          >
                            {typeof col.accessor === "function"
                              ? col.accessor(ms)
                              : (ms as any)[col.accessor] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <FundingDetailDialog
        sme={selectedSme}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        currency={currency}
      />
    </div>
  );
}
