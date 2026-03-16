"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import CategoryBreakdown from "@/components/sections/dashboardCards/categoryBreakdown";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import ReadinessScoreCard from "@/components/sections/dashboardCards/readinessScoreCard";
import InlineAgentCTA from "@/components/ui/inline-agent-cta";
import { ReusableTable } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchForm } from "@/components/search-form";
import { Document, useDocument } from "@/hooks/useDocument";
import { useGetReadinessScore, useGetScoreHistory, useGetScoreAnalytics } from "@/hooks/useReadiness";
import useAssessment from "@/hooks/useAssessment";
import { cn } from "@/lib/utils";
import {
  Download,
  File,
  Loader2,
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
  TargetIcon,
  BarChart2Icon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  StarIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  ArrowRightIcon,
  ClockIcon,
  AwardIcon,
  UsersIcon,
} from "lucide-react";
import { format } from "date-fns";
import { useState, useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabKey = "dashboard" | "history" | "recommendations" | "benchmarks";

type RecommendationStatus = "not_started" | "in_progress" | "done";
type ImpactLevel = "high" | "medium" | "low";

interface AssessmentHistoryItem {
  id: string;
  date: string;
  overallScore: number;
  previousScore: number | null;
  categoryScores: { category: string; score: number; maxScore: number }[];
  version: string;
}

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: ImpactLevel;
  effort: ImpactLevel;
  status: RecommendationStatus;
  actionItems: string[];
  estimatedImpact: number;
  resourceLink?: string;
}

interface BenchmarkData {
  category: string;
  yourScore: number;
  industryAvg: number;
  topPerformers: number;
  similarStage: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TABS: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "history", label: "Assessment History" },
  { key: "recommendations", label: "Recommendations" },
  { key: "benchmarks", label: "Benchmarks" },
];

const IMPACT_COLORS: Record<ImpactLevel, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const STATUS_COLORS: Record<RecommendationStatus, string> = {
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  done: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<RecommendationStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  done: "Done",
};

const CATEGORY_COLORS: Record<string, string> = {
  Financial: "#008060",
  Operational: "#3b82f6",
  Market: "#f59e0b",
  Governance: "#8b5cf6",
  Team: "#ec4899",
};

// ---------------------------------------------------------------------------
// Mock Data (clearly marked — replace with API data when available)
// ---------------------------------------------------------------------------
const MOCK_HISTORY: AssessmentHistoryItem[] = [
  {
    id: "AH-001",
    date: "2026-03-10",
    overallScore: 68,
    previousScore: 62,
    categoryScores: [
      { category: "Financial", score: 72, maxScore: 100 },
      { category: "Operational", score: 65, maxScore: 100 },
      { category: "Market", score: 78, maxScore: 100 },
      { category: "Governance", score: 55, maxScore: 100 },
      { category: "Team", score: 70, maxScore: 100 },
    ],
    version: "v3.1",
  },
  {
    id: "AH-002",
    date: "2026-02-10",
    overallScore: 62,
    previousScore: 55,
    categoryScores: [
      { category: "Financial", score: 65, maxScore: 100 },
      { category: "Operational", score: 58, maxScore: 100 },
      { category: "Market", score: 72, maxScore: 100 },
      { category: "Governance", score: 48, maxScore: 100 },
      { category: "Team", score: 67, maxScore: 100 },
    ],
    version: "v3.0",
  },
  {
    id: "AH-003",
    date: "2026-01-10",
    overallScore: 55,
    previousScore: null,
    categoryScores: [
      { category: "Financial", score: 55, maxScore: 100 },
      { category: "Operational", score: 50, maxScore: 100 },
      { category: "Market", score: 65, maxScore: 100 },
      { category: "Governance", score: 40, maxScore: 100 },
      { category: "Team", score: 65, maxScore: 100 },
    ],
    version: "v2.9",
  },
];

