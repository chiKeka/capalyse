"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import Link from "next/link";
import {
  UsersIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  TicketIcon,
  DollarSignIcon,
  ActivityIcon,
  BarChart2Icon,
  ServerIcon,
  PlusIcon,
  UserPlusIcon,
  ClipboardCheckIcon,
  DownloadIcon,
  HeadphonesIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Loader2Icon,
  DatabaseIcon,
  WifiIcon,
  BugIcon,
  ArrowRightIcon,
  FolderIcon,
  ZapIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/uitils/fns";
import { useGetAdminDashboardStats, useGetAdminAnalytics } from "@/hooks/useAdmin";
import { useGetAllTickets } from "@/hooks/useAdmin";
import { GetPrograms } from "@/hooks/usePrograms";
import { authAtom } from "@/lib/atoms/atoms";
import { useAtomValue } from "jotai";
import { routes } from "@/lib/routes";

// ── Types ────────────────────────────────────────────────────────────────────

type TabKey = "overview" | "user-activity" | "programs" | "system-health";

// ── Skeleton Components ──────────────────────────────────────────────────────

function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-gray-100 h-[120px]", className)} />;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-gray-100", className)} />;
}

// ── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "user-activity", label: "User Activity" },
  { key: "programs", label: "Programs" },
  { key: "system-health", label: "System Health" },
];

// ── Mock Data (replace with real API hooks when available) ───────────────────

function getMockRecentActivity() {
  return [
    { id: "1", action: "New SME registered", user: "GreenPack Solutions", time: "2 min ago", type: "registration" },
    { id: "2", action: "Program application submitted", user: "TechStart Inc", time: "5 min ago", type: "application" },
    { id: "3", action: "Compliance case certified", user: "AgroVentures Ltd", time: "12 min ago", type: "compliance" },
    { id: "4", action: "Investment interest expressed", user: "Sahara Capital", time: "18 min ago", type: "investment" },
    { id: "5", action: "Support ticket opened", user: "EduBridge Academy", time: "25 min ago", type: "support" },
    { id: "6", action: "User profile updated", user: "MediCare Hub", time: "32 min ago", type: "profile" },
    { id: "7", action: "New investor onboarded", user: "Atlas Fund", time: "45 min ago", type: "registration" },
    { id: "8", action: "Program milestone achieved", user: "Growth Accelerator", time: "1 hr ago", type: "program" },
    { id: "9", action: "Document verification pending", user: "SolarTech NG", time: "1.5 hr ago", type: "compliance" },
    { id: "10", action: "Funding disbursement processed", user: "AgriFirst Fund", time: "2 hr ago", type: "finance" },
  ];
}

function getMockRegistrationsByWeek() {
  return [
    { week: "Week 1", sme: 12, investor: 4, devOrg: 2 },
    { week: "Week 2", sme: 18, investor: 6, devOrg: 1 },
    { week: "Week 3", sme: 15, investor: 8, devOrg: 3 },
    { week: "Week 4", sme: 22, investor: 5, devOrg: 2 },
  ];
}

function getMockRecentSignups() {
  return [
    { id: "1", name: "GreenPack Solutions", role: "SME", email: "info@greenpack.ng", date: "2026-03-16", status: "Active" },
    { id: "2", name: "Atlas Capital Fund", role: "Investor", email: "contact@atlas.com", date: "2026-03-15", status: "Pending" },
    { id: "3", name: "EduBridge Academy", role: "SME", email: "hello@edubridge.ng", date: "2026-03-15", status: "Active" },
    { id: "4", name: "Impact Partners Africa", role: "Dev Org", email: "info@impactafrica.org", date: "2026-03-14", status: "Active" },
    { id: "5", name: "SolarTech Nigeria", role: "SME", email: "team@solartech.ng", date: "2026-03-14", status: "Pending" },
  ];
}

function getMockProgramsByStatus() {
  return [
    { status: "Active", count: 8, color: "#008060" },
    { status: "Draft", count: 3, color: "#f59e0b" },
    { status: "Closed", count: 5, color: "#6b7280" },
    { status: "Upcoming", count: 2, color: "#3b82f6" },
  ];
}

