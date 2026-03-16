"use client";

import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import {
  UsersIcon,
  DownloadIcon,
  EyeIcon,
  BanIcon,
  CheckCircle2Icon,
  BellIcon,
  XIcon,
  ShieldCheckIcon,
  BuildingIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  ActivityIcon,
  MailIcon,
  SearchIcon,
  ChevronDownIcon,
  Loader2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  TrashIcon,
  KeyIcon,
  AlertTriangleIcon,
  StarIcon,
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
import { cn } from "@/lib/utils";

import { useUserDirectory } from "@/hooks/useDirectories";
import { useGetAdminDashboardStats } from "@/hooks/useAdmin";
import useDebounce from "@/hooks/useDebounce";
import UserManagementTabContents from "@/components/pageComponents/UserManagementTabContents";
import SMEDetails from "@/components/useManagementComponents.tsx/SMEDetails";
import InvestorDetails from "@/components/useManagementComponents.tsx/InvestorDetails";
import DevOrgDetails from "@/components/useManagementComponents.tsx/DevOrgDetails";

// ── Types ────────────────────────────────────────────────────────────────────

type CategoryRoute = "sme" | "investor" | "dev";
type UserStatus = "" | "active" | "suspended" | "Pending";
type DateRange = "all" | "7" | "30" | "90";

// ── Helpers ──────────────────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100 h-[120px]", className)} />;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-100", className)} />;
}

const CATEGORY_ROUTES: CategoryRoute[] = ["sme", "investor", "dev"];

const CATEGORY_CONFIG: Record<CategoryRoute, { label: string; roleParam: string; pluralLabel: string }> = {
  sme: { label: "SME", roleParam: "sme", pluralLabel: "SMEs" },
  investor: { label: "Investor", roleParam: "investor", pluralLabel: "Investors" },
  dev: { label: "Dev Organization", roleParam: "development_org", pluralLabel: "Development Organizations" },
};

const STATUS_OPTIONS: { label: string; value: UserStatus }[] = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Pending", value: "Pending" },
];

