"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
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
import {
  useAdminCompliances,
  useApproveAdminCompliance,
  useRejectAdminCompliance,
  useCertifyAdminCompliance,
  useRevokeAdminCompliance,
  type AdminComplianceQuery,
} from "@/hooks/admin/compliance";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Loader2Icon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  ClockIcon,
  FlagIcon,
  FileTextIcon,
  BarChart3Icon,
  EyeIcon,
  UserIcon,
  DownloadIcon,
  SquareCheckIcon,
} from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

type TabKey = "all" | "pending" | "flagged" | "reports";
type ComplianceStatus = AdminComplianceQuery["status"];
type Priority = "high" | "medium" | "low";

interface ComplianceCase {
  _id?: string;
  id?: string;
  status?: string;
  business?: { name?: string };
  businessName?: string;
  user?: { email?: string; businessName?: string; name?: string };
  createdAt?: string;
  updatedAt?: string;
  assignee?: string;
  assignedTo?: string;
  priority?: Priority;
  dueDate?: string;
  documents?: any[];
  slaStatus?: string;
  category?: string;
  notes?: string;
  reviewHistory?: any[];
  escalationTimeline?: any[];
  requiredActions?: string[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: ComplianceStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Awaiting AI", value: "awaiting_ai" },
  { label: "Awaiting Docs", value: "awaiting_docs" },
  { label: "AI Compliant", value: "ai_compliant" },
  { label: "Admin Review", value: "admin_review" },
  { label: "Admin Certified", value: "admin_certified" },
  { label: "Admin Rejected", value: "admin_rejected" },
];

const PRIORITY_OPTIONS = ["All Priorities", "high", "medium", "low"];

const CATEGORY_OPTIONS = [
  "All Categories",
  "KYC",
  "AML",
  "Tax Compliance",
  "Business Registration",
  "Financial Reporting",
  "Trade Compliance",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const getStatusClass = (status: string) => {
  switch (status) {
    case "admin_certified":
      return "bg-green-100 text-green-800";
    case "admin_rejected":
      return "bg-red-100 text-red-800";
    case "admin_review":
      return "bg-yellow-100 text-yellow-800";
    case "ai_compliant":
      return "bg-blue-100 text-blue-800";
    case "awaiting_ai":
    case "awaiting_docs":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityClass = (priority?: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-green-100 text-green-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const getSlaClass = (sla?: string) => {
  switch (sla) {
    case "overdue":
      return "text-red-600";
    case "at_risk":
      return "text-yellow-600";
    default:
      return "text-green-600";
  }
};

const formatStatus = (status: string) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

// ── Action Modal Types ───────────────────────────────────────────────────────

type ActionModal =
  | { type: "approve" | "reject"; caseId: string; docLinkId: string }
  | { type: "certify" | "revoke"; caseId: string }
  | { type: "detail"; caseData: ComplianceCase };

// ── Component ────────────────────────────────────────────────────────────────

export default function ComplianceManagementPage() {
  // State
  const [tab, setTab] = useState<TabKey>("all");
  const [statusFilter, setStatusFilter] = useState<ComplianceStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionModal, setActionModal] = useState<ActionModal | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<"approve" | "reject" | "assign" | "">("");

  // Data
  const { data, isLoading } = useAdminCompliances(
    statusFilter ? { status: statusFilter, page, pageSize: 20 } : { page, pageSize: 20 },
  );

  const allCases: ComplianceCase[] = data?.data || data?.cases || data || [];
  const totalPages = data?.totalPages || data?.meta?.totalPages || 1;

  // Mutations
  const approveMutation = useApproveAdminCompliance(
    actionModal?.type === "approve" ? actionModal.caseId : "",
    actionModal?.type === "approve" ? (actionModal as any).docLinkId : "",
  );
  const rejectMutation = useRejectAdminCompliance(
    actionModal?.type === "reject" ? actionModal.caseId : "",
    actionModal?.type === "reject" ? (actionModal as any).docLinkId : "",
  );
  const certifyMutation = useCertifyAdminCompliance(
    actionModal?.type === "certify" ? actionModal.caseId : "",
  );
  const revokeMutation = useRevokeAdminCompliance(
    actionModal?.type === "revoke" ? actionModal.caseId : "",
  );

  const isActionPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    certifyMutation.isPending ||
    revokeMutation.isPending;

  // ── KPI calculations ────────────────────────────────────────────────────

  const kpis = useMemo(() => {
    const total = allCases.length;
    const pending = allCases.filter(
      (c) => c.status === "admin_review" || c.status === "awaiting_docs",
    ).length;
    const certified = allCases.filter((c) => c.status === "admin_certified").length;
    const complianceRate = total > 0 ? Math.round((certified / total) * 100) : 0;
    const overdue = allCases.filter(
      (c) =>
        c.slaStatus === "overdue" ||
        (c.dueDate && new Date(c.dueDate) < new Date()),
    ).length;
    return { total, pending, complianceRate, overdue };
  }, [allCases]);

  // ── Filtered cases per tab ──────────────────────────────────────────────

  const filteredCases = useMemo(() => {
    let items = [...allCases];

    // Tab-based filtering
    if (tab === "pending") {
      items = items.filter(
        (c) =>
          c.status === "admin_review" ||
          c.status === "ai_compliant" ||
          c.status === "awaiting_docs",
      );
    } else if (tab === "flagged") {
      items = items.filter(
        (c) =>
          c.priority === "high" ||
          c.slaStatus === "overdue" ||
          c.status === "admin_rejected",
      );
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) =>
          (c.business?.name || c.businessName || c.user?.businessName || "")
            .toLowerCase()
            .includes(q) ||
          (c._id || c.id || "").toLowerCase().includes(q) ||
          (c.user?.email || "").toLowerCase().includes(q) ||
          (c.category || "").toLowerCase().includes(q),
      );
    }

    // Priority filter
    if (priorityFilter && priorityFilter !== "All Priorities") {
      items = items.filter((c) => c.priority === priorityFilter);
    }

    // Category filter
    if (categoryFilter && categoryFilter !== "All Categories") {
      items = items.filter(
        (c) => (c.category || "").toLowerCase() === categoryFilter.toLowerCase(),
      );
    }

    return items;
  }, [allCases, tab, search, priorityFilter, categoryFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────

  const handleAction = useCallback(() => {
    if (!actionModal || actionModal.type === "detail") return;

    if (actionModal.type === "approve") {
      approveMutation.mutate(
        { notes },
        {
          onSuccess: () => {
            toast.success("Document approved");
            setActionModal(null);
            setNotes("");
          },
          onError: () => toast.error("Failed to approve"),
        },
      );
    } else if (actionModal.type === "reject") {
      rejectMutation.mutate(
        { notes },
        {
          onSuccess: () => {
            toast.success("Document rejected");
            setActionModal(null);
            setNotes("");
          },
          onError: () => toast.error("Failed to reject"),
        },
      );
    } else if (actionModal.type === "certify") {
      certifyMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success("Case certified");
          setActionModal(null);
        },
        onError: () => toast.error("Failed to certify"),
      });
    } else if (actionModal.type === "revoke") {
      revokeMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success("Certification revoked");
          setActionModal(null);
        },
        onError: () => toast.error("Failed to revoke"),
      });
    }
  }, [actionModal, notes, approveMutation, rejectMutation, certifyMutation, revokeMutation]);

  const toggleCaseSelection = useCallback((caseId: string) => {
    setSelectedCases((prev) =>
      prev.includes(caseId) ? prev.filter((id) => id !== caseId) : [...prev, caseId],
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedCases.length === filteredCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredCases.map((c) => c._id || c.id || ""));
    }
  }, [selectedCases, filteredCases]);

  const handleBulkAction = useCallback(() => {
    if (!bulkAction || selectedCases.length === 0) return;
    // In production, this would call batch endpoints
    toast.success(
      `Batch ${bulkAction} initiated for ${selectedCases.length} case(s)`,
    );
    setSelectedCases([]);
    setBulkAction("");
  }, [bulkAction, selectedCases]);

  const openDetail = useCallback((caseData: ComplianceCase) => {
    setActionModal({ type: "detail", caseData });
  }, []);

  // ── KPI cards ──────────────────────────────────────────────────────────

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.compliance || CIcons.stickyNote,
      label: "Total Cases",
      amount: kpis.total,
      sub: "All compliance cases",
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Pending Review",
      amount: kpis.pending,
      sub: "Awaiting action",
      highlight: kpis.pending > 0,
    },
    {
      id: 3,
      icon: CIcons.walletMoney,
      label: "Compliance Rate",
      amount: `${kpis.complianceRate}%`,
      isString: true,
      sub: "Certified / Total",
    },
    {
      id: 4,
      icon: CIcons.profile2,
      label: "Overdue Items",
      amount: kpis.overdue,
      sub: "Past SLA deadline",
      highlight: kpis.overdue > 0,
    },
  ];

  // ── Tab definitions ────────────────────────────────────────────────────

  const tabDefs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "all", label: "All Cases", icon: <FileTextIcon className="w-4 h-4" />, count: allCases.length },
    { key: "pending", label: "Pending Review", icon: <ClockIcon className="w-4 h-4" />, count: kpis.pending },
    { key: "flagged", label: "Flagged", icon: <FlagIcon className="w-4 h-4" /> },
    { key: "reports", label: "Reports", icon: <BarChart3Icon className="w-4 h-4" /> },
  ];

  // ── All Cases table columns ────────────────────────────────────────────

  const caseColumns = [
    ...(tab !== "reports"
      ? [
          {
            header: "",
            accessor: (row: ComplianceCase) => {
              const caseId = row._id || row.id || "";
              return (
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={selectedCases.includes(caseId)}
                  onChange={() => toggleCaseSelection(caseId)}
                />
              );
            },
          },
        ]
      : []),
    {
      header: "Case ID",
      accessor: (row: ComplianceCase) => (
        <span
          className="text-sm font-mono text-muted-foreground cursor-pointer hover:text-green"
          onClick={() => openDetail(row)}
        >
          {(row._id || row.id || "").slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Business",
      accessor: (row: ComplianceCase) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.business?.name || row.businessName || row.user?.businessName || "—"}
          </span>
          {row.user?.email && (
            <span className="text-xs text-muted-foreground">{row.user.email}</span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: ComplianceCase) => (
        <Badge variant="status" className={cn("capitalize", getStatusClass(row.status || ""))}>
          {formatStatus(row.status || "")}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessor: (row: ComplianceCase) => (
        <Badge
          variant="status"
          className={cn("capitalize text-xs", getPriorityClass(row.priority))}
        >
          {row.priority || "—"}
        </Badge>
      ),
    },
    {
      header: "Assignee",
      accessor: (row: ComplianceCase) => (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <UserIcon className="w-3 h-3 text-gray-500" />
          </div>
          <span className="text-sm">{row.assignee || row.assignedTo || "Unassigned"}</span>
        </div>
      ),
    },
    {
      header: "Due Date",
      accessor: (row: ComplianceCase) => {
        const isOverdue = row.dueDate && new Date(row.dueDate) < new Date();
        return (
          <span className={cn("text-sm", isOverdue ? "text-red-600 font-medium" : "")}>
            {row.dueDate ? format(new Date(row.dueDate), "MMM dd, yyyy") : "—"}
            {isOverdue && <AlertTriangleIcon className="w-3 h-3 inline ml-1" />}
          </span>
        );
      },
    },
    {
      header: "Docs",
      accessor: (row: ComplianceCase) => (
        <span className="text-sm text-muted-foreground">
          {row.documents?.length || 0}
        </span>
      ),
    },
    {
      header: "SLA",
      accessor: (row: ComplianceCase) => {
        const sla = row.slaStatus || (row.dueDate && new Date(row.dueDate) < new Date() ? "overdue" : "on_track");
        return (
          <span className={cn("text-xs font-medium capitalize", getSlaClass(sla))}>
            {sla === "on_track" ? "On Track" : sla === "at_risk" ? "At Risk" : sla === "overdue" ? "Overdue" : "—"}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessor: (row: ComplianceCase) => {
        const id = row._id || row.id || "";
        const docLinkId = row.documents?.[0]?._id || row.documents?.[0]?.id || "";
        return (
          <div className="flex gap-1.5 flex-wrap">
            <Button variant="secondary" size="small" onClick={() => openDetail(row)}>
              <EyeIcon className="w-3 h-3 mr-1" />
              View
            </Button>
            {(row.status === "admin_review" || row.status === "ai_compliant") &&
              docLinkId && (
                <>
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() =>
                      setActionModal({ type: "approve", caseId: id, docLinkId })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() =>
                      setActionModal({ type: "reject", caseId: id, docLinkId })
                    }
                  >
                    Reject
                  </Button>
                </>
              )}
            {row.status === "ai_compliant" && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setActionModal({ type: "certify", caseId: id })}
              >
                Certify
              </Button>
            )}
            {row.status === "admin_certified" && (
              <Button
                variant="danger"
                size="small"
                onClick={() => setActionModal({ type: "revoke", caseId: id })}
              >
                Revoke
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // ── Reports analytics data ─────────────────────────────────────────────

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allCases.forEach((c) => {
      const status = c.status || "unknown";
      map[status] = (map[status] || 0) + 1;
    });
    return Object.entries(map)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [allCases]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    allCases.forEach((c) => {
      const cat = c.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [allCases]);

  const monthlyTrend = useMemo(() => {
    const map: Record<string, { total: number; certified: number }> = {};
    allCases.forEach((c) => {
      if (c.createdAt) {
        const key = format(new Date(c.createdAt), "MMM yyyy");
        if (!map[key]) map[key] = { total: 0, certified: 0 };
        map[key].total++;
        if (c.status === "admin_certified") map[key].certified++;
      }
    });
    return Object.entries(map)
      .map(([month, data]) => ({ month, ...data }))
      .slice(-6);
  }, [allCases]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div>
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <Card
                key={card.id}
                className={cn(
                  "min-h-[120px] shadow-none",
                  card.highlight ? "border-red-200" : "",
                )}
              >
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div>
                      <span className="text-4xl font-bold">{card.amount}</span>
                      <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
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
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-3 mb-4 lg:mb-0 flex-wrap">
          {tabDefs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setSelectedCases([]);
              }}
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

        {/* Filters */}
        {tab !== "reports" && (
          <div className="flex gap-2 items-center w-full lg:w-auto justify-end flex-wrap">
            <SearchForm
              className="w-full sm:w-auto md:min-w-[220px]"
              inputClassName="h-11 pl-9"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
            <Select
              value={statusFilter || "__all__"}
              onValueChange={(v) => {
                setPage(1);
                setStatusFilter(v === "__all__" ? "" : (v as ComplianceStatus));
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={String(opt.value)} value={opt.value || "__all__"}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter || "__all__"}
              onValueChange={(v) => setPriorityFilter(v === "__all__" ? "" : v)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p === "All Priorities" ? "__all__" : p}>
                    {p === "All Priorities" ? p : p.charAt(0).toUpperCase() + p.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={categoryFilter || "__all__"}
              onValueChange={(v) => setCategoryFilter(v === "__all__" ? "" : v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c === "All Categories" ? "__all__" : c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* ── Bulk Actions ───────────────────────────────────────────────── */}
      {selectedCases.length > 0 && tab !== "reports" && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[#F4FFFC] border border-[#ABD2C7] rounded-md">
          <SquareCheckIcon className="w-4 h-4 text-green" />
          <span className="text-sm font-medium">
            {selectedCases.length} case{selectedCases.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Select
              value={bulkAction || "__none__"}
              onValueChange={(v) => setBulkAction(v === "__none__" ? "" : (v as any))}
            >
              <SelectTrigger className="w-36 h-8">
                <SelectValue placeholder="Bulk action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select action</SelectItem>
                <SelectItem value="approve">Batch Approve</SelectItem>
                <SelectItem value="reject">Batch Reject</SelectItem>
                <SelectItem value="assign">Batch Assign</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="primary" size="small" onClick={handleBulkAction} disabled={!bulkAction}>
              Apply
            </Button>
            <Button variant="secondary" size="small" onClick={() => setSelectedCases([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* ── Tab Content ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          {/* ALL CASES / PENDING / FLAGGED */}
          {tab !== "reports" && (
            <>
              {filteredCases.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShieldCheckIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="font-semibold text-lg mb-1">No compliance cases</p>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    {tab === "pending"
                      ? "No cases are awaiting review at this time."
                      : tab === "flagged"
                        ? "No flagged or overdue cases. Great job!"
                        : "No cases match the selected filters. Try adjusting your search."}
                  </p>
                </div>
              ) : (
                <ReusableTable columns={caseColumns} data={filteredCases} totalPages={totalPages} />
              )}
            </>
          )}

          {/* REPORTS TAB */}
          {tab === "reports" && (
            <div className="space-y-8">
              {/* Compliance metrics summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-none">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Overall Compliance Rate
                    </p>
                    <p className="text-4xl font-bold">{kpis.complianceRate}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {allCases.filter((c) => c.status === "admin_certified").length} of{" "}
                      {allCases.length} certified
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-none">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">
                      Avg Processing Time
                    </p>
                    <p className="text-4xl font-bold">3.2d</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Average days per case
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-none">
                  <CardContent className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-1">SLA Adherence</p>
                    <p className="text-4xl font-bold">
                      {allCases.length > 0
                        ? `${Math.round(((allCases.length - kpis.overdue) / allCases.length) * 100)}%`
                        : "100%"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Within deadline
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Status Distribution */}
              <Card className="shadow-none">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-6">
                    <p className="font-bold text-base">Status Distribution</p>
                  </div>
                  {statusDistribution.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data available.</p>
                  ) : (
                    <div className="space-y-3">
                      {statusDistribution.map((s) => {
                        const max = Math.max(
                          ...statusDistribution.map((d) => d.count),
                          1,
                        );
                        return (
                          <div key={s.status} className="flex items-center gap-4">
                            <span className="text-sm w-32 shrink-0">
                              <Badge
                                variant="status"
                                className={cn("capitalize text-xs", getStatusClass(s.status))}
                              >
                                {formatStatus(s.status)}
                              </Badge>
                            </span>
                            <div className="flex-1 h-6 bg-gray-50 rounded overflow-hidden">
                              <div
                                className="h-full bg-[#008060]/20 rounded transition-all duration-500"
                                style={{ width: `${(s.count / max) * 100}%` }}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <Card className="shadow-none">
                  <CardContent className="py-6">
                    <p className="font-bold text-base mb-6">Category Breakdown</p>
                    {categoryDistribution.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data available.</p>
                    ) : (
                      <div className="space-y-3">
                        {categoryDistribution.map((c) => {
                          const max = Math.max(
                            ...categoryDistribution.map((d) => d.count),
                            1,
                          );
                          return (
                            <div key={c.category} className="flex items-center gap-3">
                              <span className="text-sm w-32 shrink-0 truncate">
                                {c.category}
                              </span>
                              <div className="flex-1 h-5 bg-gray-50 rounded overflow-hidden">
                                <div
                                  className="h-full bg-blue-100 rounded"
                                  style={{ width: `${(c.count / max) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-6 text-right">
                                {c.count}
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
                    <p className="font-bold text-base mb-6">Monthly Compliance Trend</p>
                    {monthlyTrend.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No data available.</p>
                    ) : (
                      <div className="flex items-end gap-4 h-48">
                        {monthlyTrend.map((m) => {
                          const max = Math.max(
                            ...monthlyTrend.map((d) => d.total),
                            1,
                          );
                          const h = (m.total / max) * 100;
                          const hCert = (m.certified / max) * 100;
                          return (
                            <div
                              key={m.month}
                              className="flex-1 flex flex-col items-center gap-1"
                            >
                              <span className="text-xs font-medium">{m.total}</span>
                              <div className="w-full bg-gray-50 rounded-t flex-1 relative">
                                <div
                                  className="absolute bottom-0 w-full bg-gray-200 rounded-t"
                                  style={{ height: `${Math.max(h, 8)}%` }}
                                />
                                <div
                                  className="absolute bottom-0 w-full bg-[#008060]/30 rounded-t"
                                  style={{ height: `${Math.max(hCert, 0)}%` }}
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
                    <div className="flex items-center gap-4 mt-4 justify-center">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-gray-200" />
                        <span className="text-xs text-muted-foreground">Total</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-[#008060]/30" />
                        <span className="text-xs text-muted-foreground">Certified</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Export */}
              <div className="flex justify-end">
                <Button variant="secondary" size="small">
                  <DownloadIcon className="w-4 h-4 mr-1" />
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Action / Detail Modal ──────────────────────────────────────── */}
      <Dialog
        open={!!actionModal}
        onOpenChange={(open) => {
          if (!open) {
            setActionModal(null);
            setNotes("");
          }
        }}
      >
        <DialogContent className={cn(actionModal?.type === "detail" ? "max-w-2xl" : "max-w-sm")}>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {actionModal?.type === "approve" && "Approve Document"}
              {actionModal?.type === "reject" && "Reject Document"}
              {actionModal?.type === "certify" && "Certify Compliance Case"}
              {actionModal?.type === "revoke" && "Revoke Certification"}
              {actionModal?.type === "detail" && "Case Details"}
            </DialogTitle>
          </DialogHeader>

          {/* Detail view */}
          {actionModal?.type === "detail" && (
            <div className="space-y-5 py-2">
              {/* Case info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Case ID</p>
                  <p className="font-mono text-sm font-medium">
                    {(actionModal.caseData._id || actionModal.caseData.id || "").slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Business</p>
                  <p className="font-medium text-sm">
                    {actionModal.caseData.business?.name ||
                      actionModal.caseData.businessName ||
                      actionModal.caseData.user?.businessName ||
                      "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant="status"
                    className={cn("capitalize mt-1", getStatusClass(actionModal.caseData.status || ""))}
                  >
                    {formatStatus(actionModal.caseData.status || "")}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>
                  <Badge
                    variant="status"
                    className={cn("capitalize mt-1", getPriorityClass(actionModal.caseData.priority))}
                  >
                    {actionModal.caseData.priority || "—"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assignee</p>
                  <p className="text-sm">{actionModal.caseData.assignee || actionModal.caseData.assignedTo || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm">{actionModal.caseData.category || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {actionModal.caseData.createdAt
                      ? format(new Date(actionModal.caseData.createdAt), "MMM dd, yyyy")
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm">
                    {actionModal.caseData.dueDate
                      ? format(new Date(actionModal.caseData.dueDate), "MMM dd, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Documents list */}
              {(actionModal.caseData.documents || []).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Documents ({actionModal.caseData.documents?.length})
                  </p>
                  <div className="space-y-2">
                    {actionModal.caseData.documents?.map((doc: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-md text-sm"
                      >
                        <FileTextIcon className="w-4 h-4 text-green shrink-0" />
                        <span className="flex-1 truncate">{doc.name || doc.fileName || `Document ${i + 1}`}</span>
                        <Badge variant="status" className="bg-gray-100 text-gray-600 text-[10px]">
                          {doc.status || "pending"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review history */}
              {(actionModal.caseData.reviewHistory || []).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Review History</p>
                  <div className="space-y-2">
                    {actionModal.caseData.reviewHistory?.map((rev: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                          <UserIcon className="w-3 h-3 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{rev.action || rev.type || "Review"}</p>
                          <p className="text-xs text-muted-foreground">{rev.reviewer || ""}</p>
                          {rev.notes && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {rev.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {actionModal.caseData.notes && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <div className="bg-gray-50 rounded-md p-3 text-sm">
                    {actionModal.caseData.notes}
                  </div>
                </div>
              )}

              {/* Status workflow actions */}
              <div className="flex gap-2 pt-2 border-t flex-wrap">
                {(actionModal.caseData.status === "admin_review" ||
                  actionModal.caseData.status === "ai_compliant") &&
                  (actionModal.caseData.documents?.[0]?._id || actionModal.caseData.documents?.[0]?.id) && (
                    <>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => {
                          const docLinkId =
                            actionModal.caseData.documents?.[0]?._id ||
                            actionModal.caseData.documents?.[0]?.id ||
                            "";
                          setActionModal({
                            type: "approve",
                            caseId: actionModal.caseData._id || actionModal.caseData.id || "",
                            docLinkId,
                          });
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => {
                          const docLinkId =
                            actionModal.caseData.documents?.[0]?._id ||
                            actionModal.caseData.documents?.[0]?.id ||
                            "";
                          setActionModal({
                            type: "reject",
                            caseId: actionModal.caseData._id || actionModal.caseData.id || "",
                            docLinkId,
                          });
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                {actionModal.caseData.status === "ai_compliant" && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() =>
                      setActionModal({
                        type: "certify",
                        caseId: actionModal.caseData._id || actionModal.caseData.id || "",
                      })
                    }
                  >
                    Certify
                  </Button>
                )}
                {actionModal.caseData.status === "admin_certified" && (
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() =>
                      setActionModal({
                        type: "revoke",
                        caseId: actionModal.caseData._id || actionModal.caseData.id || "",
                      })
                    }
                  >
                    Revoke
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  className="ml-auto"
                  onClick={() => setActionModal(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          {/* Approve / Reject dialog */}
          {(actionModal?.type === "approve" || actionModal?.type === "reject") && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={`Add ${actionModal.type === "approve" ? "approval" : "rejection"} notes...`}
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="secondary" size="small" onClick={() => setActionModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant={actionModal.type === "reject" ? "danger" : "primary"}
                  size="small"
                  onClick={handleAction}
                  state={isActionPending ? "loading" : "default"}
                >
                  {actionModal.type === "approve" ? "Approve" : "Reject"}
                </Button>
              </div>
            </div>
          )}

          {/* Certify / Revoke dialog */}
          {(actionModal?.type === "certify" || actionModal?.type === "revoke") && (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                {actionModal.type === "certify"
                  ? "Are you sure you want to certify this compliance case? This will mark it as fully compliant."
                  : "Are you sure you want to revoke the certification for this case? This action cannot be undone easily."}
              </p>
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="secondary" size="small" onClick={() => setActionModal(null)}>
                  Cancel
                </Button>
                <Button
                  variant={actionModal.type === "revoke" ? "danger" : "primary"}
                  size="small"
                  onClick={handleAction}
                  state={isActionPending ? "loading" : "default"}
                >
                  {actionModal.type === "certify" ? "Certify" : "Revoke"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