function getMockTopPrograms() {
  return [
    { id: "1", name: "Growth Accelerator 2026", enrollment: 145, category: "Business Development", status: "Active" },
    { id: "2", name: "AgriTech Innovation Fund", enrollment: 89, category: "Agriculture", status: "Active" },
    { id: "3", name: "Women in Tech Initiative", enrollment: 72, category: "Technology", status: "Active" },
    { id: "4", name: "Climate Resilience Program", enrollment: 56, category: "Environment", status: "Active" },
    { id: "5", name: "Financial Inclusion Drive", enrollment: 41, category: "Finance", status: "Draft" },
  ];
}

function getMockSystemHealth() {
  return {
    uptime: 99.97,
    avgResponseTime: 142,
    errorRate: 0.03,
    storageUsed: 67,
    storageTotal: 100,
    recentErrors: [
      { id: "1", timestamp: "2026-03-16 14:32:01", service: "Payment Gateway", level: "error", message: "Timeout connecting to provider", count: 3 },
      { id: "2", timestamp: "2026-03-16 13:15:44", service: "Notification Service", level: "warn", message: "High queue backlog detected", count: 1 },
      { id: "3", timestamp: "2026-03-16 11:08:22", service: "File Upload", level: "error", message: "Storage write failed - disk quota", count: 2 },
      { id: "4", timestamp: "2026-03-16 09:45:10", service: "Authentication", level: "warn", message: "Unusual login pattern detected", count: 5 },
      { id: "5", timestamp: "2026-03-16 08:20:33", service: "Search Index", level: "info", message: "Reindexing completed successfully", count: 1 },
    ],
  };
}

function getMockAlerts() {
  return [
    { id: "1", severity: "high", message: "3 compliance cases pending review for 7+ days", action: "/admin/compliance-management" },
    { id: "2", severity: "medium", message: "Storage usage approaching 70% threshold", action: "#" },
    { id: "3", severity: "low", message: "5 new user verifications awaiting approval", action: "/admin/user-management" },
  ];
}

// ── Activity Type Icon ───────────────────────────────────────────────────────

