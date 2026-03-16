"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import FinanceView from "@/components/pageComponents/FinanceView";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import IconCards from "@/components/sections/dashboardCards/iconCards";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import { useGetSmeById, useSmeDirectoryMutations, useSmeSaveStatus } from "@/hooks/useDirectories";
import { useInvestmentInterestMutations } from "@/hooks/useInvesmentInterest";
import { useGetReadinessScore } from "@/hooks/useReadiness";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  ChevronRight,
  File,
  Loader2Icon,
  BuildingIcon,
  MapPinIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  GlobeIcon,
  ShieldCheckIcon,
  StarIcon,
  HeartIcon,
  MessageSquareIcon,
  DownloadIcon,
  LockIcon,
  CheckCircle2Icon,
  TargetIcon,
  DollarSignIcon,
  BookOpenIcon,
  ActivityIcon,
  UserIcon,
  MailIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────────────────────────────────

type TabKey = "overview" | "financials" | "team" | "documents" | "activity";

interface TeamMember {
  name?: string;
  role?: string;
  email?: string;
  avatar?: string;
  isFounder?: boolean;
  joinedAt?: string;
}

interface DocumentItem {
  id?: string;
  _id?: string;
  name?: string;
  fileName?: string;
  size?: string;
  date?: string;
  createdAt?: string;
  status?: string;
  type?: string;
  accessLevel?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatMoney = (n?: number) => {
  if (!n) return "N/A";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
};

const getDocIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "pdf":
      return <File className="w-4 h-4 text-red-500" />;
    case "pptx":
    case "ppt":
      return <File className="w-4 h-4 text-orange-500" />;
    case "xlsx":
    case "xls":
      return <File className="w-4 h-4 text-green-600" />;
    default:
      return <File className="w-4 h-4 text-green" />;
  }
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent foundation in place";
  if (score >= 60) return "Good progress made";
  if (score >= 40) return "Moderate improvements needed";
  return "Significant gaps identified";
};

// ── Component ────────────────────────────────────────────────────────────────

