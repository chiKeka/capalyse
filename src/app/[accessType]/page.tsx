"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import {
  ArrowUpIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  DownloadIcon,
  FileTextIcon,
  FolderIcon,
  Loader2Icon,
  PlusIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  BriefcaseIcon,
  BarChart2Icon,
  DollarSignIcon,
  ActivityIcon,
  SearchIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  StarIcon,
  LightbulbIcon,
  ClockIcon,
  ZapIcon,
  ArrowDownIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/uitils/fns";
import { ProfileData, useGetInvestorsAnalytics } from "@/hooks/useProfileManagement";
import { getCurrentProfile } from "@/hooks/useUpdateProfile";
import { useGetReadinessScore } from "@/hooks/useReadiness";
import { GetPrograms, useListMyApplications, useImpactSummary } from "@/hooks/usePrograms";
import { GetDevOrgAnalytics } from "@/hooks/devOrg/devOrgsAnalytics";
import { useGetNotifications } from "@/hooks/useNotification";
import { useSmeMatches, useInvestorDirectory } from "@/hooks/useDirectories";
import { useGetAdminDashboardStats } from "@/hooks/useAdmin";
import { authAtom } from "@/lib/atoms/atoms";
import { useAtomValue } from "jotai";
import { routes } from "@/lib/routes";

// ── Types ────────────────────────────────────────────────────────────────────

type TabKey = "overview" | "activity" | "quick-actions";
type AccessType = "sme" | "investor" | "development";

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
  { key: "activity", label: "Activity" },
  { key: "quick-actions", label: "Quick Actions" },
];

// ── Mock Data ────────────────────────────────────────────────────────────────

function getMockActivityFeed(role: AccessType) {
  const base = [
    { id: "1", action: "Profile updated", description: "Updated business details", time: "10 min ago", type: "profile" },
    { id: "2", action: "Document uploaded", description: "Financial statement Q4 2025", time: "1 hr ago", type: "document" },
    { id: "3", action: "Message received", description: "New message from Capalyse Support", time: "2 hr ago", type: "message" },
  ];

  if (role === "sme") {
    return [
      { id: "4", action: "Assessment progress", description: "Completed financial section", time: "5 min ago", type: "assessment" },
      ...base,
      { id: "5", action: "Program match", description: "Matched with Growth Accelerator 2026", time: "3 hr ago", type: "program" },
      { id: "6", action: "Investor interest", description: "New investment interest from Atlas Capital", time: "5 hr ago", type: "investment" },
      { id: "7", action: "Readiness score updated", description: "Score improved to 72%", time: "1 day ago", type: "score" },
    ];
  }
  if (role === "investor") {
    return [
      { id: "4", action: "New SME match", description: "GreenPack Solutions matches your criteria", time: "5 min ago", type: "match" },
      ...base,
      { id: "5", action: "Due diligence update", description: "Documents reviewed for TechStart Inc", time: "3 hr ago", type: "diligence" },
      { id: "6", action: "Portfolio update", description: "AgroVentures Q4 report available", time: "6 hr ago", type: "portfolio" },
      { id: "7", action: "Interest response", description: "EduBridge accepted your interest", time: "1 day ago", type: "interest" },
    ];
  }
  return [
    { id: "4", action: "Application received", description: "New application for Growth Accelerator", time: "5 min ago", type: "application" },
    ...base,
    { id: "5", action: "Program milestone", description: "AgriTech program reached 80% completion", time: "4 hr ago", type: "milestone" },
    { id: "6", action: "Compliance update", description: "3 SMEs completed compliance requirements", time: "6 hr ago", type: "compliance" },
    { id: "7", action: "Report generated", description: "Monthly impact report ready", time: "1 day ago", type: "report" },
  ];
}

function getMockUpcomingEvents() {
  return [
    { id: "1", title: "Program Deadline", description: "Growth Accelerator applications close", date: "Mar 20" },
    { id: "2", title: "Webinar", description: "Investor matching workshop", date: "Mar 22" },
    { id: "3", title: "Review Meeting", description: "Quarterly platform review", date: "Mar 28" },
  ];
}

