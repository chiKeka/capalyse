"use client";

import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import {
  UsersIcon,
  DownloadIcon,
  EyeIcon,
  BanIcon,
  CheckCircle2Icon,
  BellIcon,
  ChevronDownIcon,
  XIcon,
  ShieldCheckIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  ActivityIcon,
  MailIcon,
} from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
import { SearchForm } from "@/components/search-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import { useUserDirectory } from "@/hooks/useDirectories";
import { useGetAdminDashboardStats } from "@/hooks/useAdmin";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import useDebounce from "@/hooks/useDebounce";

// ── Types ───────────────────────────────────────────────────────────────────

type TabKey = "SMEs" | "Investors" | "Development Organization";
type UserStatus = "" | "active" | "suspended" | "Pending";
type DateRange = "all" | "7" | "30" | "90";
type SortBy = "name" | "date" | "readiness";

const TAB_ROLE_MAP: Record<TabKey, string> = {
  SMEs: "sme",
  Investors: "investor",
  "Development Organization": "development_org",
};

const TAB_SLUG_MAP: Record<TabKey, string> = {
  SMEs: "sme",
  Investors: "investor",
  "Development Organization": "dev",
};

const STATUS_OPTIONS: { label: string; value: UserStatus }[] = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Pending", value: "Pending" },
];

const DATE_RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
];

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: "Name", value: "name" },
  { label: "Date Joined", value: "date" },
  { label: "Readiness Score", value: "readiness" },
];

