"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import CreateProgram from "@/components/ui/createProgram";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ReusableTable } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  applyToProgram,
  GetProgramById,
  GetProgramApplications,
  updateProgramStatus,
} from "@/hooks/usePrograms";
import { authAtom } from "@/lib/atoms/atoms";
import { formatDateRange } from "@/lib/uitils/fns";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Target,
  BookOpen,
  FileText,
  CheckCircle2,
  Circle,
  ChevronRight,
  Download,
  ExternalLink,
  Building2,
  TrendingUp,
  Award,
  Briefcase,
  Globe,
  Shield,
  Loader2,
  ArrowLeft,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STATUS_OPTIONS = [
  { value: "publish", label: "Publish" },
  { value: "close", label: "Close" },
  { value: "complete", label: "Complete" },
  { value: "cancel", label: "Cancel" },
] as const;

const TABS = ["overview", "requirements", "timeline", "participants", "resources"] as const;
type TabKey = (typeof TABS)[number];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusStyle(status: string) {
  switch (status) {
    case "published":
      return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", label: "Open for Applications" };
    case "draft":
      return { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500", label: "Draft Program" };
    case "close":
    case "closed":
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Applications Closed" };
    case "cancel":
    case "cancelled":
      return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Cancelled" };
    case "completed":
      return { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", label: "Completed" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status || "Unknown" };
  }
}

function formatMoney(amount: number | undefined) {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

// ---------------------------------------------------------------------------
// Timeline Phase Component
// ---------------------------------------------------------------------------
function TimelinePhase({
  title,
  description,
  dateRange,
  isActive,
  isCompleted,
  isLast,
}: {
  title: string;
  description: string;
  dateRange: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0",
            isCompleted
              ? "bg-[#008060] border-[#008060]"
              : isActive
                ? "bg-white border-[#008060]"
                : "bg-white border-gray-300"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-4 h-4 text-white" />
          ) : isActive ? (
            <Circle className="w-3 h-3 fill-[#008060] text-[#008060]" />
          ) : (
            <Circle className="w-3 h-3 text-gray-300" />
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[40px]",
              isCompleted ? "bg-[#008060]" : "bg-gray-200"
            )}
          />
        )}
      </div>
      <div className="pb-8">
        <p className={cn("font-semibold text-sm", isActive ? "text-[#008060]" : isCompleted ? "text-[#18181B]" : "text-gray-400")}>
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{dateRange}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
function ProgramDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAtomValue(authAtom);

  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);

  const { data: program, isLoading } = GetProgramById(params.sluge as string);
  const { data: applicationsData } = GetProgramApplications(params.sluge as string);
  const { mutateAsync: applyToPtograms, isPending: isApplying } = applyToProgram(params.sluge as string);
  const { mutateAsync: updateProgramStatusMutation } = updateProgramStatus(params.sluge as string);

  const isDevOrg = params?.accessType === "development";
  const isAdmin = params?.accessType === "admin";
  const isSme = params?.accessType === "sme";
  const isInvestor = params?.accessType === "investor";
  const isOwner = isDevOrg && program?.developmentOrgId === auth?.id;

  const statusStyle = getStatusStyle(program?.status);
  const applicants = applicationsData?.applications ?? [];
  const dateRange = `${program?.startDate} – ${program?.endDate}`;

  // Derive timeline phases from program data
  const timelinePhases = useMemo(() => {
    if (!program) return [];
    const now = new Date();
    const start = program.startDate ? new Date(program.startDate) : null;
    const end = program.endDate ? new Date(program.endDate) : null;
    const deadline = program.applicationDeadline ? new Date(program.applicationDeadline) : null;

    const phases = [
      {
        title: "Application Period",
        description: "SMEs submit applications with required documents and business information.",
        dateRange: deadline ? `Deadline: ${format(deadline, "MMM d, yyyy")}` : "TBD",
        isCompleted: deadline ? now > deadline : false,
        isActive: deadline ? now <= deadline : false,
      },
      {
        title: "Selection & Review",
        description: "Applications are reviewed and evaluated based on eligibility criteria and readiness scores.",
        dateRange: deadline && start ? `${format(deadline, "MMM d")} - ${format(start, "MMM d, yyyy")}` : "TBD",
        isCompleted: start ? now > start : false,
        isActive: deadline && start ? now > deadline && now <= start : false,
      },
      {
        title: "Onboarding",
        description: "Selected participants are onboarded, receive orientation, and are assigned mentors.",
        dateRange: start ? `Starts ${format(start, "MMM d, yyyy")}` : "TBD",
        isCompleted: start ? now > new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) : false,
        isActive: start ? now >= start && now <= new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) : false,
      },
      {
        title: "Implementation",
        description: "Active program phase with mentoring, training, funding disbursements, and milestones.",
        dateRange: start && end ? `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}` : "TBD",
        isCompleted: end ? now > end : false,
        isActive: start && end ? now >= start && now <= end : false,
      },
      {
        title: "Completion & Review",
        description: "Program wraps up with final evaluations, reports, and impact assessments.",
        dateRange: end ? `Ends ${format(end, "MMM d, yyyy")}` : "TBD",
        isCompleted: program?.status === "completed",
        isActive: end ? now > end && program?.status !== "completed" : false,
      },
    ];
    return phases;
  }, [program]);

  // Participant columns for Dev Org view
  const participantColumns = [
    {
      header: "SME Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F4FFFC] flex items-center justify-center text-[#008060] font-semibold text-xs">
            {(row.sme?.smeBusinessInfo?.businessName || "S").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm">{row.sme?.smeBusinessInfo?.businessName || "N/A"}</span>
        </div>
      ),
    },
    {
      header: "Industry",
      accessor: (row: any) => row.sme?.smeBusinessInfo?.industry || "N/A",
    },
    {
      header: "Readiness Score",
      accessor: (row: any) => {
        const score = row.sme?.readinessPct ?? 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(score, 100)}%`,
                  backgroundColor: score >= 70 ? "#22C55E" : score >= 40 ? "#FACC15" : "#EF4444",
                }}
              />
            </div>
            <span className="text-xs font-medium">{score}%</span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (row: any) => {
        const s = row.status?.toLowerCase();
        const cls = s === "accepted" ? "bg-green-100 text-green-800" : s === "submitted" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600";
        return (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", cls)}>
            {row.status?.replace(/_/g, " ") || "N/A"}
          </span>
        );
      },
    },
    {
      header: "Applied",
      accessor: (row: any) => row.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy") : "N/A",
    },
    {
      header: "Action",
      accessor: (row: any) => (
        <Button
          variant="tertiary"
          className="text-green text-xs"
          size="small"
          onClick={() =>
            router.push(
              `/${params.accessType}/programs/${params.sluge}/applicants/${row.smeId}?applicationId=${row.id}&status=${encodeURIComponent(row.status)}`
            )
          }
        >
          View Details
        </Button>
      ),
    },
  ];

  // Handle apply
  const handleApplyToProgram = () => {
    applyToPtograms(undefined, {
      onSuccess: () => {
        toast.success("Program applied to successfully");
        setShowApplyConfirm(false);
      },
      onError: (error) => {
        toast.error(error.message);
        setShowApplyConfirm(false);
      },
    });
  };

  // Handle status update
  const handleStatusUpdate = (newStatus: string) => {
    updateProgramStatusMutation(newStatus, {
      onSuccess: () => {
        toast.success(`Program status updated to ${newStatus}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
      </div>
    );
  }

  // Program stats for sidebar
  const stats = [
    { label: "Total Applicants", value: applicationsData?.pagination?.total ?? applicants.length ?? 0, icon: Users },
    { label: "Accepted", value: applicants.filter((a: any) => a.status === "accepted").length, icon: CheckCircle2 },
    { label: "Max Participants", value: program?.maxParticipants ?? "N/A", icon: Target },
  ];

  // Support types
  const supportTypes = program?.supportTypes?.map((t: string) => t.replace(/_/g, " ")) ?? [];

  // Key details for overview grid
  const keyDetails = [
    { label: "Funding Amount", value: formatMoney(program?.fundingAmount), icon: DollarSign },
    { label: "Duration", value: formatDateRange(dateRange), icon: Calendar },
    { label: "Eligible Regions", value: program?.eligibleCountries?.join(", ") || "Global", icon: Globe },
    { label: "Industry Focus", value: program?.industryFocus?.join(", ") || "All Industries", icon: Briefcase },
    { label: "SME Stage", value: program?.smeStage?.join(", ") || "All Stages", icon: TrendingUp },
    { label: "Max Participants", value: program?.maxParticipants ?? "Unlimited", icon: Users },
  ];

  // Eligibility requirements
  const requirements = program?.requirements ?? [];
  const eligibleCountries = program?.eligibleCountries ?? [];

  // Mock resource data
  const programResources = [
    { id: "1", name: "Program Handbook", type: "PDF", size: "2.4 MB", category: "Guide" },
    { id: "2", name: "Application Checklist", type: "PDF", size: "340 KB", category: "Template" },
    { id: "3", name: "Milestone Tracking Sheet", type: "XLSX", size: "1.1 MB", category: "Template" },
    { id: "4", name: "FAQ Document", type: "PDF", size: "520 KB", category: "Guide" },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex my-4 justify-between w-full items-center">
        <div className="inline-flex items-center gap-1 text-xs md:text-sm lg:text-base">
          <button onClick={() => router.push(`/${params.accessType}/programs`)} className="hover:text-[#008060] flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Programs
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <p className="font-medium text-[#008060]">{program?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button
                onClick={() => router.push(`/${params.accessType}/programs/${params.sluge}/applicants`)}
                className="text-green w-fit"
                variant="tertiary"
              >
                {CIcons?.applicants()}
                View Applicants
              </Button>
              <Button
                className="text-green w-fit"
                variant="tertiary"
                onClick={() => {
                  setIsOpen(true);
                  setIsEdit(true);
                }}
              >
                {CIcons?.edit()}
                Edit
              </Button>
            </>
          )}
          {searchParams.get("apply") === "true" && (isSme || isInvestor) && (
            <Button className="w-fit" variant="primary" onClick={() => setShowApplyConfirm(true)}>
              Apply Now
            </Button>
          )}
        </div>
      </div>

      {/* Program Header Card */}
      <Card className="p-6 mb-6 shadow-none border border-[#E8E8E8]">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-[#18181B]">{program?.name}</h1>
              {(isSme || isInvestor) && (
                <Badge className={cn(statusStyle.bg, statusStyle.text, "gap-1.5")}>
                  <div className={cn("w-2 h-2 rounded-full", statusStyle.dot)} />
                  {statusStyle.label}
                </Badge>
              )}
              {(isDevOrg || isAdmin) && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer", statusStyle.bg, statusStyle.text)}>
                      <div className={cn("w-2 h-2 rounded-full", statusStyle.dot)} />
                      {statusStyle.label}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-1 bg-white border border-[#E8E8E8] rounded-[8px] shadow-lg">
                    <div className="flex flex-col">
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusUpdate(option.value)}
                          className="text-left px-3 py-2 text-xs font-normal text-[#0F2501] hover:bg-[#F5F5F5] rounded-[4px] transition-colors w-full"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {program?.partners?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Hosted by {program?.partners?.map((p: any) => p?.name).join(", ")}</span>
                </div>
              )}
              {program?.applicationDeadline && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Deadline: {format(new Date(program.applicationDeadline), "MMM d, yyyy")}</span>
                </div>
              )}
              {program?.eligibleCountries?.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{program.eligibleCountries.slice(0, 3).join(", ")}{program.eligibleCountries.length > 3 ? ` +${program.eligibleCountries.length - 3}` : ""}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center px-4">
                <p className="text-2xl font-bold text-[#18181B]">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-[#E8E8E8] overflow-x-auto">
        {TABS.map((tab) => {
          // Only show participants tab for dev org owners
          if (tab === "participants" && !isOwner) return null;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2",
                activeTab === tab
                  ? "border-[#008060] text-[#008060]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* ===== Overview Tab ===== */}
          {activeTab === "overview" && (
            <>
              {/* Description */}
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-3">Program Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{program?.description}</p>
              </DashboardCardLayout>

              {/* Objectives */}
              {program?.objectives?.length > 0 && (
                <DashboardCardLayout>
                  <h3 className="font-bold text-base text-[#18181B] mb-3">Program Objectives</h3>
                  <ul className="space-y-2">
                    {program.objectives.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-[#008060] shrink-0 mt-0.5" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </DashboardCardLayout>
              )}

              {/* Key Details Grid */}
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-4">Key Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {keyDetails.map((detail) => {
                    const Icon = detail.icon;
                    return (
                      <div key={detail.label} className="flex items-start gap-3 p-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]">
                        <div className="w-9 h-9 rounded-lg bg-[#F4FFFC] flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#008060]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{detail.label}</p>
                          <p className="text-sm font-medium text-[#18181B] capitalize">{detail.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DashboardCardLayout>

              {/* Support Types */}
              {supportTypes.length > 0 && (
                <DashboardCardLayout>
                  <h3 className="font-bold text-base text-[#18181B] mb-3">Support Provided</h3>
                  <div className="flex flex-wrap gap-2">
                    {supportTypes.map((type: string, i: number) => (
                      <Badge key={i} className="bg-[#F4FFFC] text-[#008060] border border-[#ABD2C7] capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </DashboardCardLayout>
              )}

              {/* Partners */}
              {program?.partners?.length > 0 && (
                <DashboardCardLayout>
                  <h3 className="font-bold text-base text-[#18181B] mb-3">Partners</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {program.partners.map((partner: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[#E8E8E8]">
                        <div className="w-10 h-10 rounded-full bg-[#F4FFFC] flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#008060]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{partner.name}</p>
                          {partner.role && <p className="text-xs text-gray-500 capitalize">{partner.role}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCardLayout>
              )}

              {/* Impact Stats (placeholder) */}
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-4">Impact Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "SMEs Supported", value: applicants.filter((a: any) => a.status === "accepted").length || 0 },
                    { label: "Countries Reached", value: program?.eligibleCountries?.length || 0 },
                    { label: "Industries Covered", value: program?.industryFocus?.length || 0 },
                    { label: "Support Types", value: program?.supportTypes?.length || 0 },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center p-4 rounded-lg bg-[#F4FFFC]">
                      <p className="text-2xl font-bold text-[#008060]">{stat.value}</p>
                      <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </DashboardCardLayout>
            </>
          )}

          {/* ===== Requirements Tab ===== */}
          {activeTab === "requirements" && (
            <>
              {/* Eligibility Criteria */}
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-4">Eligibility Criteria</h3>
                <div className="space-y-3">
                  {eligibleCountries.length > 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E8E8]">
                      <div className="w-6 h-6 rounded-full bg-[#F4FFFC] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#008060]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Eligible Countries</p>
                        <p className="text-xs text-gray-500">{eligibleCountries.join(", ")}</p>
                      </div>
                    </div>
                  )}
                  {program?.smeStage?.length > 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E8E8]">
                      <div className="w-6 h-6 rounded-full bg-[#F4FFFC] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#008060]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">SME Stage</p>
                        <p className="text-xs text-gray-500">{program.smeStage.join(", ")}</p>
                      </div>
                    </div>
                  )}
                  {program?.industryFocus?.length > 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E8E8]">
                      <div className="w-6 h-6 rounded-full bg-[#F4FFFC] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#008060]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Industry Focus</p>
                        <p className="text-xs text-gray-500">{program.industryFocus.join(", ")}</p>
                      </div>
                    </div>
                  )}
                  {program?.maxParticipants && (
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E8E8]">
                      <div className="w-6 h-6 rounded-full bg-[#F4FFFC] flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-[#008060]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Maximum Participants</p>
                        <p className="text-xs text-gray-500">{program.maxParticipants} SMEs</p>
                      </div>
                    </div>
                  )}
                </div>
              </DashboardCardLayout>

              {/* Requirements */}
              {requirements.length > 0 && (
                <DashboardCardLayout>
                  <h3 className="font-bold text-base text-[#18181B] mb-4">Requirements</h3>
                  <div className="space-y-3">
                    {requirements.map((req: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[#E8E8E8]">
                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">{req.type?.replace(/_/g, " ")}</p>
                          <p className="text-xs text-gray-500">
                            {req.operator} {req.value} {req.description && `- ${req.description}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCardLayout>
              )}

              {/* Required Documents */}
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-4">Required Documents</h3>
                <div className="space-y-2">
                  {["Business Registration Certificate", "Financial Statements (Last 2 Years)", "Pitch Deck / Business Plan", "Tax Clearance Certificate", "Team Profile Document"].map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-[#E8E8E8]">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 flex-1">{doc}</span>
                      <Badge className="bg-gray-100 text-gray-600 text-[10px]">Required</Badge>
                    </div>
                  ))}
                </div>
              </DashboardCardLayout>

              {/* Application Steps */}
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-4">Application Steps</h3>
                <div className="space-y-4">
                  {[
                    { step: 1, title: "Review Eligibility", desc: "Ensure your SME meets all eligibility criteria listed above." },
                    { step: 2, title: "Prepare Documents", desc: "Gather all required documents and ensure they are up to date." },
                    { step: 3, title: "Submit Application", desc: "Click the 'Apply Now' button and complete the application form." },
                    { step: 4, title: "Track Status", desc: "Monitor your application status in the Programs section of your dashboard." },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#008060] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#18181B]">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCardLayout>
            </>
          )}

          {/* ===== Timeline Tab ===== */}
          {activeTab === "timeline" && (
            <DashboardCardLayout>
              <h3 className="font-bold text-base text-[#18181B] mb-6">Program Timeline</h3>
              <div className="pl-2">
                {timelinePhases.map((phase, i) => (
                  <TimelinePhase
                    key={i}
                    title={phase.title}
                    description={phase.description}
                    dateRange={phase.dateRange}
                    isActive={phase.isActive}
                    isCompleted={phase.isCompleted}
                    isLast={i === timelinePhases.length - 1}
                  />
                ))}
              </div>

              {/* Key Dates Summary */}
              <Separator className="my-6" />
              <h4 className="font-semibold text-sm text-[#18181B] mb-3">Key Dates</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {program?.applicationDeadline && (
                  <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium">Application Deadline</p>
                    <p className="text-sm font-semibold text-orange-800">{format(new Date(program.applicationDeadline), "MMM d, yyyy")}</p>
                  </div>
                )}
                {program?.startDate && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Program Start</p>
                    <p className="text-sm font-semibold text-blue-800">{format(new Date(program.startDate), "MMM d, yyyy")}</p>
                  </div>
                )}
                {program?.endDate && (
                  <div className="p-3 rounded-lg bg-[#F4FFFC] border border-[#ABD2C7]">
                    <p className="text-xs text-[#008060] font-medium">Program End</p>
                    <p className="text-sm font-semibold text-[#006B50]">{format(new Date(program.endDate), "MMM d, yyyy")}</p>
                  </div>
                )}
              </div>
            </DashboardCardLayout>
          )}

          {/* ===== Participants Tab (Dev Org Only) ===== */}
          {activeTab === "participants" && isOwner && (
            <>
              {/* Stats Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Applicants", value: applicants.length, color: "bg-blue-50 text-blue-700" },
                  { label: "Accepted", value: applicants.filter((a: any) => a.status === "accepted").length, color: "bg-green-50 text-green-700" },
                  { label: "Under Review", value: applicants.filter((a: any) => a.status === "submitted" || a.status === "draft").length, color: "bg-yellow-50 text-yellow-700" },
                  { label: "Rejected", value: applicants.filter((a: any) => a.status === "rejected").length, color: "bg-red-50 text-red-700" },
                ].map((s) => (
                  <Card key={s.label} className={cn("p-4 shadow-none border", s.color.split(" ")[0])}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs font-medium mt-1">{s.label}</p>
                  </Card>
                ))}
              </div>

              {/* Applicants Table */}
              <DashboardCardLayout>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                    Enrolled Participants
                    <Badge className="bg-[#F4FFFC] text-[#008060]">{applicants.length}</Badge>
                  </h3>
                  <Button
                    variant="tertiary"
                    className="text-green text-sm"
                    onClick={() => router.push(`/${params.accessType}/programs/${params.sluge}/applicants`)}
                  >
                    View All Applicants
                  </Button>
                </div>
                <ReusableTable
                  columns={participantColumns}
                  data={applicants.slice(0, 10)}
                  noDataCaption="No participants found"
                  noDataText="No participants have been accepted yet."
                />
              </DashboardCardLayout>
            </>
          )}

          {/* ===== Resources Tab ===== */}
          {activeTab === "resources" && (
            <>
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-4">Program Materials</h3>
                <div className="space-y-3">
                  {programResources.map((res) => (
                    <div key={res.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#E8E8E8] hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-[#008060]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#18181B] truncate">{res.name}</p>
                        <p className="text-xs text-gray-500">{res.type} - {res.size}</p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600 text-[10px] shrink-0">{res.category}</Badge>
                      <button className="text-[#008060] hover:text-[#006B50] shrink-0">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </DashboardCardLayout>

              {/* Useful Links */}
              <DashboardCardLayout>
                <h3 className="font-bold text-base text-[#18181B] mb-4">Useful Links</h3>
                <div className="space-y-2">
                  {[
                    { label: "Program Website", href: "#" },
                    { label: "Partner Portal", href: "#" },
                    { label: "Training Platform", href: "#" },
                  ].map((link, i) => (
                    <a
                      key={i}
                      href={link.href}
                      className="flex items-center gap-2 p-3 rounded-lg border border-[#E8E8E8] hover:bg-gray-50 transition-colors text-sm text-[#008060] font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {link.label}
                    </a>
                  ))}
                </div>
              </DashboardCardLayout>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Application Panel (SME) */}
          {isSme && searchParams.get("apply") === "true" && (
            <Card className="p-5 shadow-none border border-[#E8E8E8]">
              <h4 className="font-bold text-sm text-[#18181B] mb-3">Application Status</h4>
              <div className="space-y-3">
                {["Review Eligibility", "Prepare Documents", "Submit Application", "Under Review"].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={cn("w-5 h-5 rounded-full flex items-center justify-center shrink-0", i < 1 ? "bg-[#008060]" : "bg-gray-200")}>
                      {i < 1 ? <CheckCircle2 className="w-3 h-3 text-white" /> : <span className="text-[10px] text-gray-500">{i + 1}</span>}
                    </div>
                    <span className={cn("text-xs", i < 1 ? "text-[#18181B] font-medium" : "text-gray-400")}>{step}</span>
                  </div>
                ))}
              </div>
              <Button variant="primary" className="w-full mt-4" onClick={() => setShowApplyConfirm(true)}>
                Apply Now
              </Button>
            </Card>
          )}

          {/* Program Stats */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Program Statistics</h4>
            <div className="space-y-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{stat.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#18181B]">{stat.value}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Program Duration */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Duration</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-[#008060]" />
              <span>{formatDateRange(dateRange)}</span>
            </div>
            {program?.applicationDeadline && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Deadline: {format(new Date(program.applicationDeadline), "MMM d, yyyy")}</span>
              </div>
            )}
          </Card>

          {/* Contact Info */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Contact</h4>
            <p className="text-xs text-gray-500 mb-2">
              Have questions about this program? Reach out to the program organizers.
            </p>
            <Button variant="secondary" className="w-full text-sm" size="small">
              Contact Organizer
            </Button>
          </Card>

          {/* Similar Programs Placeholder */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Similar Programs</h4>
            <p className="text-xs text-gray-400">More programs matching your profile will appear here.</p>
          </Card>
        </div>
      </div>

      {/* Apply Confirmation Dialog */}
      <Dialog open={showApplyConfirm} onOpenChange={setShowApplyConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply to Program</DialogTitle>
            <DialogDescription>
              Are you sure you want to apply to <strong>{program?.name}</strong>? Your profile and documents will be shared with the program organizers for review.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="secondary" onClick={() => setShowApplyConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleApplyToProgram} disabled={isApplying}>
              {isApplying ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Confirm Application
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <CreateProgram program={program} isOpen={isOpen} setIsOpen={setIsOpen} isEdit={isEdit} />
    </div>
  );
}

export default ProgramDetailPage;