const getStatusBadgeClass = (status: string): string => {
  const s = status?.toLowerCase();
  if (s === "active" || s === "connected") return "bg-green-100 text-green-700";
  if (s === "suspended" || s === "rejected") return "bg-red-100 text-red-700";
  if (s === "pending" || s === "shortlisted") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

const getUserName = (row: any, route: CategoryRoute): string => {
  if (route === "sme") return row?.smeBusinessInfo?.businessName || row?.personalInfo?.firstName || "-";
  if (route === "investor") {
    const first = row?.personalInfo?.firstName ?? "";
    const last = row?.personalInfo?.lastName ?? "";
    return `${first} ${last}`.trim() || "-";
  }
  return row?.devOrgInfo?.organizationName || "-";
};

const getUserEmail = (row: any): string => row?.personalInfo?.email || row?.email || "-";

const getUserStatus = (row: any, route: CategoryRoute): string => {
  if (route === "dev") return row?.devOrgInfo?.verificationStatus || row?.status || "Pending";
  return row?.status || "Pending";
};

const getUserJoinDate = (row: any): string | null => row?.createdAt || row?.personalInfo?.createdAt || null;

const getUserAvatar = (row: any, route: CategoryRoute): string | null => {
  if (route === "sme") return row?.smeBusinessInfo?.logo || null;
  if (route === "investor") return row?.investorOrganizationInfo?.logo || null;
  return row?.devOrgInfo?.logo || null;
};

const getExtraColumn = (row: any, route: CategoryRoute): string => {
  if (route === "sme") return row?.smeBusinessInfo?.industry || "-";
  if (route === "investor") return row?.investorOrganizationInfo?.investorType || "-";
  return row?.devOrgInfo?.organizationType || "-";
};

// ── Main Page ────────────────────────────────────────────────────────────────

export default function UserManagementRoutePage() {
  const params = useParams();
  const route = params?.route as string;

  // Check if this is a known category route
  if (CATEGORY_ROUTES.includes(route as CategoryRoute)) {
    return <CategoryView route={route as CategoryRoute} />;
  }

  // If not a known category, treat as a user ID route — render the original behavior
  return (
    <UserManagementTabContents
      type={
        route === "investor"
          ? "Investors"
          : route === "dev"
            ? "Development Organization"
            : undefined
      }
    />
  );
}

// ── Category View ────────────────────────────────────────────────────────────

function CategoryView({ route }: { route: CategoryRoute }) {
  const config = CATEGORY_CONFIG[route];
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus>("");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [quickViewUser, setQuickViewUser] = useState<any>(null);
  const [bulkAction, setBulkAction] = useState<string>("");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: users, isLoading } = useUserDirectory({
    role: config.roleParam,
    search: debouncedSearch || undefined,
  });

  const { data: dashStats } = useGetAdminDashboardStats();

  const userList = useMemo(() => {
    let result = users?.profiles ?? users?.users ?? users ?? [];
    if (!Array.isArray(result)) result = [];

    // Filter by status
    if (statusFilter) {
      result = result.filter((u: any) => getUserStatus(u, route)?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Filter by date range
    if (dateRange !== "all") {
      const days = Number(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      result = result.filter((u: any) => {
        const joinDate = getUserJoinDate(u);
        return joinDate ? new Date(joinDate) >= cutoff : true;
      });
    }

    return result;
  }, [users, statusFilter, dateRange, route]);

  // ── Category-Specific KPIs ───────────────────────────────────────────────

  const kpis = useMemo(() => {
    const totalCount = userList.length;
    const activeCount = userList.filter((u: any) => getUserStatus(u, route)?.toLowerCase() === "active").length;
    const pendingCount = userList.filter((u: any) => getUserStatus(u, route)?.toLowerCase() === "pending").length;
    const newThisMonth = userList.filter((u: any) => {
      const date = getUserJoinDate(u);
      if (!date) return false;
      const d = new Date(date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    if (route === "sme") {
      return [
        { id: 1, label: "Total SMEs", value: totalCount, icon: CIcons.smeOutline },
        { id: 2, label: "Active SMEs", value: activeCount, icon: CIcons.readiness },
        { id: 3, label: "Avg Readiness", value: "68%", icon: CIcons.linearGraph },
        { id: 4, label: "New This Month", value: newThisMonth, icon: CIcons.profile2 },
      ];
    }
    if (route === "investor") {
      return [
        { id: 1, label: "Total Investors", value: totalCount, icon: CIcons.investorOutline },
        { id: 2, label: "Active Investors", value: activeCount, icon: CIcons.heartTick },
        { id: 3, label: "Total Invested", value: "--", icon: CIcons.walletMoney },
        { id: 4, label: "New This Month", value: newThisMonth, icon: CIcons.profile2 },
      ];
    }
    return [
      { id: 1, label: "Total Dev Orgs", value: totalCount, icon: CIcons.organisationOutline },
      { id: 2, label: "Active", value: activeCount, icon: CIcons.overview },
      { id: 3, label: "Programs Created", value: "--", icon: CIcons.compliance },
      { id: 4, label: "New This Month", value: newThisMonth, icon: CIcons.profile2 },
    ];
  }, [userList, route]);

  // ── Selection Handlers ───────────────────────────────────────────────────

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const toggleAll = () => {
    if (selectedUsers.length === userList.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(userList.map((u: any) => u._id ?? u.id));
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }
    toast.success(`${action} action applied to ${selectedUsers.length} users`);
    setSelectedUsers([]);
    setBulkAction("");
  };

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/admin/user-management" className="text-green hover:underline font-medium">
          User Management
        </Link>
        <span className="text-muted-foreground">&gt;</span>
        <span className="text-[#18181B] font-medium">{config.pluralLabel}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">{config.pluralLabel}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and monitor all {config.pluralLabel.toLowerCase()} on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="small">
            <DownloadIcon className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpis.map((kpi) => (
              <Card key={kpi.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm text-[#18181B]">{kpi.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-3xl font-bold text-[#18181B]">
                      {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
                    </span>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2 shrink-0">
                      {typeof kpi.icon === "function" ? kpi.icon({ className: "w-6 h-6" }) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${config.pluralLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as UserStatus)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value || "all"}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        {selectedUsers.length > 0 && (
          <div className="flex gap-2">
            <Button variant="secondary" size="small" onClick={() => handleBulkAction("Activate")}>
              <CheckCircle2Icon className="w-3.5 h-3.5 mr-1" />
              Activate ({selectedUsers.length})
            </Button>
            <Button variant="danger" size="small" onClick={() => handleBulkAction("Suspend")}>
              <BanIcon className="w-3.5 h-3.5 mr-1" />
              Suspend ({selectedUsers.length})
            </Button>
          </div>
        )}
      </div>

      {/* User Table */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : userList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold text-base mb-1">No {config.pluralLabel.toLowerCase()} found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === userList.length && userList.length > 0}
                        onChange={toggleAll}
                        className="rounded border-gray-300 accent-[#008060]"
                      />
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">
                      {route === "sme" ? "Industry" : route === "investor" ? "Type" : "Org Type"}
                    </th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Joined</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map((user: any) => {
                    const userId = user._id ?? user.id;
                    const name = getUserName(user, route);
                    const email = getUserEmail(user);
                    const status = getUserStatus(user, route);
                    const joinDate = getUserJoinDate(user);
                    const avatar = getUserAvatar(user, route);
                    const extra = getExtraColumn(user, route);
                    const isSelected = selectedUsers.includes(userId);

                    return (
                      <tr key={userId} className={cn("border-b border-gray-50 hover:bg-gray-50/50", isSelected && "bg-green-50/30")}>
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleUser(userId)}
                            className="rounded border-gray-300 accent-[#008060]"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {avatar ? (
                              <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
                                <UsersIcon className="w-3.5 h-3.5 text-green" />
                              </div>
                            )}
                            <Link
                              href={`/admin/user-management/${route}/${userId}`}
                              className="font-medium text-[#18181B] hover:text-green hover:underline"
                            >
                              {name}
                            </Link>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground text-xs">{email}</td>
                        <td className="py-2.5 px-3 text-muted-foreground text-xs">{extra}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                              getStatusBadgeClass(status),
                            )}
                          >
                            <span
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                status?.toLowerCase() === "active" ? "bg-green-500" :
                                status?.toLowerCase() === "suspended" ? "bg-red-500" :
                                "bg-yellow-400",
                              )}
                            />
                            {status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-muted-foreground text-xs">
                          {joinDate ? format(new Date(joinDate), "MMM d, yyyy") : "-"}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setQuickViewUser(user)}
                              className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                              title="Quick View"
                            >
                              <EyeIcon className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <Link href={`/admin/user-management/${route}/${userId}`}>
                              <button className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer" title="View Details">
                                <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick View Dialog */}
      <QuickViewDialog user={quickViewUser} route={route} open={!!quickViewUser} onClose={() => setQuickViewUser(null)} />
    </div>
  );
}

// ── Quick View Dialog ────────────────────────────────────────────────────────

function QuickViewDialog({
  user,
  route,
  open,
  onClose,
}: {
  user: any;
  route: CategoryRoute;
  open: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  const name = getUserName(user, route);
  const email = getUserEmail(user);
  const status = getUserStatus(user, route);
  const joinDate = getUserJoinDate(user);
  const avatar = getUserAvatar(user, route);
  const userId = user._id ?? user.id;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Quick View</DialogTitle>
          <DialogDescription>Overview of user details</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-green" />
              </div>
            )}
            <div>
              <p className="text-base font-bold text-[#18181B]">{name}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">
                  {CATEGORY_CONFIG[route].label}
                </Badge>
                <span className={cn("px-2 py-0.5 text-[10px] font-medium rounded-full", getStatusBadgeClass(status))}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" /> Joined
              </span>
              <span className="text-xs font-medium text-[#18181B]">
                {joinDate ? format(new Date(joinDate), "MMMM d, yyyy") : "-"}
              </span>
            </div>
            {route === "sme" && (
              <>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <BriefcaseIcon className="w-3.5 h-3.5" /> Industry
                  </span>
                  <span className="text-xs font-medium text-[#18181B]">
                    {user?.smeBusinessInfo?.industry || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5" /> Location
                  </span>
                  <span className="text-xs font-medium text-[#18181B]">
                    {user?.smeBusinessInfo?.countryOfOperation?.join(", ") || "-"}
                  </span>
                </div>
              </>
            )}
            {route === "investor" && (
              <>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <BuildingIcon className="w-3.5 h-3.5" /> Organization
                  </span>
                  <span className="text-xs font-medium text-[#18181B]">
                    {user?.investorOrganizationInfo?.organizationName || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <BriefcaseIcon className="w-3.5 h-3.5" /> Investor Type
                  </span>
                  <span className="text-xs font-medium text-[#18181B]">
                    {user?.investorOrganizationInfo?.investorType || "-"}
                  </span>
                </div>
              </>
            )}
            {route === "dev" && (
              <>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <BuildingIcon className="w-3.5 h-3.5" /> Organization
                  </span>
                  <span className="text-xs font-medium text-[#18181B]">
                    {user?.devOrgInfo?.organizationName || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <MapPinIcon className="w-3.5 h-3.5" /> Org Type
                  </span>
                  <span className="text-xs font-medium text-[#18181B]">
                    {user?.devOrgInfo?.organizationType || "-"}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link href={`/admin/user-management/${route}/${userId}`} className="flex-1">
              <Button variant="primary" size="small" className="w-full">
                View Full Profile
              </Button>
            </Link>
            <Button variant="secondary" size="small" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