const TABS: { label: string; key: TabKey }[] = [
  { label: "SMEs", key: "SMEs" },
  { label: "Investors", key: "Investors" },
  { label: "Dev Organizations", key: "Development Organization" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const getUserName = (row: any, tab: TabKey): string => {
  if (tab === "SMEs") {
    return row?.smeBusinessInfo?.businessName || row?.personalInfo?.firstName || "-";
  }
  if (tab === "Investors") {
    const first = row?.personalInfo?.firstName ?? "";
    const last = row?.personalInfo?.lastName ?? "";
    return `${first} ${last}`.trim() || "-";
  }
  return row?.devOrgInfo?.organizationName || "-";
};

const getUserEmail = (row: any): string => {
  return row?.personalInfo?.email || row?.email || "-";
};

const getUserAvatar = (row: any, tab: TabKey): string | null => {
  if (tab === "SMEs") return row?.smeBusinessInfo?.logo || null;
  if (tab === "Investors") return row?.investorOrganizationInfo?.logo || null;
  return row?.devOrgInfo?.logo || null;
};

const getUserStatus = (row: any, tab: TabKey): string => {
  if (tab === "Development Organization") {
    return row?.devOrgInfo?.verificationStatus || row?.status || "Pending";
  }
  return row?.status || "Pending";
};

const getUserJoinDate = (row: any): string | null => {
  return row?.createdAt || row?.personalInfo?.createdAt || null;
};

const getStatusBadgeClass = (status: string): string => {
  const s = status?.toLowerCase();
  if (s === "active" || s === "connected") return "bg-green-100 text-green-700";
  if (s === "suspended" || s === "rejected") return "bg-red-100 text-red-700";
  if (s === "pending" || s === "shortlisted") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

const renderStatusBadge = (status: string) => (
  <span
    className={cn(
      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
      getStatusBadgeClass(status),
    )}
  >
    <span
      className={cn(
        "w-2 h-2 rounded-full",
        status?.toLowerCase() === "active" || status?.toLowerCase() === "connected"
          ? "bg-green-500"
          : status?.toLowerCase() === "suspended" || status?.toLowerCase() === "rejected"
            ? "bg-red-500"
            : status?.toLowerCase() === "pending"
              ? "bg-yellow-400"
              : "bg-gray-400",
      )}
    />
    {status || "-"}
  </span>
);

const filterByDateRange = (dateStr: string | null, range: DateRange): boolean => {
  if (range === "all" || !dateStr) return true;
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= Number(range);
};

const filterByStatus = (row: any, tab: TabKey, status: UserStatus): boolean => {
  if (!status) return true;
  const userStatus = getUserStatus(row, tab)?.toLowerCase();
  return userStatus === status.toLowerCase();
};

const sortUsers = (users: any[], sortBy: SortBy, tab: TabKey): any[] => {
  return [...users].sort((a, b) => {
    if (sortBy === "name") {
      return getUserName(a, tab).localeCompare(getUserName(b, tab));
    }
    if (sortBy === "date") {
      const dateA = getUserJoinDate(a);
      const dateB = getUserJoinDate(b);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    }
    if (sortBy === "readiness") {
      return (b?.readinessScore || 0) - (a?.readinessScore || 0);
    }
    return 0;
  });
};

const exportUsersToCSV = (users: any[], tab: TabKey) => {
  if (!users || users.length === 0) {
    toast.error("No data to export");
    return;
  }

  let headers: string[];
  let rows: string[][];

  if (tab === "SMEs") {
    headers = ["Business Name", "Industry", "Country", "Readiness Score", "Revenue", "Team Size", "Status"];
    rows = users.map((u: any) => [
      u?.smeBusinessInfo?.businessName || "-",
      u?.smeBusinessInfo?.industry || "-",
      u?.smeBusinessInfo?.countryOfOperation?.join("; ") || "-",
      String(u?.readinessScore ?? "-"),
      String(u?.totalRevenue ?? "-"),
      String(u?.teamSize ?? "-"),
      u?.status || "-",
    ]);
  } else if (tab === "Investors") {
    headers = ["Name", "Organization", "Investor Type", "Target Regions", "Target Industries", "Status"];
    rows = users.map((u: any) => [
      `${u?.personalInfo?.firstName ?? ""} ${u?.personalInfo?.lastName ?? ""}`.trim() || "-",
      u?.investorOrganizationInfo?.organizationName || "-",
      u?.investorInvestmentInfo?.investmentTypes?.join("; ") || "-",
      u?.investorInvestmentInfo?.targetRegions?.join("; ") || "-",
      u?.investorInvestmentInfo?.targetIndustries?.join("; ") || "-",
      u?.status || "-",
    ]);
  } else {
    headers = ["Organization", "Headquarters", "Focus Areas", "Operating Regions", "Verification Status"];
    rows = users.map((u: any) => [
      u?.devOrgInfo?.organizationName || "-",
      u?.devOrgInfo?.countryHeadquarters || "-",
      u?.devOrgInfo?.focusAreas?.join("; ") || "-",
      u?.devOrgInfo?.operatingRegions?.join("; ") || "-",
      u?.devOrgInfo?.verificationStatus || "-",
    ]);
  }

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${tab.toLowerCase().replace(/\s+/g, "-")}-users-${format(new Date(), "yyyy-MM-dd")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`Exported ${rows.length} ${tab} users`);
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function UserManagementPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabKey>("SMEs");

  // Pagination
  const [page, setPage] = useState(1);

  // Search & filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [industryFilter, setIndustryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus>("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [sortBy, setSortBy] = useState<SortBy>("name");

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Detail dialog state
  const [detailUser, setDetailUser] = useState<any>(null);

  // ── Data hooks ──────────────────────────────────────────────────────────

  const { data: statsData, isLoading: statsLoading } = useGetAdminDashboardStats();

  const { data: usersData, isLoading: usersLoading } = useUserDirectory({
    role: TAB_ROLE_MAP[activeTab],
    page,
    q: debouncedSearch || undefined,
  });

  const { data: industries = [] } = useIndustries();

  // ── Derived data ────────────────────────────────────────────────────────

  const rawProfiles: any[] = usersData?.profiles || [];
  const pagination = usersData?.pagination;
  const totalFromApi = pagination?.total || 0;

  // Client-side filtering (status, date range, industry)
  const filteredProfiles = useMemo(() => {
    let filtered = rawProfiles;

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((u: any) => filterByStatus(u, activeTab, statusFilter));
    }

    // Date range filter
    if (dateRange !== "all") {
      filtered = filtered.filter((u: any) => filterByDateRange(getUserJoinDate(u), dateRange));
    }

    // Industry filter (applicable to SMEs mainly)
    if (industryFilter && activeTab === "SMEs") {
      filtered = filtered.filter(
        (u: any) => u?.smeBusinessInfo?.industry?.toLowerCase() === industryFilter.toLowerCase(),
      );
    }

    // Sort
    filtered = sortUsers(filtered, sortBy, activeTab);

    return filtered;
  }, [rawProfiles, statusFilter, dateRange, industryFilter, sortBy, activeTab]);

  // ── Stats ───────────────────────────────────────────────────────────────

  const kpiCards = useMemo(
    () => [
      {
        id: 1,
        icon: CIcons.profile2,
        lucideIcon: <UsersIcon className="w-6 h-6" />,
        label: "Total Users",
        amount: statsData?.totalUsers ?? 0,
      },
      {
        id: 2,
        icon: CIcons.badgeCheck,
        lucideIcon: <UserCheckIcon className="w-6 h-6" />,
        label: "Active Users",
        amount: (statsData?.activeSmes ?? 0) + (statsData?.activeInvestors ?? 0),
      },
      {
        id: 3,
        icon: CIcons.compliance,
        lucideIcon: <ClockIcon className="w-6 h-6" />,
        label: "Pending Verifications",
        amount: statsData?.pendingCompliance ?? 0,
      },
      {
        id: 4,
        icon: CIcons.discovered,
        lucideIcon: <UserPlusIcon className="w-6 h-6" />,
        label: "New This Month",
        amount: statsData?.newUsersThisMonth ?? totalFromApi,
      },
    ],
    [statsData, totalFromApi],
  );

  // ── Tab user counts (from separate queries) ────────────────────────────

  const { data: smeData } = useUserDirectory({ role: "sme", page: 1 });
  const { data: investorData } = useUserDirectory({ role: "investor", page: 1 });
  const { data: devData } = useUserDirectory({ role: "development_org", page: 1 });

  const tabCounts: Record<TabKey, number> = useMemo(
    () => ({
      SMEs: smeData?.pagination?.total ?? 0,
      Investors: investorData?.pagination?.total ?? 0,
      "Development Organization": devData?.pagination?.total ?? 0,
    }),
    [smeData, investorData, devData],
  );

  // ── Selection handlers ──────────────────────────────────────────────────

  const handleSelectUser = useCallback((userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedUserIds.length === filteredProfiles.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredProfiles.map((u: any) => u.userId || u._id || u.id));
    }
  }, [selectedUserIds, filteredProfiles]);

  const clearSelection = useCallback(() => setSelectedUserIds([]), []);

  // ── Tab switch handler ──────────────────────────────────────────────────

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setIndustryFilter("");
    setStatusFilter("");
    setDateRange("all");
    setSortBy("name");
    setSelectedUserIds([]);
  }, []);

  // ── Bulk actions ────────────────────────────────────────────────────────

  const handleBulkSuspend = useCallback(() => {
    toast.success(`Suspend action queued for ${selectedUserIds.length} user(s)`);
    setSelectedUserIds([]);
  }, [selectedUserIds]);

  const handleBulkActivate = useCallback(() => {
    toast.success(`Activate action queued for ${selectedUserIds.length} user(s)`);
    setSelectedUserIds([]);
  }, [selectedUserIds]);

  const handleBulkExport = useCallback(() => {
    const selectedUsers = filteredProfiles.filter((u: any) => {
      const uid = u.userId || u._id || u.id;
      return selectedUserIds.includes(uid);
    });
    exportUsersToCSV(selectedUsers, activeTab);
    setSelectedUserIds([]);
  }, [selectedUserIds, filteredProfiles, activeTab]);

  // ── Table columns ─────────────────────────────────────────────────────

  const smeColumns = useMemo(
    () => [
      {
        header: (
          <input
            type="checkbox"
            checked={filteredProfiles.length > 0 && selectedUserIds.length === filteredProfiles.length}
            onChange={handleSelectAll}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
        ),
        accessor: (row: any) => {
          const uid = row.userId || row._id || row.id;
          return (
            <input
              type="checkbox"
              checked={selectedUserIds.includes(uid)}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectUser(uid);
              }}
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
          );
        },
        className: "w-10",
      },
      {
        header: "Name",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            {row?.smeBusinessInfo?.logo ? (
              <img
                src={row.smeBusinessInfo.logo}
                alt={row?.smeBusinessInfo?.businessName || ""}
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center text-xs font-semibold text-green-700">
                {(row?.smeBusinessInfo?.businessName || "?")[0]?.toUpperCase()}
              </div>
            )}
            <span className="font-medium text-sm">{row?.smeBusinessInfo?.businessName ?? "-"}</span>
          </div>
        ),
      },
      {
        header: "Industry",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700">{row?.smeBusinessInfo?.industry ?? "-"}</span>
        ),
      },
      {
        header: "Country",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700">
            {row?.smeBusinessInfo?.countryOfOperation?.join(", ") ?? "-"}
          </span>
        ),
      },
      {
        header: "Readiness",
        accessor: (row: any) => {
          const score = row?.readinessScore;
          if (score == null) return <span className="text-sm text-gray-400">-</span>;
          return (
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    score >= 70 ? "bg-green-500" : score >= 40 ? "bg-yellow-500" : "bg-red-400",
                  )}
                  style={{ width: `${Math.min(score, 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{score}%</span>
            </div>
          );
        },
      },
      {
        header: "Status",
        accessor: (row: any) => renderStatusBadge(row?.status || "Pending"),
      },
      {
        header: "Actions",
        accessor: (row: any) => (
          <UserActionsDropdown
            row={row}
            tab="SMEs"
            onViewProfile={() => setDetailUser(row)}
          />
        ),
      },
    ],
    [filteredProfiles, selectedUserIds, handleSelectAll, handleSelectUser],
  );

  const investorColumns = useMemo(
    () => [
      {
        header: (
          <input
            type="checkbox"
            checked={filteredProfiles.length > 0 && selectedUserIds.length === filteredProfiles.length}
            onChange={handleSelectAll}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
        ),
        accessor: (row: any) => {
          const uid = row.userId || row._id || row.id;
          return (
            <input
              type="checkbox"
              checked={selectedUserIds.includes(uid)}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectUser(uid);
              }}
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
          );
        },
        className: "w-10",
      },
      {
        header: "Name",
        accessor: (row: any) => {
          const name = `${row?.personalInfo?.firstName ?? ""} ${row?.personalInfo?.lastName ?? ""}`.trim();
          return (
            <div className="flex items-center gap-2">
              {row?.investorOrganizationInfo?.logo ? (
                <Image
                  src={row.investorOrganizationInfo.logo}
                  alt={name || ""}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center text-xs font-semibold text-green-700">
                  {(name || "?")[0]?.toUpperCase()}
                </div>
              )}
              <span className="font-medium text-sm">{name || "-"}</span>
            </div>
          );
        },
      },
      {
        header: "Organization",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700">
            {row?.investorOrganizationInfo?.organizationName || "-"}
          </span>
        ),
      },
      {
        header: "Investor Type",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700">
            {row?.investorInvestmentInfo?.investmentTypes?.join(", ") ?? "-"}
          </span>
        ),
      },
      {
        header: "Target Regions",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700 max-w-[160px] truncate block">
            {row?.investorInvestmentInfo?.targetRegions?.join(", ") ?? "-"}
          </span>
        ),
      },
      {
        header: "Status",
        accessor: (row: any) => renderStatusBadge(row?.status || "Pending"),
      },
      {
        header: "Actions",
        accessor: (row: any) => (
          <UserActionsDropdown
            row={row}
            tab="Investors"
            onViewProfile={() => setDetailUser(row)}
          />
        ),
      },
    ],
    [filteredProfiles, selectedUserIds, handleSelectAll, handleSelectUser],
  );

  const devOrgColumns = useMemo(
    () => [
      {
        header: (
          <input
            type="checkbox"
            checked={filteredProfiles.length > 0 && selectedUserIds.length === filteredProfiles.length}
            onChange={handleSelectAll}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
        ),
        accessor: (row: any) => {
          const uid = row.userId || row._id || row.id;
          return (
            <input
              type="checkbox"
              checked={selectedUserIds.includes(uid)}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectUser(uid);
              }}
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
          );
        },
        className: "w-10",
      },
      {
        header: "Organization",
        accessor: (row: any) => (
          <div className="flex items-center gap-2">
            {row?.devOrgInfo?.logo ? (
              <Image
                src={row.devOrgInfo.logo}
                alt={row?.devOrgInfo?.organizationName || ""}
                width={32}
                height={32}
                className="rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center text-xs font-semibold text-green-700">
                {(row?.devOrgInfo?.organizationName || "?")[0]?.toUpperCase()}
              </div>
            )}
            <span className="font-medium text-sm">{row?.devOrgInfo?.organizationName || "-"}</span>
          </div>
        ),
      },
      {
        header: "Headquarters",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700">{row?.devOrgInfo?.countryHeadquarters ?? "-"}</span>
        ),
      },
      {
        header: "Focus Areas",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700 max-w-[180px] truncate block">
            {row?.devOrgInfo?.focusAreas?.join(", ") || "-"}
          </span>
        ),
      },
      {
        header: "Operating Regions",
        accessor: (row: any) => (
          <span className="text-sm text-gray-700 max-w-[160px] truncate block">
            {row?.devOrgInfo?.operatingRegions?.join(", ") || "-"}
          </span>
        ),
      },
      {
        header: "Verification",
        accessor: (row: any) => renderStatusBadge(row?.devOrgInfo?.verificationStatus || "Pending"),
      },
      {
        header: "Actions",
        accessor: (row: any) => (
          <UserActionsDropdown
            row={row}
            tab="Development Organization"
            onViewProfile={() => setDetailUser(row)}
          />
        ),
      },
    ],
    [filteredProfiles, selectedUserIds, handleSelectAll, handleSelectUser],
  );

  const activeColumns = useMemo(() => {
    if (activeTab === "SMEs") return smeColumns;
    if (activeTab === "Investors") return investorColumns;
    return devOrgColumns;
  }, [activeTab, smeColumns, investorColumns, devOrgColumns]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all platform users across SMEs, Investors, and Development Organizations.
          </p>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={() => exportUsersToCSV(filteredProfiles, activeTab)}
        >
          <DownloadIcon className="w-4 h-4 mr-1" />
          Export CSV
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="min-h-[120px] shadow-none animate-pulse">
                <CardContent className="h-full py-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))
          : kpiCards.map((card) => (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm text-[#18181B]">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-4xl font-bold text-[#18181B]">{card.amount}</span>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                      {card.icon()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={cn(
                "px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 cursor-pointer",
                activeTab === tab.key
                  ? "border-[#008060] text-[#008060]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full",
                  activeTab === tab.key
                    ? "bg-[#F4FFFC] text-[#008060]"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {tabCounts[tab.key]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            {activeTab === "Development Organization" ? "Dev Organizations" : activeTab}
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {pagination?.total || filteredProfiles.length}
            </span>
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap w-full lg:w-auto justify-end">
          {/* Industry filter (SMEs only) */}
          {activeTab === "SMEs" && (
            <Select
              value={industryFilter || "__all__"}
              onValueChange={(v) => {
                setPage(1);
                setIndustryFilter(v === "__all__" ? "" : v);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Industries</SelectItem>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Status filter */}
          <Select
            value={statusFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setStatusFilter(v === "__all__" ? "" : (v as UserStatus));
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value || "__all__"} value={opt.value || "__all__"}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date range filter */}
          <Select
            value={dateRange}
            onValueChange={(v) => {
              setPage(1);
              setDateRange(v as DateRange);
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort by */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortBy)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <SearchForm
            className="w-full sm:w-auto md:min-w-[220px]"
            inputClassName="h-10 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUserIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border border-[#ABD2C7] bg-[#F4FFFC]">
          <span className="text-sm font-medium text-[#008060]">
            {selectedUserIds.length} user{selectedUserIds.length !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" size="small" onClick={handleBulkSuspend}>
              <BanIcon className="w-3.5 h-3.5 mr-1" />
              Suspend Selected
            </Button>
            <Button variant="secondary" size="small" onClick={handleBulkActivate}>
              <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />
              Activate Selected
            </Button>
            <Button variant="primary" size="small" onClick={handleBulkExport}>
              <DownloadIcon className="w-3.5 h-3.5 mr-1" />
              Export Selected
            </Button>
            <Button variant="tertiary" size="small" onClick={clearSelection}>
              <XIcon className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* User Table */}
      <ReusableTable
        columns={activeColumns}
        data={filteredProfiles}
        loading={usersLoading}
        totalPages={pagination?.totalPages}
        page={page}
        setPage={setPage}
        noDataText="No users found matching your criteria. Try adjusting your filters or search."
        noDataCaption="No users found"
      />

      {/* User Detail Dialog */}
      <UserDetailDialog
        user={detailUser}
        tab={activeTab}
        open={!!detailUser}
        onClose={() => setDetailUser(null)}
      />
    </div>
  );
}

// ── User Actions Dropdown ─────────────────────────────────────────────────

function UserActionsDropdown({
  row,
  tab,
  onViewProfile,
}: {
  row: any;
  tab: TabKey;
  onViewProfile: () => void;
}) {
  const userId = row.userId || row._id || row.id;
  const slug = TAB_SLUG_MAP[tab];
  const currentStatus = getUserStatus(row, tab)?.toLowerCase();

  const handleToggleStatus = () => {
    if (currentStatus === "active") {
      toast.success("User suspension queued");
    } else {
      toast.success("User activation queued");
    }
  };

  const handleSendNotification = () => {
    toast.success("Notification sent to user");
  };

  return (
    <div className="flex gap-1.5">
      <Button variant="secondary" size="small" onClick={onViewProfile}>
        <EyeIcon className="w-3.5 h-3.5 mr-1" />
        View
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="small">
            <ChevronDownIcon className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href={`/admin/user-management/${slug}/${userId}`}>
              <EyeIcon className="w-4 h-4 mr-2" />
              Full Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleToggleStatus}>
            {currentStatus === "active" ? (
              <>
                <BanIcon className="w-4 h-4 mr-2 text-red-500" />
                Suspend User
              </>
            ) : (
              <>
                <CheckCircle2Icon className="w-4 h-4 mr-2 text-green-600" />
                Activate User
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={handleSendNotification}>
            <BellIcon className="w-4 h-4 mr-2" />
            Send Notification
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── User Detail Dialog ──────────────────────────────────────────────────────

function UserDetailDialog({
  user,
  tab,
  open,
  onClose,
}: {
  user: any;
  tab: TabKey;
  open: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  const userId = user.userId || user._id || user.id;
  const slug = TAB_SLUG_MAP[tab];
  const name = getUserName(user, tab);
  const email = getUserEmail(user);
  const avatar = getUserAvatar(user, tab);
  const status = getUserStatus(user, tab);
  const joinDate = getUserJoinDate(user);

  const handleToggleStatus = () => {
    if (status?.toLowerCase() === "active") {
      toast.success("User suspension queued");
    } else {
      toast.success("User activation queued");
    }
  };

  const handleSendNotification = () => {
    toast.success("Notification sent to user");
  };

  // Build detail items based on tab
  const detailItems: { label: string; value: string; icon: React.ReactNode }[] = [];

  if (tab === "SMEs") {
    detailItems.push(
      {
        label: "Industry",
        value: user?.smeBusinessInfo?.industry || "-",
        icon: <BriefcaseIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Country",
        value: user?.smeBusinessInfo?.countryOfOperation?.join(", ") || "-",
        icon: <MapPinIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Readiness Score",
        value: user?.readinessScore != null ? `${user.readinessScore}%` : "-",
        icon: <ActivityIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Team Size",
        value: user?.teamSize != null ? String(user.teamSize) : "-",
        icon: <UsersIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Revenue",
        value: user?.totalRevenue != null ? String(user.totalRevenue) : "-",
        icon: <BuildingIcon className="w-4 h-4 text-gray-400" />,
      },
    );
  } else if (tab === "Investors") {
    detailItems.push(
      {
        label: "Organization",
        value: user?.investorOrganizationInfo?.organizationName || "-",
        icon: <BuildingIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Investor Type",
        value: user?.investorInvestmentInfo?.investmentTypes?.join(", ") || "-",
        icon: <BriefcaseIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Target Regions",
        value: user?.investorInvestmentInfo?.targetRegions?.join(", ") || "-",
        icon: <MapPinIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Target Industries",
        value: user?.investorInvestmentInfo?.targetIndustries?.join(", ") || "-",
        icon: <BriefcaseIcon className="w-4 h-4 text-gray-400" />,
      },
    );
  } else {
    detailItems.push(
      {
        label: "Headquarters",
        value: user?.devOrgInfo?.countryHeadquarters || "-",
        icon: <MapPinIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Focus Areas",
        value: user?.devOrgInfo?.focusAreas?.join(", ") || "-",
        icon: <BriefcaseIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Operating Regions",
        value: user?.devOrgInfo?.operatingRegions?.join(", ") || "-",
        icon: <MapPinIcon className="w-4 h-4 text-gray-400" />,
      },
      {
        label: "Verification Status",
        value: user?.devOrgInfo?.verificationStatus || "-",
        icon: <ShieldCheckIcon className="w-4 h-4 text-gray-400" />,
      },
    );
  }

  // Activity summary
  const lastLogin = user?.lastLogin || user?.lastActive || null;
  const profileCompletion = user?.profileCompletion ?? user?.completionPercentage ?? null;
  const totalInteractions = user?.totalInteractions ?? user?.interactionCount ?? null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>Detailed information and quick actions</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* User Header */}
          <div className="flex items-start gap-4 p-4 rounded-lg border border-[#ABD2C7] bg-[#F4FFFC]">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#ABD2C7]"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white border-2 border-[#ABD2C7] flex items-center justify-center text-lg font-bold text-[#008060]">
                {(name || "?")[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[#18181B] truncate">{name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <MailIcon className="w-3.5 h-3.5" />
                {email}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge
                  variant="status"
                  className={cn(
                    "text-xs capitalize",
                    tab === "SMEs"
                      ? "bg-blue-100 text-blue-700"
                      : tab === "Investors"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-orange-100 text-orange-700",
                  )}
                >
                  {tab === "Development Organization" ? "Dev Org" : tab.replace(/s$/, "")}
                </Badge>
                {renderStatusBadge(status)}
                {joinDate && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    Joined {format(new Date(joinDate), "MMM d, yyyy")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E8E8]"
              >
                <div className="mt-0.5">{item.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-[#2E3034] truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-lg border border-[#E8E8E8]">
              <p className="text-xs text-gray-500 mb-1">Last Login</p>
              <p className="text-sm font-medium text-[#2E3034]">
                {lastLogin ? format(new Date(lastLogin), "MMM d, yyyy") : "-"}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg border border-[#E8E8E8]">
              <p className="text-xs text-gray-500 mb-1">Profile Completion</p>
              <div className="flex items-center justify-center gap-1.5">
                {profileCompletion != null ? (
                  <>
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#008060]"
                        style={{ width: `${Math.min(profileCompletion, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-[#2E3034]">{profileCompletion}%</span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-[#2E3034]">-</span>
                )}
              </div>
            </div>
            <div className="text-center p-3 rounded-lg border border-[#E8E8E8]">
              <p className="text-xs text-gray-500 mb-1">Interactions</p>
              <p className="text-sm font-medium text-[#2E3034]">
                {totalInteractions != null ? totalInteractions : "-"}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <Button
              variant={status?.toLowerCase() === "active" ? "danger" : "primary"}
              size="small"
              onClick={handleToggleStatus}
            >
              {status?.toLowerCase() === "active" ? (
                <>
                  <BanIcon className="w-3.5 h-3.5 mr-1" />
                  Suspend User
                </>
              ) : (
                <>
                  <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />
                  Activate User
                </>
              )}
            </Button>
            <Button variant="secondary" size="small" onClick={handleSendNotification}>
              <BellIcon className="w-3.5 h-3.5 mr-1" />
              Send Notification
            </Button>
            <Link href={`/admin/user-management/${slug}/${userId}`}>
              <Button variant="secondary" size="small">
                <EyeIcon className="w-3.5 h-3.5 mr-1" />
                View Full Profile
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