const MOCK_RECOMMENDATIONS: RecommendationItem[] = [
  {
    id: "REC-001",
    title: "Strengthen Financial Documentation",
    description: "Prepare audited financial statements and cash flow projections for the next 3 years.",
    category: "Financial",
    impact: "high",
    effort: "medium",
    status: "in_progress",
    actionItems: [
      "Engage a certified auditor",
      "Prepare 3-year financial projections",
      "Document revenue model and unit economics",
    ],
    estimatedImpact: 12,
  },
  {
    id: "REC-002",
    title: "Establish Governance Framework",
    description: "Set up a formal board structure with independent directors and documented policies.",
    category: "Governance",
    impact: "high",
    effort: "high",
    status: "not_started",
    actionItems: [
      "Draft board charter",
      "Recruit 2 independent board members",
      "Establish quarterly board meetings",
      "Document conflict of interest policies",
    ],
    estimatedImpact: 15,
  },
  {
    id: "REC-003",
    title: "Improve Operational Processes",
    description: "Document and standardize key operational processes to ensure scalability.",
    category: "Operational",
    impact: "medium",
    effort: "medium",
    status: "in_progress",
    actionItems: [
      "Map all key business processes",
      "Create standard operating procedures (SOPs)",
      "Implement project management tools",
    ],
    estimatedImpact: 8,
  },
  {
    id: "REC-004",
    title: "Expand Market Research",
    description: "Conduct comprehensive market analysis including TAM/SAM/SOM and competitive landscape.",
    category: "Market",
    impact: "medium",
    effort: "low",
    status: "done",
    actionItems: [
      "Calculate TAM/SAM/SOM",
      "Analyze top 5 competitors",
      "Conduct customer surveys",
    ],
    estimatedImpact: 6,
    resourceLink: "#",
  },
  {
    id: "REC-005",
    title: "Build Advisory Team",
    description: "Recruit industry advisors to strengthen your team and credibility with investors.",
    category: "Team",
    impact: "medium",
    effort: "medium",
    status: "not_started",
    actionItems: [
      "Identify 3-5 potential advisors",
      "Draft advisory agreements",
      "Structure advisory board meetings",
    ],
    estimatedImpact: 7,
  },
];

const MOCK_BENCHMARKS: BenchmarkData[] = [
  { category: "Financial", yourScore: 72, industryAvg: 58, topPerformers: 90, similarStage: 63 },
  { category: "Operational", yourScore: 65, industryAvg: 55, topPerformers: 88, similarStage: 60 },
  { category: "Market", yourScore: 78, industryAvg: 62, topPerformers: 92, similarStage: 68 },
  { category: "Governance", yourScore: 55, industryAvg: 50, topPerformers: 85, similarStage: 52 },
  { category: "Team", yourScore: 70, industryAvg: 60, topPerformers: 91, similarStage: 65 },
];