function getMockNotifications() {
  return [
    { id: "1", message: "New program available matching your profile", time: "5 min ago", read: false },
    { id: "2", message: "Your compliance documents are expiring soon", time: "1 hr ago", read: false },
    { id: "3", message: "Monthly report is ready for download", time: "3 hr ago", read: true },
    { id: "4", message: "Profile completion reminder", time: "1 day ago", read: true },
    { id: "5", message: "Platform maintenance scheduled for Sunday", time: "2 days ago", read: true },
  ];
}

function getMockChecklist(role: AccessType) {
  if (role === "sme") {
    return [
      { label: "Complete your business profile", done: true },
      { label: "Upload financial documents", done: true },
      { label: "Take readiness assessment", done: false },
      { label: "Apply to a development program", done: false },
      { label: "Connect with an investor", done: false },
    ];
  }
  if (role === "investor") {
    return [
      { label: "Complete investor profile", done: true },
      { label: "Set investment preferences", done: true },
      { label: "Browse SME directory", done: true },
      { label: "Express interest in an SME", done: false },
      { label: "Complete due diligence", done: false },
    ];
  }
  return [
    { label: "Set up organization profile", done: true },
    { label: "Create your first program", done: true },
    { label: "Review applications", done: false },
    { label: "Generate impact report", done: false },
    { label: "Disburse program funding", done: false },
  ];
}

// ── Activity Icon ────────────────────────────────────────────────────────────

function ActivityTypeIcon({ type }: { type: string }) {
  const iconClass = "w-4 h-4";
  switch (type) {
    case "assessment":
    case "score":
      return <TargetIcon className={cn(iconClass, "text-green")} />;
    case "profile":
      return <UsersIcon className={cn(iconClass, "text-blue-600")} />;
    case "document":
      return <FileTextIcon className={cn(iconClass, "text-purple-600")} />;
    case "message":
      return <BellIcon className={cn(iconClass, "text-orange-600")} />;
    case "program":
    case "application":
    case "milestone":
      return <FolderIcon className={cn(iconClass, "text-indigo-600")} />;
    case "investment":
    case "interest":
    case "diligence":
    case "portfolio":
      return <DollarSignIcon className={cn(iconClass, "text-emerald-600")} />;
    case "match":
      return <StarIcon className={cn(iconClass, "text-amber-600")} />;
    case "compliance":
      return <ShieldCheckIcon className={cn(iconClass, "text-teal-600")} />;
    case "report":
      return <BarChart2Icon className={cn(iconClass, "text-slate-600")} />;
    default:
      return <ActivityIcon className={cn(iconClass, "text-gray-500")} />;
  }
}

// ── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ value, size = 100 }: { value: number; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={8}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#008060"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-lg font-bold text-[#18181B]">{value}%</span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const params = useParams();
  const accessType = params.accessType as AccessType;

  if (!["sme", "investor", "development"].includes(accessType)) {
    return notFound();
  }

  return <DashboardContent accessType={accessType} />;
}