function ActivityTypeIcon({ type }: { type: string }) {
  const iconClass = "w-4 h-4";
  switch (type) {
    case "registration":
      return <UserPlusIcon className={cn(iconClass, "text-blue-600")} />;
    case "application":
      return <FolderIcon className={cn(iconClass, "text-green-600")} />;
    case "compliance":
      return <ShieldCheckIcon className={cn(iconClass, "text-purple-600")} />;
    case "investment":
      return <DollarSignIcon className={cn(iconClass, "text-emerald-600")} />;
    case "support":
      return <HeadphonesIcon className={cn(iconClass, "text-orange-600")} />;
    case "profile":
      return <UsersIcon className={cn(iconClass, "text-slate-600")} />;
    case "program":
      return <BarChart2Icon className={cn(iconClass, "text-indigo-600")} />;
    case "finance":
      return <DollarSignIcon className={cn(iconClass, "text-teal-600")} />;
    default:
      return <ActivityIcon className={cn(iconClass, "text-gray-500")} />;
  }
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const auth: any = useAtomValue(authAtom);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const { data: dashStats, isLoading: statsLoading } = useGetAdminDashboardStats();
  const { data: adminAnalytics, isLoading: analyticsLoading } = useGetAdminAnalytics("NGN");
  const { data: allTickets, isLoading: ticketsLoading } = useGetAllTickets();
  const { data: programs, isLoading: programsLoading } = GetPrograms({ page: 1, limit: 100 });

  const isLoading = statsLoading || analyticsLoading;
  const analyticsData = adminAnalytics?.data;

  // ── Derived Stats ──────────────────────────────────────────────────────────

  const totalUsers = analyticsData?.users?.total ?? dashStats?.totalUsers ?? 0;
  const activePrograms = analyticsData?.programs?.total ?? dashStats?.activePrograms ?? 0;
  const pendingVerifications = analyticsData?.pendingUserVerification ?? 0;
  const totalFundingDisbursed = analyticsData?.investmentsRecorded?.[0]?.amount ?? 0;
  const fundingCurrency = analyticsData?.investmentsRecorded?.[0]?.currency ?? "NGN";
  const newUsersWeek = dashStats?.newUsersThisWeek ?? 24;
  const complianceRate = dashStats?.complianceRate ?? 87;
  const openTickets = Array.isArray(allTickets) ? allTickets.filter((t: any) => t.status === "open").length : 0;
  const platformRevenue = dashStats?.platformRevenue ?? 0;

  const kpiCards = [
    {
      id: 1,
      icon: CIcons.profile2,
      label: "Total Users",
      value: totalUsers,
      format: "number",
      trend: "+12%",
      trendUp: true,
    },
    {
      id: 2,
      icon: CIcons.overview,
      label: "Active Programs",
      value: activePrograms,
      format: "number",
      trend: "+3",
      trendUp: true,
    },
    {
      id: 3,
      icon: CIcons.compliance,
      label: "Pending Verifications",
      value: pendingVerifications,
      format: "number",
      trend: pendingVerifications > 5 ? "Needs attention" : "Normal",
      trendUp: pendingVerifications <= 5,
    },
    {
      id: 4,
      icon: CIcons.walletMoney,
      label: "Funding Disbursed",
      value: totalFundingDisbursed,
      format: "currency",
      currency: fundingCurrency,
      trend: "+18%",
      trendUp: true,
    },
    {
      id: 5,
      icon: CIcons.profile2,
      label: "New Users (7d)",
      value: newUsersWeek,
      format: "number",
      trend: "+8%",
      trendUp: true,
    },
    {
      id: 6,
      icon: CIcons.readiness,
      label: "Compliance Rate",
      value: complianceRate,
      format: "percent",
      trend: "+2.5%",
      trendUp: true,
    },
    {
      id: 7,
      icon: CIcons.support,
      label: "Open Tickets",
      value: openTickets,
      format: "number",
      trend: openTickets > 10 ? "High" : "Normal",
      trendUp: openTickets <= 10,
    },
    {
      id: 8,
      icon: CIcons.walletMoney,
      label: "Platform Revenue",
      value: platformRevenue,
      format: "currency",
      currency: "NGN",
      trend: "+22%",
      trendUp: true,
    },
  ];

  const usersByRole = analyticsData?.users?.byRole ?? {};
  const recentActivity = getMockRecentActivity();
  const alerts = getMockAlerts();

  // ── Quick Actions ──────────────────────────────────────────────────────────

  const quickActions = [
    { label: "Create Program", icon: PlusIcon, href: "/admin/program-management", color: "text-green" },
    { label: "Invite User", icon: UserPlusIcon, href: "/admin/user-management", color: "text-blue-600" },
    { label: "Review Compliance", icon: ClipboardCheckIcon, href: "/admin/compliance-management", color: "text-purple-600" },
    { label: "Export Reports", icon: DownloadIcon, href: "#", color: "text-orange-600" },
    { label: "View All Tickets", icon: HeadphonesIcon, href: "/admin/support", color: "text-teal-600" },
  ];

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")} — Welcome back, {auth?.name ?? "Admin"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="small">
            <DownloadIcon className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Link href="/admin/user-management">
            <Button variant="primary" size="small">
              <UsersIcon className="w-4 h-4 mr-1" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards (2 rows of 4) ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((card) => (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm text-[#18181B]">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-3xl font-bold text-[#18181B]">
                        {card.format === "currency"
                          ? formatCurrency(card.value, 0, 0, card.currency ?? "NGN")
                          : card.format === "percent"
                            ? `${card.value}%`
                            : card.value.toLocaleString()}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          card.trendUp ? "text-green" : "text-red-500",
                        )}
                      >
                        {card.trendUp ? (
                          <ArrowUpIcon className="w-3 h-3 inline mr-0.5" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3 inline mr-0.5" />
                        )}
                        {card.trend}
                      </span>
                    </div>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2 shrink-0">
                      {card.icon()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ── Tab Navigation ────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer",
              activeTab === tab.key
                ? "border-green text-green"
                : "border-transparent text-muted-foreground hover:text-[#18181B]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ───────────────────────────────────── */}
      {activeTab === "overview" && (
        <OverviewTab
          isLoading={isLoading}
          usersByRole={usersByRole}
          recentActivity={recentActivity}
          alerts={alerts}
          quickActions={quickActions}
          programs={programs}
        />
      )}
      {activeTab === "user-activity" && (
        <UserActivityTab
          isLoading={isLoading}
          usersByRole={usersByRole}
          totalUsers={totalUsers}
        />
      )}
      {activeTab === "programs" && (
        <ProgramsTab
          isLoading={programsLoading}
          programs={programs}
        />
      )}
      {activeTab === "system-health" && <SystemHealthTab />}
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  isLoading,
  usersByRole,
  recentActivity,
  alerts,
  quickActions,
  programs,
}: {
  isLoading: boolean;
  usersByRole: any;
  recentActivity: any[];
  alerts: any[];
  quickActions: any[];
  programs: any;
}) {
  return (
    <div className="space-y-6">
      {/* Quick Stats + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users by Role */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Users by Role</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "SMEs", count: usersByRole?.sme ?? 0, color: "#008060" },
                  { label: "Investors", count: usersByRole?.investor ?? 0, color: "#3b82f6" },
                  { label: "Dev Orgs", count: usersByRole?.development_org ?? 0, color: "#f59e0b" },
                ].map((role) => {
                  const total = (usersByRole?.sme ?? 0) + (usersByRole?.investor ?? 0) + (usersByRole?.development_org ?? 0);
                  const pct = total > 0 ? Math.round((role.count / total) * 100) : 0;
                  return (
                    <div key={role.label} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                      <span className="text-sm text-[#18181B] flex-1">{role.label}</span>
                      <span className="text-sm font-bold text-[#18181B]">{role.count}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: role.color }} />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts & Warnings */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Alerts & Warnings</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.action}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <AlertTriangleIcon
                    className={cn(
                      "w-4 h-4 shrink-0 mt-0.5",
                      alert.severity === "high"
                        ? "text-red-500"
                        : alert.severity === "medium"
                          ? "text-amber-500"
                          : "text-blue-500",
                    )}
                  />
                  <span className="text-xs text-muted-foreground leading-relaxed">{alert.message}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Programs */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#18181B]">Top Programs</h3>
              <Link href="/admin/program-management" className="text-xs text-green font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2.5">
              {(programs?.programs?.slice(0, 4) ?? getMockTopPrograms().slice(0, 4)).map((prog: any, idx: number) => (
                <div key={prog.id ?? idx} className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#F4FFFC] text-green text-[10px] font-bold border border-[#ABD2C7]">
                    {idx + 1}
                  </span>
                  <span className="text-sm text-[#18181B] flex-1 truncate">{prog.name}</span>
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                    {prog.status ?? "Active"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#18181B]">Recent Activity</h3>
            <span className="text-xs text-muted-foreground">Last 10 actions</span>
          </div>
          <div className="space-y-2">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                  <ActivityTypeIcon type={activity.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#18181B]">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-muted-foreground">&mdash; {activity.action}</span>
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#ABD2C7] hover:bg-[#F4FFFC] transition-colors cursor-pointer">
                  <div className={cn("w-10 h-10 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center", action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-[#18181B] text-center">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── User Activity Tab ────────────────────────────────────────────────────────

function UserActivityTab({
  isLoading,
  usersByRole,
  totalUsers,
}: {
  isLoading: boolean;
  usersByRole: any;
  totalUsers: number;
}) {
  const registrations = getMockRegistrationsByWeek();
  const recentSignups = getMockRecentSignups();
  const maxReg = Math.max(...registrations.flatMap((w) => [w.sme, w.investor, w.devOrg]));

  return (
    <div className="space-y-6">
      {/* New Registrations Chart */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-1">New Registrations (Last 30 Days)</h3>
          <p className="text-xs text-muted-foreground mb-6">Grouped by week</p>

          <div className="flex items-center gap-4 mb-4">
            {[
              { label: "SMEs", color: "#008060" },
              { label: "Investors", color: "#3b82f6" },
              { label: "Dev Orgs", color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {registrations.map((week) => (
              <div key={week.week} className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1 h-32">
                  <div
                    className="w-6 rounded-t-sm"
                    style={{ height: `${(week.sme / maxReg) * 100}%`, backgroundColor: "#008060", minHeight: "4px" }}
                  />
                  <div
                    className="w-6 rounded-t-sm"
                    style={{ height: `${(week.investor / maxReg) * 100}%`, backgroundColor: "#3b82f6", minHeight: "4px" }}
                  />
                  <div
                    className="w-6 rounded-t-sm"
                    style={{ height: `${(week.devOrg / maxReg) * 100}%`, backgroundColor: "#f59e0b", minHeight: "4px" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{week.week}</span>
                <span className="text-xs font-medium text-[#18181B]">{week.sme + week.investor + week.devOrg}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Users by Role */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Active Users by Role</h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "SMEs", count: usersByRole?.sme ?? 0, color: "#008060", icon: CIcons.smeOutline },
                  { label: "Investors", count: usersByRole?.investor ?? 0, color: "#3b82f6", icon: CIcons.investorOutline },
                  { label: "Dev Organizations", count: usersByRole?.development_org ?? 0, color: "#f59e0b", icon: CIcons.organisationOutline },
                ].map((role) => (
                  <div
                    key={role.label}
                    className="flex items-center gap-4 p-3 rounded-lg border border-gray-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
                      {role.icon({ className: "w-5 h-5 text-green" })}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#18181B]">{role.label}</p>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${totalUsers > 0 ? (role.count / totalUsers) * 100 : 0}%`,
                            backgroundColor: role.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-[#18181B]">{role.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Growth Trend */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">User Growth Trend</h3>
            <div className="space-y-4">
              {[
                { period: "This Month", count: 67, change: "+18%" },
                { period: "Last Month", count: 54, change: "+12%" },
                { period: "2 Months Ago", count: 48, change: "+8%" },
                { period: "3 Months Ago", count: 42, change: "+15%" },
              ].map((item) => (
                <div key={item.period} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.period}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#18181B]">{item.count} new users</span>
                    <span className="text-xs font-medium text-green">
                      <ArrowUpIcon className="w-3 h-3 inline mr-0.5" />
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Signups Table */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-4">Recent Signups</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Date</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSignups.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-medium text-[#18181B]">{user.name}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px]">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">{user.email}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{format(new Date(user.date), "MMM d, yyyy")}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700",
                        )}
                      >
                        <span
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            user.status === "Active" ? "bg-green-500" : "bg-yellow-400",
                          )}
                        />
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Programs Tab ─────────────────────────────────────────────────────────────

function ProgramsTab({
  isLoading,
  programs,
}: {
  isLoading: boolean;
  programs: any;
}) {
  const statusData = getMockProgramsByStatus();
  const topPrograms = getMockTopPrograms();
  const totalProgramCount = statusData.reduce((acc, s) => acc + s.count, 0);

  const programCategories = useMemo(() => {
    if (!programs?.programs) return [];
    const catMap: Record<string, number> = {};
    programs.programs.forEach((p: any) => {
      const cat = p.industryFocus?.[0] ?? "General";
      catMap[cat] = (catMap[cat] ?? 0) + 1;
    });
    return Object.entries(catMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [programs]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs by Status */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Programs by Status</h3>
            <div className="space-y-3">
              {statusData.map((item) => {
                const pct = totalProgramCount > 0 ? Math.round((item.count / totalProgramCount) * 100) : 0;
                return (
                  <div key={item.status} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#18181B] w-20">{item.status}</span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <span className="text-sm font-bold text-[#18181B] w-8 text-right">{item.count}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Programs by Category */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Programs by Category</h3>
            {programCategories.length === 0 ? (
              <div className="space-y-3">
                {[
                  { name: "Business Development", count: 4 },
                  { name: "Agriculture", count: 3 },
                  { name: "Technology", count: 3 },
                  { name: "Environment", count: 2 },
                  { name: "Finance", count: 2 },
                  { name: "Health", count: 1 },
                ].map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-[#18181B]">{cat.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {cat.count} programs
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {programCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-[#18181B]">{cat.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {cat.count} programs
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Programs by Enrollment */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#18181B]">Top Programs by Enrollment</h3>
            <Link href="/admin/program-management" className="text-xs text-green font-medium hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Program</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Enrollment</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {topPrograms.map((prog, idx) => (
                  <tr key={prog.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 font-medium text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-[#18181B]">{prog.name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground">{prog.category}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-green"
                            style={{ width: `${Math.min((prog.enrollment / 150) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-[#18181B]">{prog.enrollment}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          prog.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200",
                        )}
                      >
                        {prog.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Funding Pipeline Summary */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-4">Funding Pipeline Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Pipeline", value: formatCurrency(25000000, 0, 0, "NGN"), color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Disbursed", value: formatCurrency(18000000, 0, 0, "NGN"), color: "bg-green-50 text-green-700 border-green-200" },
              { label: "Pending", value: formatCurrency(5000000, 0, 0, "NGN"), color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
              { label: "Available", value: formatCurrency(2000000, 0, 0, "NGN"), color: "bg-gray-50 text-gray-700 border-gray-200" },
            ].map((item) => (
              <div key={item.label} className={cn("rounded-lg border px-4 py-3 text-center", item.color)}>
                <p className="text-lg font-bold">{item.value}</p>
                <p className="text-xs font-medium mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── System Health Tab ────────────────────────────────────────────────────────

function SystemHealthTab() {
  const health = getMockSystemHealth();

  return (
    <div className="space-y-6">
      {/* Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Uptime",
            value: `${health.uptime}%`,
            icon: WifiIcon,
            color: health.uptime >= 99.9 ? "text-green" : "text-amber-600",
            bgColor: health.uptime >= 99.9 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200",
          },
          {
            label: "Avg Response Time",
            value: `${health.avgResponseTime}ms`,
            icon: ZapIcon,
            color: health.avgResponseTime < 200 ? "text-green" : "text-amber-600",
            bgColor: health.avgResponseTime < 200 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200",
          },
          {
            label: "Error Rate",
            value: `${health.errorRate}%`,
            icon: BugIcon,
            color: health.errorRate < 0.1 ? "text-green" : "text-red-600",
            bgColor: health.errorRate < 0.1 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
          },
          {
            label: "Storage Usage",
            value: `${health.storageUsed}%`,
            icon: DatabaseIcon,
            color: health.storageUsed < 80 ? "text-green" : "text-amber-600",
            bgColor: health.storageUsed < 80 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200",
          },
        ].map((indicator) => (
          <Card key={indicator.label} className={cn("shadow-none border", indicator.bgColor)}>
            <CardContent className="py-4 flex flex-col items-center gap-2 text-center">
              <indicator.icon className={cn("w-6 h-6", indicator.color)} />
              <span className={cn("text-2xl font-bold", indicator.color)}>{indicator.value}</span>
              <span className="text-xs font-medium text-muted-foreground">{indicator.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Usage Bar */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#18181B]">Storage Usage</h3>
            <span className="text-xs text-muted-foreground">
              {health.storageUsed}GB / {health.storageTotal}GB
            </span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                health.storageUsed < 70 ? "bg-green" : health.storageUsed < 85 ? "bg-amber-500" : "bg-red-500",
              )}
              style={{ width: `${health.storageUsed}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Error Logs */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-4">Recent Error Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Timestamp</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Service</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Level</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Message</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground uppercase">Count</th>
                </tr>
              </thead>
              <tbody>
                {health.recentErrors.map((err) => (
                  <tr key={err.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-xs text-muted-foreground font-mono whitespace-nowrap">
                      {err.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#18181B]">{err.service}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                          err.level === "error"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : err.level === "warn"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-700 border-blue-200",
                        )}
                      >
                        {err.level}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate">{err.message}</td>
                    <td className="py-2.5 px-3 text-center font-medium text-[#18181B]">{err.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