// Mock dashboard category data for radar-like display
const MOCK_DASHBOARD_CATEGORIES = [
  {
    name: "Financial",
    score: 72,
    maxScore: 100,
    strengths: ["Revenue growth trending upward", "Good cash reserves"],
    weaknesses: ["No audited financial statements", "Limited financial projections"],
  },
  {
    name: "Operational",
    score: 65,
    maxScore: 100,
    strengths: ["Core processes documented", "Technology stack in place"],
    weaknesses: ["SOPs need standardization", "No disaster recovery plan"],
  },
  {
    name: "Market",
    score: 78,
    maxScore: 100,
    strengths: ["Strong market research", "Clear competitive advantage"],
    weaknesses: ["Limited international market data"],
  },
  {
    name: "Governance",
    score: 55,
    maxScore: 100,
    strengths: ["Company registered and compliant"],
    weaknesses: ["No independent board members", "Missing formal governance policies"],
  },
  {
    name: "Team",
    score: 70,
    maxScore: 100,
    strengths: ["Experienced founding team", "Key hires in place"],
    weaknesses: ["No formal advisory board", "Skills gap in finance"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ProgressBar({ value, color = "bg-[#008060]", height = "h-2" }: { value: number; color?: string; height?: string }) {
  return (
    <div className={cn("w-full bg-gray-100 rounded-full overflow-hidden", height)}>
      <div
        className={cn("rounded-full transition-all duration-500", height, color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function ReadinessGauge({ score, size = 160 }: { score: number; size?: number }) {
  const circumference = 2 * Math.PI * (size / 2 - 16);
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const getColor = (s: number) => {
    if (s >= 80) return "#008060";
    if (s >= 60) return "#f59e0b";
    if (s >= 40) return "#f97316";
    return "#ef4444";
  };
  const getLabel = (s: number) => {
    if (s >= 80) return "Excellent";
    if (s >= 60) return "Good";
    if (s >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 16}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="14"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 16}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-[#18181B]">{score}</span>
        <span className="text-sm text-gray-500">{getLabel(score)}</span>
      </div>
    </div>
  );
}

function ComparisonBar({
  label,
  values,
}: {
  label: string;
  values: { name: string; value: number; color: string }[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-[#18181B]">{label}</p>
      <div className="space-y-1.5">
        {values.map((v) => (
          <div key={v.name} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-28 shrink-0">{v.name}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-700"
                style={{ width: `${v.value}%`, backgroundColor: v.color }}
              />
            </div>
            <span className="text-xs font-bold w-8 text-right">{v.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function ReadinessPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentHistoryItem | null>(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Hooks
  const readinessScore = useGetReadinessScore();
  const { data: readinessData, isLoading, error } = readinessScore;
  const { useGetDocumentsByCategory, useDownloadDocument } = useDocument();
  const { data: documents } = useGetDocumentsByCategory("assessment");
  const downloadMutation = useDownloadDocument();

  // Use hook data when available, fall back to mock
  const overallScore = readinessData?.overallScore?.percentage ?? 68;
  const history = MOCK_HISTORY;
  const recommendations = MOCK_RECOMMENDATIONS;
  const benchmarks = MOCK_BENCHMARKS;
  const dashboardCategories = MOCK_DASHBOARD_CATEGORIES;

  // Category breakdown from API or mock
  const getCategoryBreakdown = () => {
    if (!readinessData?.overallScore?.percentage) {
      return dashboardCategories.map((c) => ({
        value: c.score,
        label: c.score >= 80 ? "Excellent" : c.score >= 60 ? "Good" : c.score >= 40 ? "Fair" : "Needs Work",
        caption: c.name,
      }));
    }
    return (
      readinessData?.categoryBreakdown?.map((item) => ({
        value: Math.round(item.percentage),
        label:
          item.percentage >= 80
            ? "Excellent foundation"
            : item.percentage >= 60
              ? "Good progress made"
              : item.percentage >= 40
                ? "Moderate improvements needed"
                : "Significant gaps identified",
        caption: item.category,
      })) || []
    );
  };

  const checklist = getCategoryBreakdown();

  const handleDownload = (id: string) => {
    setSelectedDocument(documents?.find((doc) => doc._id === id) || null);
    downloadMutation.mutate(id);
  };

  const openAssessmentDetail = (item: AssessmentHistoryItem) => {
    setSelectedAssessment(item);
    setAssessmentDialogOpen(true);
  };

  // Document table columns
  const docColumns = [
    {
      header: "File name",
      accessor: (row: Document) => (
        <div className="flex items-center gap-2">
          <div className="items-center w-6 h-6 flex bg-[#F4FFFC] rounded-full">
            <File className="text-green w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-sm text-[#101828]">{row.originalName}</div>
            <div className="text-xs text-gray-400">{row.size}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Date uploaded",
      accessor: (row: Document) => format(row.uploadedAt, "MMM dd, yyyy"),
    },
    {
      header: "",
      accessor: (row: Document) => (
        <div className="flex gap-4 items-end justify-end">
          <button
            disabled={selectedDocument?._id === row._id || downloadMutation.isPending}
            onClick={() => handleDownload(row._id)}
            className="text-gray-400 hover:text-green-600"
          >
            {selectedDocument?._id === row._id && downloadMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  // Assessment history table columns
  const historyColumns = [
    {
      header: "Date",
      accessor: (row: AssessmentHistoryItem) => (
        <span className="text-sm font-medium">{format(new Date(row.date), "MMM dd, yyyy")}</span>
      ),
    },
    {
      header: "Overall Score",
      accessor: (row: AssessmentHistoryItem) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#18181B]">{row.overallScore}%</span>
          {row.previousScore !== null && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs font-medium",
                row.overallScore > row.previousScore ? "text-[#008060]" : "text-red-500"
              )}
            >
              {row.overallScore > row.previousScore ? (
                <ArrowUpIcon className="w-3 h-3" />
              ) : (
                <ArrowDownIcon className="w-3 h-3" />
              )}
              {Math.abs(row.overallScore - row.previousScore)}%
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Score Breakdown",
      accessor: (row: AssessmentHistoryItem) => (
        <div className="flex gap-1">
          {row.categoryScores.map((cs) => (
            <div
              key={cs.category}
              className="w-8 h-6 rounded text-xs flex items-center justify-center font-medium"
              style={{
                backgroundColor: `${CATEGORY_COLORS[cs.category]}20`,
                color: CATEGORY_COLORS[cs.category],
              }}
              title={`${cs.category}: ${cs.score}%`}
            >
              {cs.score}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Version",
      accessor: (row: AssessmentHistoryItem) => (
        <span className="text-xs text-gray-500">{row.version}</span>
      ),
    },
    {
      header: "",
      accessor: (row: AssessmentHistoryItem) => (
        <Button variant="ghost" size="small" onClick={() => openAssessmentDetail(row)}>
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="w-full h-full gap-6 flex flex-col">
      {/* Overall Readiness Score + KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Large Score Gauge */}
        <Card className="p-6 lg:col-span-1 flex flex-col items-center justify-center">
          <ReadinessGauge score={overallScore} size={150} />
          {history.length >= 2 && (
            <div className="flex items-center gap-1 mt-3">
              {overallScore > (history[1]?.overallScore || 0) ? (
                <ArrowUpIcon className="w-4 h-4 text-[#008060]" />
              ) : (
                <ArrowDownIcon className="w-4 h-4 text-red-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  overallScore > (history[1]?.overallScore || 0) ? "text-[#008060]" : "text-red-500"
                )}
              >
                {overallScore > (history[1]?.overallScore || 0) ? "+" : ""}
                {overallScore - (history[1]?.overallScore || 0)}% from last assessment
              </span>
            </div>
          )}
        </Card>

        {/* KPI Cards */}
        <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Overall Score</p>
                <p className="text-2xl font-bold text-[#18181B] mt-1">{overallScore}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <TargetIcon className="w-5 h-5 text-[#008060]" />
              </div>
            </div>
            <ProgressBar value={overallScore} color="bg-[#008060]" />
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Assessments Completed</p>
                <p className="text-2xl font-bold text-[#18181B] mt-1">{history.length}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <CheckCircle2Icon className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Last: {history.length > 0 ? format(new Date(history[0].date), "MMM dd") : "N/A"}
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Areas to Improve</p>
                <p className="text-2xl font-bold text-[#18181B] mt-1">
                  {recommendations.filter((r) => r.status !== "done").length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <AlertTriangleIcon className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-gray-500">
                {recommendations.filter((r) => r.impact === "high" && r.status !== "done").length} high priority
              </span>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Rank Percentile</p>
                <p className="text-2xl font-bold text-[#18181B] mt-1">72nd</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <AwardIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpIcon className="w-3.5 h-3.5 text-[#008060]" />
              <span className="text-xs text-[#008060] font-medium">+5 from last month</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key
                ? "border-[#008060] text-[#008060]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================= DASHBOARD TAB ========================= */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Category Breakdown with strengths/weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Category Scores as bars */}
            <Card className="p-6">
              <h3 className="font-semibold text-base text-[#18181B] mb-4">Category Scores</h3>
              <div className="space-y-4">
                {dashboardCategories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[cat.name] }}
                        />
                        <span className="text-sm font-medium text-[#18181B]">{cat.name}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: CATEGORY_COLORS[cat.name] }}>
                        {cat.score}%
                      </span>
                    </div>
                    <ProgressBar
                      value={cat.score}
                      color={`bg-[${CATEGORY_COLORS[cat.name]}]`}
                    />
                  </div>
                ))}
              </div>

              {/* CSS Radar-like visualization */}
              <div className="mt-6 flex justify-center">
                <div className="relative w-48 h-48">
                  {/* Pentagon background */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Background rings */}
                    {[20, 40, 60, 80, 100].map((ring) => {
                      const scale = ring / 100;
                      const points = dashboardCategories.map((_, i) => {
                        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                        const x = 100 + 80 * scale * Math.cos(angle);
                        const y = 100 + 80 * scale * Math.sin(angle);
                        return `${x},${y}`;
                      });
                      return (
                        <polygon
                          key={ring}
                          points={points.join(" ")}
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="0.5"
                        />
                      );
                    })}
                    {/* Data polygon */}
                    <polygon
                      points={dashboardCategories
                        .map((cat, i) => {
                          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                          const scale = cat.score / 100;
                          const x = 100 + 80 * scale * Math.cos(angle);
                          const y = 100 + 80 * scale * Math.sin(angle);
                          return `${x},${y}`;
                        })
                        .join(" ")}
                      fill="rgba(0, 128, 96, 0.15)"
                      stroke="#008060"
                      strokeWidth="2"
                    />
                    {/* Data points and labels */}
                    {dashboardCategories.map((cat, i) => {
                      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                      const scale = cat.score / 100;
                      const cx = 100 + 80 * scale * Math.cos(angle);
                      const cy = 100 + 80 * scale * Math.sin(angle);
                      const lx = 100 + 95 * Math.cos(angle);
                      const ly = 100 + 95 * Math.sin(angle);
                      return (
                        <g key={cat.name}>
                          <circle cx={cx} cy={cy} r="4" fill="#008060" />
                          <text
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[8px] fill-gray-500"
                          >
                            {cat.name.slice(0, 3)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </Card>

            {/* Strengths & Weaknesses */}
            <Card className="p-6">
              <h3 className="font-semibold text-base text-[#18181B] mb-4">Strengths & Weaknesses</h3>
              <div className="space-y-5">
                {dashboardCategories.map((cat) => (
                  <div key={cat.name} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat.name] }}
                      />
                      <span className="text-sm font-semibold text-[#18181B]">{cat.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">{cat.score}%</span>
                    </div>
                    {cat.strengths.length > 0 && (
                      <div className="ml-5 mb-1">
                        {cat.strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-1.5 mb-0.5">
                            <CheckCircle2Icon className="w-3.5 h-3.5 text-[#008060] mt-0.5 shrink-0" />
                            <span className="text-xs text-gray-600">{s}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {cat.weaknesses.length > 0 && (
                      <div className="ml-5">
                        {cat.weaknesses.map((w, i) => (
                          <div key={i} className="flex items-start gap-1.5 mb-0.5">
                            <AlertTriangleIcon className="w-3.5 h-3.5 text-yellow-500 mt-0.5 shrink-0" />
                            <span className="text-xs text-gray-600">{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Original Category Breakdown + Recommendations from API */}
          {readinessData?.recommendations && readinessData.recommendations.length > 0 && (
            <DashboardCardLayout caption="AI Recommendations">
              <div className="my-4 space-y-4">
                {readinessData.recommendations.map((recommendation) => (
                  <div key={recommendation.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-base">{recommendation.title}</h3>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          recommendation.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : recommendation.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        )}
                      >
                        {recommendation.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 text-sm">{recommendation.description}</p>
                    <span className="text-sm font-medium text-gray-700">
                      Potential Impact: +{recommendation.estimatedImpact}% score increase
                    </span>
                  </div>
                ))}
              </div>
            </DashboardCardLayout>
          )}

          {/* AI Agent CTA */}
          <InlineAgentCTA
            agentName="funding_readiness"
            title="Funding Readiness Agent"
            description="Let AI analyze your readiness score and suggest specific improvements to attract investors."
            segment="smb_formation"
          />

          {/* Documents */}
          <DashboardCardLayout>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <p className="font-bold text-base flex gap-2 items-center text-[#18181B]">
                  Documents
                  <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
                    {documents?.length || 0}
                  </span>
                </p>
              </div>
              {documents?.length && documents.length > 0 ? (
                <ReusableTable columns={docColumns} data={documents} />
              ) : (
                <EmptyBox
                  caption="No Documents Yet!"
                  caption2="You have not uploaded any documents yet."
                  showButton={false}
                />
              )}
            </div>
          </DashboardCardLayout>
        </div>
      )}

      {/* ========================= ASSESSMENT HISTORY TAB ========================= */}
      {activeTab === "history" && (
        <Card>
          <ReusableTable columns={historyColumns} data={history} />
        </Card>
      )}

      {/* ========================= RECOMMENDATIONS TAB ========================= */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-[#18181B]">
                {recommendations.filter((r) => r.status !== "done").length}
              </p>
              <p className="text-sm text-gray-500">Actions Remaining</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-[#008060]">
                +{recommendations.filter((r) => r.status !== "done").reduce((acc, r) => acc + r.estimatedImpact, 0)}%
              </p>
              <p className="text-sm text-gray-500">Potential Score Increase</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold text-[#18181B]">
                {recommendations.filter((r) => r.status === "done").length}/{recommendations.length}
              </p>
              <p className="text-sm text-gray-500">Completed</p>
            </Card>
          </div>

          {/* Recommendation Cards */}
          <div className="space-y-4">
            {recommendations
              .sort((a, b) => {
                const order: Record<ImpactLevel, number> = { high: 0, medium: 1, low: 2 };
                return order[a.impact] - order[b.impact];
              })
              .map((rec) => (
                <Card key={rec.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-[#18181B]">{rec.title}</h4>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            STATUS_COLORS[rec.status]
                          )}
                        >
                          {STATUS_LABELS[rec.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Impact:</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          IMPACT_COLORS[rec.impact]
                        )}
                      >
                        {rec.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Effort:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-700">
                        {rec.effort}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">Category:</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[rec.category]}15`,
                          color: CATEGORY_COLORS[rec.category],
                        }}
                      >
                        {rec.category}
                      </span>
                    </div>
                    <span className="text-xs text-[#008060] font-medium ml-auto">
                      +{rec.estimatedImpact}% score
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Action Items:</p>
                    <ul className="space-y-1">
                      {rec.actionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div
                            className={cn(
                              "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5",
                              rec.status === "done"
                                ? "bg-[#008060] border-[#008060]"
                                : "border-gray-300"
                            )}
                          >
                            {rec.status === "done" && (
                              <CheckCircle2Icon className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span className="text-xs text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {rec.resourceLink && (
                    <div className="mt-3">
                      <Button variant="ghost" size="small">
                        <ExternalLinkIcon className="w-3.5 h-3.5 mr-1" />
                        View Resources
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* ========================= BENCHMARKS TAB ========================= */}
      {activeTab === "benchmarks" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-base text-[#18181B] mb-2">
              How You Compare
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              See how your readiness score compares to industry benchmarks across different categories.
            </p>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
              {[
                { name: "Your Score", color: "#008060" },
                { name: "Industry Average", color: "#94a3b8" },
                { name: "Top Performers", color: "#f59e0b" },
                { name: "Similar Stage", color: "#3b82f6" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Benchmark Comparison Bars */}
            <div className="space-y-8">
              {benchmarks.map((bm) => (
                <ComparisonBar
                  key={bm.category}
                  label={bm.category}
                  values={[
                    { name: "Your Score", value: bm.yourScore, color: "#008060" },
                    { name: "Industry Avg", value: bm.industryAvg, color: "#94a3b8" },
                    { name: "Top Performers", value: bm.topPerformers, color: "#f59e0b" },
                    { name: "Similar Stage", value: bm.similarStage, color: "#3b82f6" },
                  ]}
                />
              ))}
            </div>
          </Card>

          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5 text-center">
              <UsersIcon className="w-6 h-6 text-[#008060] mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">vs. Industry Average</p>
              <p className="text-2xl font-bold text-[#008060]">
                +{Math.round(
                  benchmarks.reduce((acc, b) => acc + (b.yourScore - b.industryAvg), 0) /
                    benchmarks.length
                )}%
              </p>
              <p className="text-xs text-gray-400">Above average across all categories</p>
            </Card>
            <Card className="p-5 text-center">
              <TrendingUpIcon className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">Gap to Top Performers</p>
              <p className="text-2xl font-bold text-yellow-600">
                -{Math.round(
                  benchmarks.reduce((acc, b) => acc + (b.topPerformers - b.yourScore), 0) /
                    benchmarks.length
                )}%
              </p>
              <p className="text-xs text-gray-400">Average gap to close</p>
            </Card>
            <Card className="p-5 text-center">
              <BarChart2Icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">vs. Similar Stage</p>
              <p className="text-2xl font-bold text-blue-600">
                +{Math.round(
                  benchmarks.reduce((acc, b) => acc + (b.yourScore - b.similarStage), 0) /
                    benchmarks.length
                )}%
              </p>
              <p className="text-xs text-gray-400">Above peers at same stage</p>
            </Card>
          </div>
        </div>
      )}

      {/* ========================= ASSESSMENT DETAIL DIALOG ========================= */}
      <Dialog open={assessmentDialogOpen} onOpenChange={setAssessmentDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Assessment Details - {selectedAssessment && format(new Date(selectedAssessment.date), "MMMM dd, yyyy")}
            </DialogTitle>
            <DialogDescription>
              Version {selectedAssessment?.version} - Overall Score: {selectedAssessment?.overallScore}%
            </DialogDescription>
          </DialogHeader>

          {selectedAssessment && (
            <div className="space-y-6 mt-4">
              {/* Overall Score */}
              <div className="flex items-center justify-center">
                <ReadinessGauge score={selectedAssessment.overallScore} size={120} />
              </div>

              {/* Category Breakdown */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-3">Per-Category Scores</h4>
                <div className="space-y-3">
                  {selectedAssessment.categoryScores.map((cs) => (
                    <div key={cs.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[cs.category] || "#888" }}
                          />
                          <span className="text-sm font-medium">{cs.category}</span>
                        </div>
                        <span className="text-sm font-bold">{cs.score}/{cs.maxScore}</span>
                      </div>
                      <ProgressBar
                        value={(cs.score / cs.maxScore) * 100}
                        color={cs.score >= 70 ? "bg-[#008060]" : cs.score >= 50 ? "bg-yellow-500" : "bg-red-500"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-2" />

              {/* Improvement Tips */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-3">Improvement Tips</h4>
                <div className="space-y-2">
                  {selectedAssessment.categoryScores
                    .filter((cs) => cs.score < 70)
                    .map((cs) => (
                      <div key={cs.category} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangleIcon className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">{cs.category}</p>
                          <p className="text-xs text-yellow-700">
                            Score {cs.score}% is below the 70% threshold. Focus on improving this area
                            to strengthen your overall readiness.
                          </p>
                        </div>
                      </div>
                    ))}
                  {selectedAssessment.categoryScores.filter((cs) => cs.score < 70).length === 0 && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2Icon className="w-4 h-4 text-[#008060] shrink-0 mt-0.5" />
                      <p className="text-sm text-[#008060]">
                        All categories are above the 70% threshold. Great progress!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReadinessPage;