function DashboardContent({ accessType }: { accessType: AccessType }) {
  const params = useParams();
  const auth: any = useAtomValue(authAtom);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { data: profile, isLoading: profileLoading } = ProfileData();
  const { data: readinessScore, isLoading: readinessLoading } = useGetReadinessScore();
  const { data: programs } = GetPrograms({ page: 1, limit: 10 });
  const { data: applications } = useListMyApplications(undefined, accessType === "sme");
  const { data: investorAnalytics } = useGetInvestorsAnalytics();
  const { data: devOrgAnalytics } = GetDevOrgAnalytics();
  const { data: impactSummary } = useImpactSummary({ currency: "NGN" });
  const { data: smeMatches } = useSmeMatches({ page: 1, limit: 5 });
  const { data: notifications } = useGetNotifications();

  const isLoading = profileLoading;
  const firstName = profile?.personalInfo?.firstName ?? auth?.name ?? "User";

  // ── Role-Based KPI Cards ───────────────────────────────────────────────────

  const kpiCards = useMemo(() => {
    if (accessType === "sme") {
      return [
        {
          id: 1,
          icon: CIcons.readiness,
          label: "Readiness Score",
          value: readinessScore?.overallScore?.percentage ?? 0,
          format: "percent" as const,
          trend: "+5%",
          trendUp: true,
        },
        {
          id: 2,
          icon: CIcons.overview,
          label: "Active Applications",
          value: applications?.applications?.filter((a: any) => a.status === "pending" || a.status === "accepted")?.length ?? 0,
          format: "number" as const,
          trend: "In progress",
          trendUp: true,
        },
        {
          id: 3,
          icon: CIcons.walletMoney,
          label: "Funding Received",
          value: 0,
          format: "currency" as const,
          currency: "NGN",
          trend: "--",
          trendUp: true,
        },
        {
          id: 4,
          icon: CIcons.compliance,
          label: "Tasks Due",
          value: 3,
          format: "number" as const,
          trend: "This week",
          trendUp: false,
        },
      ];
    }
    if (accessType === "investor") {
      return [
        {
          id: 1,
          icon: CIcons.portfolioIcon,
          label: "Portfolio Value",
          value: investorAnalytics?.totalAmountInvested ?? 0,
          format: "currency" as const,
          currency: "NGN",
          trend: "+12%",
          trendUp: true,
        },
        {
          id: 2,
          icon: CIcons.heartTick,
          label: "Active Investments",
          value: investorAnalytics?.activeSMEs ?? 0,
          format: "number" as const,
          trend: "+2 this month",
          trendUp: true,
        },
        {
          id: 3,
          icon: CIcons.linearGraph,
          label: "Pipeline Deals",
          value: smeMatches?.items?.length ?? 0,
          format: "number" as const,
          trend: "In pipeline",
          trendUp: true,
        },
        {
          id: 4,
          icon: CIcons.walletMoney,
          label: "Returns",
          value: 0,
          format: "currency" as const,
          currency: "NGN",
          trend: "--",
          trendUp: true,
        },
      ];
    }
    // development
    return [
      {
        id: 1,
        icon: CIcons.overview,
        label: "Active Programs",
        value: devOrgAnalytics?.totals?.active ?? 0,
        format: "number" as const,
        trend: "+1 this quarter",
        trendUp: true,
      },
      {
        id: 2,
        icon: CIcons.profile2,
        label: "SMEs Supported",
        value: devOrgAnalytics?.applications?.accepted ?? 0,
        format: "number" as const,
        trend: "+15%",
        trendUp: true,
      },
      {
        id: 3,
        icon: CIcons.walletMoney,
        label: "Total Disbursed",
        value: impactSummary?.summary?.totalFunding ?? 0,
        format: "currency" as const,
        currency: "NGN",
        trend: "+22%",
        trendUp: true,
      },
      {
        id: 4,
        icon: CIcons.compliance,
        label: "Compliance Rate",
        value: 92,
        format: "percent" as const,
        trend: "+3%",
        trendUp: true,
      },
    ];
  }, [accessType, readinessScore, applications, investorAnalytics, devOrgAnalytics, impactSummary, smeMatches]);

  // ── Quick Action URLs ──────────────────────────────────────────────────────

  const roleRoutes = accessType === "sme" ? routes.sme
    : accessType === "investor" ? routes.investor
    : routes.development;

  return (
    <div className="space-y-8">
      {/* ── Welcome Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18181B]">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          {accessType === "sme" && (
            <Link href={`/${accessType}/readiness`}>
              <Button variant="primary" size="small">
                <TargetIcon className="w-4 h-4 mr-1" />
                Take Assessment
              </Button>
            </Link>
          )}
          {accessType === "investor" && (
            <Link href={`/${accessType}/sme-directory`}>
              <Button variant="primary" size="small">
                <SearchIcon className="w-4 h-4 mr-1" />
                Browse SMEs
              </Button>
            </Link>
          )}
          {accessType === "development" && (
            <Link href={`/${accessType}/programs`}>
              <Button variant="primary" size="small">
                <PlusIcon className="w-4 h-4 mr-1" />
                Create Program
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : kpiCards.map((card) => (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm text-[#18181B]">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-3xl font-bold text-[#18181B]">
                        {card.format === "currency"
                          ? formatCurrency(card.value, 0, 0, (card as any).currency ?? "NGN")
                          : card.format === "percent"
                            ? `${card.value}%`
                            : card.value.toLocaleString()}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          card.trendUp ? "text-green" : "text-amber-600",
                        )}
                      >
                        {card.trendUp && <ArrowUpIcon className="w-3 h-3 inline mr-0.5" />}
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {activeTab === "overview" && (
            <OverviewTab
              accessType={accessType}
              readinessScore={readinessScore}
              readinessLoading={readinessLoading}
              programs={programs}
              applications={applications}
              investorAnalytics={investorAnalytics}
              devOrgAnalytics={devOrgAnalytics}
              smeMatches={smeMatches}
              impactSummary={impactSummary}
            />
          )}
          {activeTab === "activity" && (
            <ActivityTab accessType={accessType} />
          )}
          {activeTab === "quick-actions" && (
            <QuickActionsTab accessType={accessType} />
          )}
        </div>

        {/* ── Sidebar Widgets ───────────────────────────────── */}
        <div className="space-y-6">
          {/* Notifications Preview */}
          <Card className="shadow-none">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#18181B]">Notifications</h3>
                <Link href={`/${accessType}/notifications`} className="text-xs text-green font-medium hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {getMockNotifications().slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-lg",
                      !notif.read ? "bg-green-50/50" : "hover:bg-gray-50",
                    )}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-1.5 shrink-0",
                      !notif.read ? "bg-green" : "bg-gray-200",
                    )} />
                    <div>
                      <p className={cn("text-xs leading-relaxed", !notif.read ? "font-medium text-[#18181B]" : "text-muted-foreground")}>
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-muted-foreground">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="shadow-none">
            <CardContent className="py-4">
              <h3 className="text-sm font-semibold text-[#18181B] mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                {getMockUpcomingEvents().map((event) => (
                  <div key={event.id} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-4 h-4 text-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#18181B]">{event.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{event.description}</p>
                    </div>
                    <span className="text-[10px] font-medium text-green whitespace-nowrap">{event.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Checklist */}
          <Card className="shadow-none">
            <CardContent className="py-4">
              <h3 className="text-sm font-semibold text-[#18181B] mb-3">Getting Started</h3>
              <div className="space-y-2">
                {getMockChecklist(accessType).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      item.done ? "bg-green" : "border-2 border-gray-200",
                    )}>
                      {item.done && <CheckCircle2Icon className="w-3 h-3 text-white" />}
                    </div>
                    <span className={cn(
                      "text-xs",
                      item.done ? "text-muted-foreground line-through" : "text-[#18181B] font-medium",
                    )}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {getMockChecklist(accessType).filter((i) => i.done).length}/{getMockChecklist(accessType).length} completed
                  </span>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green rounded-full"
                      style={{
                        width: `${(getMockChecklist(accessType).filter((i) => i.done).length / getMockChecklist(accessType).length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tip */}
          <Card className="shadow-none bg-[#F4FFFC] border-[#ABD2C7]">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <LightbulbIcon className="w-5 h-5 text-green shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#18181B] mb-1">Quick Tip</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {accessType === "sme"
                      ? "Complete your readiness assessment to unlock investor matching and program recommendations."
                      : accessType === "investor"
                        ? "Set your investment preferences to receive tailored SME matches and deal flow alerts."
                        : "Create detailed program descriptions to attract more qualified SME applicants."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  accessType,
  readinessScore,
  readinessLoading,
  programs,
  applications,
  investorAnalytics,
  devOrgAnalytics,
  smeMatches,
  impactSummary,
}: {
  accessType: AccessType;
  readinessScore: any;
  readinessLoading: boolean;
  programs: any;
  applications: any;
  investorAnalytics: any;
  devOrgAnalytics: any;
  smeMatches: any;
  impactSummary: any;
}) {
  if (accessType === "sme") {
    return <SmeOverview readinessScore={readinessScore} readinessLoading={readinessLoading} programs={programs} applications={applications} />;
  }
  if (accessType === "investor") {
    return <InvestorOverview investorAnalytics={investorAnalytics} smeMatches={smeMatches} />;
  }
  return <DevOrgOverview devOrgAnalytics={devOrgAnalytics} programs={programs} impactSummary={impactSummary} />;
}

// ── SME Overview ─────────────────────────────────────────────────────────────

function SmeOverview({
  readinessScore,
  readinessLoading,
  programs,
  applications,
}: {
  readinessScore: any;
  readinessLoading: boolean;
  programs: any;
  applications: any;
}) {
  const scoreValue = readinessScore?.overallScore?.percentage ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Readiness Progress */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Readiness Progress</h3>
            {readinessLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2Icon className="w-8 h-8 animate-spin text-green" />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ProgressRing value={scoreValue} size={120} />
                <div className="space-y-2">
                  <p className="text-sm text-[#18181B]">
                    {scoreValue >= 80
                      ? "Excellent! Your readiness is strong."
                      : scoreValue >= 50
                        ? "Good progress. Keep improving your score."
                        : "Complete your assessment to improve your score."}
                  </p>
                  {readinessScore?.overallScore?.breakdown && (
                    <div className="space-y-1">
                      {Object.entries(readinessScore.overallScore.breakdown).slice(0, 4).map(([key, val]: [string, any]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green rounded-full" style={{ width: `${val?.percentage ?? 0}%` }} />
                          </div>
                          <span className="text-[10px] text-muted-foreground capitalize">{key}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#18181B]">Recent Applications</h3>
              <Link href="/sme/programs" className="text-xs text-green font-medium hover:underline">
                View all
              </Link>
            </div>
            {applications?.applications?.length > 0 ? (
              <div className="space-y-2.5">
                {applications.applications.slice(0, 4).map((app: any, idx: number) => (
                  <div key={app._id ?? idx} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                    <FolderIcon className="w-4 h-4 text-green shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#18181B] truncate">{app.programName ?? "Program Application"}</p>
                      <p className="text-[10px] text-muted-foreground">{app.status ?? "Pending"}</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      app.status === "accepted" ? "bg-green-50 text-green-700 border-green-200" :
                      app.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-yellow-50 text-yellow-700 border-yellow-200",
                    )}>
                      {app.status ?? "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-[#18181B]">No applications yet</p>
                <p className="text-xs text-muted-foreground">Apply to development programs to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Programs */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#18181B]">Recommended Programs</h3>
            <Link href="/sme/programs" className="text-xs text-green font-medium hover:underline">
              Browse all
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(programs?.programs?.slice(0, 3) ?? []).map((prog: any, idx: number) => (
              <div key={prog._id ?? idx} className="p-3 rounded-lg border border-gray-200 hover:border-[#ABD2C7] transition-colors">
                <p className="text-sm font-medium text-[#18181B] mb-1">{prog.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{prog.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                    {prog.status ?? "Active"}
                  </Badge>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-green" />
                </div>
              </div>
            ))}
            {(!programs?.programs || programs.programs.length === 0) && (
              <div className="col-span-3 flex flex-col items-center justify-center py-8 text-center">
                <FolderIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-[#18181B]">No programs available</p>
                <p className="text-xs text-muted-foreground">Check back soon for new development programs</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Investor Overview ────────────────────────────────────────────────────────

function InvestorOverview({
  investorAnalytics,
  smeMatches,
}: {
  investorAnalytics: any;
  smeMatches: any;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Summary */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Portfolio Summary</h3>
            <div className="space-y-4">
              {[
                { label: "Total Invested", value: formatCurrency(investorAnalytics?.totalAmountInvested ?? 0, 0, 0, "NGN"), color: "text-green" },
                { label: "Active SMEs", value: investorAnalytics?.activeSMEs ?? 0, color: "text-blue-600" },
                { label: "Platform SMEs", value: investorAnalytics?.totalPlatformSMEs ?? 0, color: "text-purple-600" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={cn("text-sm font-bold", item.color)}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#18181B]">Recent SME Matches</h3>
              <Link href="/investor/sme-directory" className="text-xs text-green font-medium hover:underline">
                View all
              </Link>
            </div>
            {smeMatches?.items?.length > 0 ? (
              <div className="space-y-2.5">
                {smeMatches.items.slice(0, 4).map((match: any, idx: number) => (
                  <div key={match._id ?? idx} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                    <div className="w-8 h-8 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0">
                      <BriefcaseIcon className="w-3.5 h-3.5 text-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#18181B] truncate">
                        {match.smeBusinessInfo?.businessName ?? match.personalInfo?.firstName ?? "SME Match"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {match.smeBusinessInfo?.industry ?? "Business"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                      {match.matchScore ? `${match.matchScore}%` : "New"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <SearchIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-[#18181B]">No matches yet</p>
                <p className="text-xs text-muted-foreground">Update your preferences to find matching SMEs</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Investment Pipeline */}
      <Card className="shadow-none">
        <CardContent className="py-4">
          <h3 className="text-sm font-semibold text-[#18181B] mb-4">Investment Pipeline</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { stage: "Screening", count: 12, color: "#3b82f6" },
              { stage: "Due Diligence", count: 5, color: "#f59e0b" },
              { stage: "Negotiation", count: 3, color: "#8b5cf6" },
              { stage: "Closed", count: 8, color: "#008060" },
            ].map((stage) => (
              <div key={stage.stage} className="text-center p-3 rounded-lg border border-gray-100">
                <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${stage.color}15` }}>
                  <span className="text-sm font-bold" style={{ color: stage.color }}>{stage.count}</span>
                </div>
                <p className="text-xs font-medium text-[#18181B]">{stage.stage}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── DevOrg Overview ──────────────────────────────────────────────────────────