export default function SingleSMEDirectoryPage() {
  const { id, accessType } = useParams();

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Data fetching
  const { data: smeData, isLoading: isSmeLoading } = useGetSmeById(id as string);
  const { data: readinessData, isLoading: isReadinessLoading } = useGetReadinessScore();
  const { data: smeSaveStatus } = useSmeSaveStatus(
    accessType === "investor" ? (id as string) : undefined,
  );
  const { saveSme } = useSmeDirectoryMutations();
  const { expressInterest } = useInvestmentInterestMutations();

  // Derived data
  const overallScore = smeData?.readiness?.overallScore || 0;
  const teamMembers: TeamMember[] = smeData?.team || smeData?.teamMembers || [];
  const documents: DocumentItem[] = smeData?.documents || [];
  const fundingHistory = smeData?.fundingHistory || [];
  const activities = smeData?.activities || smeData?.recentActivity || [];

  const getCategoryBreakdown = () => {
    if (!smeData?.readiness?.categoryScores) {
      return [
        { value: 0, label: "Strong foundation in place", caption: "Foundational" },
        { value: 0, label: "Moderate financial stability", caption: "Financial Health" },
        { value: 0, label: "Significant gaps in compliance", caption: "Compliance" },
      ];
    }
    return smeData.readiness.categoryScores.map((item: any) => ({
      value: Math.round(item.percentage),
      label: getScoreLabel(item.percentage),
      caption: item.category,
    }));
  };

  const checklist = getCategoryBreakdown();

  // Financials
  const revenueData = useMemo(() => {
    const history = smeData?.financials?.revenueHistory || smeData?.revenueHistory || [];
    if (history.length > 0) return history;
    // Generate placeholder from available data
    return [
      { period: "Q1", amount: smeData?.totalRevenue ? smeData.totalRevenue * 0.2 : 0 },
      { period: "Q2", amount: smeData?.totalRevenue ? smeData.totalRevenue * 0.22 : 0 },
      { period: "Q3", amount: smeData?.totalRevenue ? smeData.totalRevenue * 0.26 : 0 },
      { period: "Q4", amount: smeData?.totalRevenue ? smeData.totalRevenue * 0.32 : 0 },
    ];
  }, [smeData]);

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.walletMoney,
      label: "Revenue",
      amount: smeData?.totalRevenue || 0,
      currency: "NGN",
      percentage: 152000,
      direction: "up",
    },
    {
      id: 2,
      icon: CIcons.profile2,
      label: "Team Size",
      amount: smeData?.teamSize || teamMembers.length || 0,
    },
  ];

  // Handlers
  const handleSave = () => {
    if (!smeSaveStatus?.isSaved) {
      saveSme.mutate({ smeId: id });
    }
  };

  const handleExpressInterest = () => {
    expressInterest.mutate(
      { smeId: id as string, message: "I would like to express investment interest." },
      {
        onSuccess: () => toast.success("Interest expressed successfully"),
        onError: () => toast.error("Failed to express interest"),
      },
    );
  };

  const handleViewDocument = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setDocDialogOpen(true);
  };

  const img = selectedDoc
    ? `${process.env.NEXT_PUBLIC_API_URL}/documents/${selectedDoc.id || selectedDoc._id}/download`
    : "";

  if (isSmeLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // ── Tab definitions ────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BuildingIcon className="w-4 h-4" /> },
    { key: "financials", label: "Financials", icon: <TrendingUpIcon className="w-4 h-4" /> },
    { key: "team", label: "Team", icon: <UsersIcon className="w-4 h-4" /> },
    { key: "documents", label: "Documents", icon: <File className="w-4 h-4" /> },
    { key: "activity", label: "Activity", icon: <ActivityIcon className="w-4 h-4" /> },
  ];

  // ── Document table columns ─────────────────────────────────────────────

  const documentColumns = [
    {
      header: "File name",
      accessor: (row: DocumentItem) => (
        <div className="flex items-center gap-2">
          <div className="items-center w-6 h-6 flex bg-[#F4FFFC] rounded-full">
            {getDocIcon(row.type || row.name?.split(".").pop())}
          </div>
          <div>
            <div className="font-medium text-sm text-[#101828]">
              {row.name || row.fileName || "Document"}
            </div>
            <div className="text-xs text-gray-400">{row.size || ""}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: DocumentItem) => (
        <Badge variant="status" className="bg-gray-100 text-gray-700 capitalize text-xs">
          {row.type || row.name?.split(".").pop() || "File"}
        </Badge>
      ),
    },
    {
      header: "Date uploaded",
      accessor: (row: DocumentItem) =>
        row.date || (row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "—"),
    },
    {
      header: "Status",
      accessor: (row: DocumentItem) => {
        const status = row.status || "available";
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              status === "Completed" || status === "available"
                ? "bg-green-100 text-green-700"
                : status === "restricted"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600",
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                status === "Completed" || status === "available"
                  ? "bg-[#22C55E]"
                  : status === "restricted"
                    ? "bg-yellow-500"
                    : "bg-gray-400",
              )}
            />
            {status === "Completed" ? "Completed" : status}
          </span>
        );
      },
    },
    {
      header: "",
      accessor: (row: DocumentItem) => {
        const isRestricted = row.accessLevel === "restricted" || row.status === "restricted";
        return (
          <div className="flex gap-3 items-center justify-end">
            {isRestricted ? (
              <button className="text-yellow-600 font-medium text-sm flex items-center gap-1">
                <LockIcon className="w-3 h-3" /> Request Access
              </button>
            ) : (
              <button
                className="text-success-100 font-medium border-none"
                onClick={() => handleViewDocument(row)}
              >
                View Document
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full gap-6 flex flex-col">
      {/* Breadcrumb */}
      <Breadcrumb className="font-medium">
        <BreadcrumbItem>
          <BreadcrumbLink href={`/${accessType}/sme-directory`}>
            Investment Ready Business
          </BreadcrumbLink>
          <ChevronRight className="w-4 h-4" />
          <BreadcrumbLink className="text-green">
            {smeData?.businessName || smeData?.name || "Business Profile"}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* ── Profile Header ─────────────────────────────────────────────── */}
      <Card className="shadow-none">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Avatar & Info */}
            <div className="flex items-center gap-5 flex-1">
              <div className="relative">
                {smeData?.logo || smeData?.avatar ? (
                  <Image
                    src={smeData.logo || smeData.avatar}
                    alt="logo"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#F4FFFC] border-2 border-[#ABD2C7] flex items-center justify-center">
                    <BuildingIcon className="w-10 h-10 text-green" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-black">
                    {smeData?.businessName ?? smeData?.name}
                  </span>
                  {smeData?.industry && (
                    <Badge variant="status" className="bg-[#F4FFFC] text-green">
                      {smeData.industry}
                    </Badge>
                  )}
                  {smeData?.stage && (
                    <Badge variant="status" className="bg-blue-50 text-blue-700">
                      {smeData.stage}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  {(smeData?.countryOfOperation || smeData?.location) && (
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {smeData?.countryOfOperation?.join(", ") || smeData?.location}
                    </span>
                  )}
                  {smeData?.foundedYear && (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Founded {smeData.foundedYear}
                    </span>
                  )}
                  {(smeData?.teamSize || teamMembers.length > 0) && (
                    <span className="flex items-center gap-1">
                      <UsersIcon className="w-3.5 h-3.5" />
                      {smeData?.teamSize || teamMembers.length} members
                    </span>
                  )}
                </div>
                <div className="mt-1">
                  {statusBadge(smeData?.connectionStatus || "Connected")}
                </div>
              </div>
            </div>

            {/* Readiness Score Circle + CTAs */}
            <div className="flex items-center gap-6">
              {/* Readiness Score Circular Indicator */}
              <div className="flex flex-col items-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      strokeWidth="6"
                      fill="none"
                      className="stroke-gray-100"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="35"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(overallScore / 100) * 220} 220`}
                      strokeLinecap="round"
                      className={cn(
                        overallScore >= 75
                          ? "stroke-green-500"
                          : overallScore >= 50
                            ? "stroke-yellow-500"
                            : "stroke-red-400",
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">{overallScore}%</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground mt-1">Readiness</span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                {accessType === "investor" && (
                  <>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleExpressInterest}
                      state={expressInterest.isPending ? "loading" : "default"}
                    >
                      <HeartIcon className="w-4 h-4 mr-1" />
                      Express Interest
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      iconPosition={!smeSaveStatus?.isSaved ? "file" : undefined}
                      state={saveSme.isPending ? "loading" : "default"}
                      onClick={handleSave}
                    >
                      {smeSaveStatus?.isSaved ? "Saved" : "Save SME"}
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="small" className="text-green !px-0">
                  <MessageSquareIcon className="w-4 h-4 mr-1" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tab Navigation ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-md transition",
              activeTab === t.key
                ? "bg-[#F4FFFC] text-green border border-green"
                : "text-muted-foreground hover:bg-gray-100",
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────── */}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* About */}
          {(smeData?.description || smeData?.about || smeData?.businessSummary) && (
            <Card className="shadow-none">
              <CardContent className="py-6">
                <p className="font-bold text-base mb-3">About</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {smeData?.description || smeData?.about || smeData?.businessSummary}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Key Metrics Grid */}
          <div className="flex lg:grid lg:grid-cols-[1fr_1fr_2fr] gap-4 flex-col">
            <div className="h-auto w-full flex flex-col gap-6 flex-1 justify-between">
              {overviewCards.map((card) => (
                <IconCards {...card} key={card.id} />
              ))}
            </div>

            <ReadinessScoreCard
              isLoading={isReadinessLoading}
              scoreValue={overallScore}
            />

            <div className="h-auto w-full">
              <DashboardCardLayout height="h-full" caption="Category Breakdown">
                <div className="my-8 h-full">
                  {checklist.map((item: any, i: number) => (
                    <CategoryBreakdown
                      caption={item.caption}
                      label={item.label}
                      value={item.value}
                      key={i}
                    />
                  ))}
                </div>
              </DashboardCardLayout>
            </div>
          </div>

          {/* Additional metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Growth Rate",
                value: smeData?.growthRate ? `${smeData.growthRate}%` : "N/A",
                icon: <TrendingUpIcon className="w-4 h-4 text-green" />,
              },
              {
                label: "Founded",
                value: smeData?.foundedYear || smeData?.yearEstablished || "N/A",
                icon: <CalendarIcon className="w-4 h-4 text-green" />,
              },
              {
                label: "Employees",
                value: smeData?.teamSize || teamMembers.length || "N/A",
                icon: <UsersIcon className="w-4 h-4 text-green" />,
              },
              {
                label: "Revenue",
                value: formatMoney(smeData?.totalRevenue),
                icon: <DollarSignIcon className="w-4 h-4 text-green" />,
              },
            ].map((m, i) => (
              <Card key={i} className="shadow-none">
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-md bg-[#F4FFFC] flex items-center justify-center">
                      {m.icon}
                    </div>
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-lg font-bold">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Services / Tags */}
          {(smeData?.services || smeData?.tags || smeData?.industryFocus) && (
            <Card className="shadow-none">
              <CardContent className="py-6">
                <p className="font-bold text-base mb-3">Services & Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {(smeData?.services || smeData?.tags || smeData?.industryFocus || []).map(
                    (tag: string, i: number) => (
                      <Badge key={i} variant="status" className="bg-[#F4FFFC] text-green">
                        {tag}
                      </Badge>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Markets */}
          {smeData?.targetMarkets && smeData.targetMarkets.length > 0 && (
            <Card className="shadow-none">
              <CardContent className="py-6">
                <p className="font-bold text-base mb-3">Target Markets</p>
                <div className="flex flex-wrap gap-2">
                  {smeData.targetMarkets.map((m: string, i: number) => (
                    <Badge key={i} variant="status" className="bg-blue-50 text-blue-700">
                      <GlobeIcon className="w-3 h-3 mr-1" />
                      {m}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Competitive Advantages */}
          {smeData?.competitiveAdvantages && smeData.competitiveAdvantages.length > 0 && (
            <Card className="shadow-none">
              <CardContent className="py-6">
                <p className="font-bold text-base mb-3">Competitive Advantages</p>
                <div className="space-y-2">
                  {smeData.competitiveAdvantages.map((adv: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2Icon className="w-4 h-4 text-green mt-0.5 shrink-0" />
                      <span className="text-sm">{adv}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* FINANCIALS TAB */}
      {activeTab === "financials" && (
        <div className="space-y-6">
          {/* Revenue Trend */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <p className="font-bold text-base mb-6">Revenue Trend</p>
              <div className="flex items-end gap-4 h-48">
                {revenueData.map((item: any, idx: number) => {
                  const max = Math.max(...revenueData.map((d: any) => d.amount || 0), 1);
                  const h = ((item.amount || 0) / max) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-medium">
                        {formatMoney(item.amount)}
                      </span>
                      <div className="w-full bg-gray-50 rounded-t flex-1 relative">
                        <div
                          className="absolute bottom-0 w-full bg-[#008060]/30 rounded-t transition-all duration-500"
                          style={{ height: `${Math.max(h, 8)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item.period || item.label || `Q${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Total Revenue",
                value: formatMoney(smeData?.totalRevenue),
                icon: <DollarSignIcon className="w-5 h-5 text-green" />,
              },
              {
                label: "Growth Rate",
                value: smeData?.growthRate ? `${smeData.growthRate}% YoY` : "N/A",
                icon: <TrendingUpIcon className="w-5 h-5 text-green" />,
              },
              {
                label: "Profit Margin",
                value: smeData?.profitMargin ? `${smeData.profitMargin}%` : "N/A",
                icon: <TargetIcon className="w-5 h-5 text-green" />,
              },
            ].map((m, i) => (
              <Card key={i} className="shadow-none">
                <CardContent className="py-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-md bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                      {m.icon}
                    </div>
                    <span className="text-sm text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Funding History Timeline */}
          {fundingHistory.length > 0 && (
            <Card className="shadow-none">
              <CardContent className="py-6">
                <p className="font-bold text-base mb-4">Funding History</p>
                <div className="space-y-4">
                  {fundingHistory.map((fund: any, i: number) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                          <DollarSignIcon className="w-4 h-4 text-green" />
                        </div>
                        {i < fundingHistory.length - 1 && (
                          <div className="w-px h-8 bg-gray-200 mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {fund.type || fund.round || "Funding Round"}
                        </p>
                        <p className="text-lg font-bold">{formatMoney(fund.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {fund.source || fund.investor || ""}{" "}
                          {fund.date
                            ? `- ${format(new Date(fund.date), "MMM yyyy")}`
                            : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Health Indicators */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <p className="font-bold text-base mb-4">Financial Health Indicators</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Liquidity", score: smeData?.financials?.liquidity || 65 },
                  { label: "Solvency", score: smeData?.financials?.solvency || 72 },
                  { label: "Efficiency", score: smeData?.financials?.efficiency || 58 },
                  { label: "Profitability", score: smeData?.financials?.profitability || 45 },
                ].map((ind, i) => (
                  <div key={i} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          strokeWidth="5"
                          fill="none"
                          className="stroke-gray-100"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          strokeWidth="5"
                          fill="none"
                          strokeDasharray={`${(ind.score / 100) * 176} 176`}
                          strokeLinecap="round"
                          className={cn(
                            ind.score >= 70
                              ? "stroke-green-500"
                              : ind.score >= 50
                                ? "stroke-yellow-500"
                                : "stroke-red-400",
                          )}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{ind.score}%</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{ind.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full financial view */}
          <FinanceView isSme={false} />
        </div>
      )}

      {/* TEAM TAB */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Founder / CEO highlight */}
          {teamMembers.filter((m) => m.isFounder || m.role?.toLowerCase()?.includes("ceo") || m.role?.toLowerCase()?.includes("founder")).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMembers
                .filter(
                  (m) =>
                    m.isFounder ||
                    m.role?.toLowerCase()?.includes("ceo") ||
                    m.role?.toLowerCase()?.includes("founder"),
                )
                .map((member, i) => (
                  <Card key={i} className="shadow-none border-[#ABD2C7]">
                    <CardContent className="py-6">
                      <div className="flex items-center gap-4">
                        {member.avatar ? (
                          <Image
                            src={member.avatar}
                            alt={member.name || ""}
                            width={56}
                            height={56}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                            <UserIcon className="w-7 h-7 text-green" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-base">{member.name || "Team Member"}</p>
                            <Badge variant="status" className="bg-[#F4FFFC] text-green text-xs">
                              <StarIcon className="w-3 h-3 mr-1" /> Founder
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                          {member.email && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MailIcon className="w-3 h-3" /> {member.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* All team members grid */}
          <p className="font-bold text-base">
            Team Members{" "}
            <span className="px-2 py-0.5 text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {teamMembers.length}
            </span>
          </p>
          {teamMembers.length === 0 ? (
            <Card className="shadow-none">
              <CardContent className="py-12 text-center">
                <UsersIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No team members listed yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamMembers.map((member, i) => (
                <Card key={i} className="shadow-none hover:shadow-sm transition">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <Image
                          src={member.avatar}
                          alt={member.name || ""}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-green" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {member.name || "Team Member"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.role || "Member"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Team Size Over Time placeholder */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <p className="font-bold text-base mb-4">Team Growth</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <UsersIcon className="w-5 h-5" />
                <span>
                  Current team size: <strong className="text-foreground">{smeData?.teamSize || teamMembers.length || 0}</strong> members
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === "documents" && (
        <div className="space-y-6">
          <DashboardCardLayout>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <p className="font-bold text-base flex gap-2 items-center text-[#18181B]">
                  Documents
                  <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                    {documents.length}
                  </span>
                </p>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="py-12 text-center">
                <File className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No documents available.
                </p>
              </div>
            ) : (
              <ReusableTable
                columns={documentColumns.map((col) =>
                  col.header === ""
                    ? {
                        ...col,
                        accessor: (row: DocumentItem) => (
                          <Dialog
                            open={
                              docDialogOpen &&
                              (selectedDoc?.name || selectedDoc?.fileName) ===
                                (row.name || row.fileName)
                            }
                            onOpenChange={setDocDialogOpen}
                          >
                            <div className="flex justify-end">
                              <DialogTrigger asChild>
                                <button
                                  className="text-success-100 font-medium hover:underline ml-auto"
                                  onClick={() => handleViewDocument(row)}
                                >
                                  View Document
                                </button>
                              </DialogTrigger>
                            </div>
                            <DialogContent className="max-w-2xl flex flex-col items-center">
                              {selectedDoc && (
                                <>
                                  <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/documents/${selectedDoc.id || selectedDoc._id}/download`}
                                    alt="Document Preview"
                                    width={600}
                                    height={400}
                                    className="rounded-lg object-contain"
                                  />
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL}/documents/${selectedDoc.id || selectedDoc._id}/download`}
                                    download
                                    className="mt-4"
                                  >
                                    <Button variant="primary">
                                      <DownloadIcon className="w-4 h-4 mr-1" />
                                      Download
                                    </Button>
                                  </a>
                                </>
                              )}
                            </DialogContent>
                          </Dialog>
                        ),
                      }
                    : col,
                )}
                data={documents}
              />
            )}
          </DashboardCardLayout>
        </div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === "activity" && (
        <div className="space-y-6">
          <Card className="shadow-none">
            <CardContent className="py-6">
              <p className="font-bold text-base mb-4">Recent Activity</p>
              {activities.length === 0 ? (
                <div className="py-8 text-center">
                  <ActivityIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No recent activity to show.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((act: any, i: number) => {
                    const type = act.type || act.action || "event";
                    let icon = <ActivityIcon className="w-4 h-4 text-green" />;
                    if (type.includes("program")) icon = <BookOpenIcon className="w-4 h-4 text-blue-600" />;
                    if (type.includes("assessment") || type.includes("readiness"))
                      icon = <ShieldCheckIcon className="w-4 h-4 text-yellow-600" />;
                    if (type.includes("fund") || type.includes("invest"))
                      icon = <DollarSignIcon className="w-4 h-4 text-green" />;
                    if (type.includes("document")) icon = <File className="w-4 h-4 text-orange-500" />;

                    return (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-50 border flex items-center justify-center">
                            {icon}
                          </div>
                          {i < activities.length - 1 && (
                            <div className="w-px h-6 bg-gray-200 mt-1" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {act.title || act.description || act.message || "Activity"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {act.createdAt || act.date
                              ? formatDistanceToNow(
                                  new Date(act.createdAt || act.date),
                                  { addSuffix: true },
                                )
                              : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Sidebar (investor view) ────────────────────────────────────── */}
      {accessType === "investor" && activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Stats */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <p className="font-bold text-sm mb-4">Quick Stats</p>
              <div className="space-y-3">
                {[
                  { label: "Readiness Score", value: `${overallScore}%` },
                  { label: "Team Size", value: smeData?.teamSize || teamMembers.length || "N/A" },
                  { label: "Revenue", value: formatMoney(smeData?.totalRevenue) },
                  { label: "Industry", value: smeData?.industry || "N/A" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="font-medium">{stat.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investor Match Score */}
          <Card className="shadow-none">
            <CardContent className="py-6 text-center">
              <p className="font-bold text-sm mb-4">Investor Match Score</p>
              <div className="relative w-24 h-24 mx-auto mb-3">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    strokeWidth="6"
                    fill="none"
                    className="stroke-gray-100"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${((smeData?.matchScore || 75) / 100) * 264} 264`}
                    strokeLinecap="round"
                    className="stroke-green-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{smeData?.matchScore || 75}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your investment criteria
              </p>
            </CardContent>
          </Card>

          {/* Similar SMEs placeholder */}
          <Card className="shadow-none">
            <CardContent className="py-6">
              <p className="font-bold text-sm mb-4">Similar SMEs</p>
              <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-md bg-gray-50"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
                      <BuildingIcon className="w-4 h-4 text-green" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="h-3 bg-gray-200 rounded w-3/4 mb-1" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center pt-1">
                  Explore the SME directory for more matches
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