function DevOrgOverview({
  devOrgAnalytics,
  programs,
  impactSummary,
}: {
  devOrgAnalytics: any;
  programs: any;
  impactSummary: any;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Performance */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Program Performance</h3>
            <div className="space-y-3">
              {[
                { label: "Total Programs", value: devOrgAnalytics?.totals?.total ?? 0 },
                { label: "Active", value: devOrgAnalytics?.totals?.active ?? 0 },
                { label: "Applications Received", value: devOrgAnalytics?.applications?.total ?? 0 },
                { label: "Applications Accepted", value: devOrgAnalytics?.applications?.accepted ?? 0 },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-bold text-[#18181B]">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funding Utilization */}
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Funding Utilization</h3>
            <div className="space-y-4">
              {[
                { label: "Total Funding", value: impactSummary?.summary?.totalFunding ?? 0, pct: 100 },
                { label: "Disbursed", value: impactSummary?.summary?.totalDisbursed ?? 0, pct: 72 },
                { label: "Committed", value: impactSummary?.summary?.totalCommitted ?? 0, pct: 18 },
                { label: "Available", value: impactSummary?.summary?.totalAvailable ?? 0, pct: 10 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-medium text-[#18181B]">{formatCurrency(item.value, 0, 0, "NGN")}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance & Recent Applications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-none">
          <CardContent className="py-4">
            <h3 className="text-sm font-semibold text-[#18181B] mb-4">Compliance Status</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Compliant", count: 28, color: "bg-green-50 text-green-700 border-green-200" },
                { label: "Pending Review", count: 5, color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                { label: "Non-Compliant", count: 2, color: "bg-red-50 text-red-700 border-red-200" },
                { label: "Expired", count: 1, color: "bg-gray-50 text-gray-700 border-gray-200" },
              ].map((item) => (
                <div key={item.label} className={cn("rounded-lg border px-3 py-2.5 text-center", item.color)}>
                  <p className="text-lg font-bold">{item.count}</p>
                  <p className="text-[10px] font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#18181B]">Recent Applications</h3>
              <Link href="/development/programs" className="text-xs text-green font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2.5">
              {(programs?.programs?.slice(0, 3) ?? []).map((prog: any, idx: number) => (
                <div key={prog._id ?? idx} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                  <FolderIcon className="w-4 h-4 text-green shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#18181B] truncate">{prog.name}</p>
                    <p className="text-[10px] text-muted-foreground">{prog.status ?? "Active"}</p>
                  </div>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              ))}
              {(!programs?.programs || programs.programs.length === 0) && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <p className="text-xs text-muted-foreground">No programs yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({ accessType }: { accessType: AccessType }) {
  const activities = getMockActivityFeed(accessType);

  return (
    <Card className="shadow-none">
      <CardContent className="py-4">
        <h3 className="text-sm font-semibold text-[#18181B] mb-4">Recent Activity</h3>
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                <ActivityTypeIcon type={activity.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#18181B]">{activity.action}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <ClockIcon className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Quick Actions Tab ────────────────────────────────────────────────────────

function QuickActionsTab({ accessType }: { accessType: AccessType }) {
  const actions = useMemo(() => {
    if (accessType === "sme") {
      return [
        { label: "Take Assessment", description: "Complete your readiness assessment to unlock opportunities", icon: TargetIcon, href: "/sme/readiness", color: "text-green" },
        { label: "Apply to Program", description: "Browse and apply to development programs", icon: FolderIcon, href: "/sme/programs", color: "text-blue-600" },
        { label: "Update Profile", description: "Keep your business profile up to date", icon: UsersIcon, href: "/sme/profile", color: "text-purple-600" },
        { label: "View Compliance", description: "Check your compliance status and requirements", icon: ShieldCheckIcon, href: "/sme/compliance", color: "text-teal-600" },
        { label: "Financial Documents", description: "Upload and manage financial documents", icon: FileTextIcon, href: "/sme/finance", color: "text-orange-600" },
        { label: "View Matches", description: "See investor matches based on your profile", icon: StarIcon, href: "/sme/investors", color: "text-amber-600" },
      ];
    }
    if (accessType === "investor") {
      return [
        { label: "Browse SMEs", description: "Discover investment-ready SMEs on the platform", icon: SearchIcon, href: "/investor/sme-directory", color: "text-green" },
        { label: "Review Pipeline", description: "Manage your investment pipeline and deals", icon: BarChart2Icon, href: "/investor/deal-flow", color: "text-blue-600" },
        { label: "Export Portfolio", description: "Download your portfolio reports and analytics", icon: DownloadIcon, href: "/investor/analytics", color: "text-purple-600" },
        { label: "Investment Interests", description: "Manage your expressed investment interests", icon: DollarSignIcon, href: "/investor/investment-interests", color: "text-teal-600" },
        { label: "Saved SMEs", description: "Review your watchlist of saved SMEs", icon: StarIcon, href: "/investor/saved-smes", color: "text-amber-600" },
        { label: "Update Preferences", description: "Refine your investment criteria and preferences", icon: ZapIcon, href: "/investor/settings", color: "text-orange-600" },
      ];
    }
    return [
      { label: "Create Program", description: "Set up a new development program", icon: PlusIcon, href: "/development/programs", color: "text-green" },
      { label: "Review Applications", description: "Review pending program applications", icon: ClipboardListIcon, href: "/development/programs", color: "text-blue-600" },
      { label: "Generate Report", description: "Create impact and performance reports", icon: BarChart2Icon, href: "/development/impact-tracking", color: "text-purple-600" },
      { label: "SME Directory", description: "Browse and discover SMEs on the platform", icon: UsersIcon, href: "/development/sme-directory", color: "text-teal-600" },
      { label: "Manage Funding", description: "Track and manage program funding", icon: DollarSignIcon, href: "/development/funding", color: "text-amber-600" },
      { label: "View Connections", description: "Manage your network and connections", icon: UserPlusIcon, href: "/development/connections", color: "text-orange-600" },
    ];
  }, [accessType]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {actions.map((action) => (
        <Link key={action.label} href={action.href}>
          <Card className="shadow-none hover:shadow-sm hover:border-[#ABD2C7] transition-all cursor-pointer h-full">
            <CardContent className="py-4 flex items-start gap-4">
              <div className={cn("w-11 h-11 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center shrink-0", action.color)}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#18181B]">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{action.description}</p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
