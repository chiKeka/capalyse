"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import Programs from "@/components/sections/dashboardCards/programs";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import CreateProgram from "@/components/ui/createProgram";
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
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import useDebounce from "@/hooks/useDebounce";
import {
  GetProgramApplications,
  GetPrograms,
  useListMyApplications,
} from "@/hooks/usePrograms";
import { authAtom } from "@/lib/atoms/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import {
  ArrowUpDown,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Grid3X3,
  LayoutList,
  Search,
  Send,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AccessType = "sme" | "development" | "investor" | "admin";

const DEV_TABS = ["all", "active", "draft", "closed"] as const;
const SME_TABS = ["browse", "applications", "recommended"] as const;

const SUPPORT_TYPES = [
  { value: "all", label: "All Support Types" },
  { value: "Funding", label: "Funding" },
  { value: "Mentorship", label: "Mentorship" },
  { value: "Technical", label: "Technical" },
  { value: "Market Access", label: "Market Access" },
];

const STAGE_OPTIONS = [
  { value: "all", label: "All Stages" },
  { value: "Startup", label: "Startup" },
  { value: "Growth", label: "Growth" },
  { value: "Scale-up", label: "Scale-up" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "deadline", label: "Deadline" },
  { value: "participants", label: "Participants" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusColor(status: string) {
  switch (status) {
    case "published":
    case "active":
      return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" };
    case "draft":
      return { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" };
    case "closed":
    case "completed":
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-500" };
    case "cancelled":
    case "cancel":
      return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
    case "accepted":
      return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" };
    case "rejected":
      return { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" };
    case "pending":
      return { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" };
    case "waitlisted":
      return { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-500" };
  }
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function truncate(str: string | undefined, len: number) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function KpiCard({
  title,
  value,
  icon,
  accent = false,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className={cn("border-[#E4E4E7]", accent && "border-[#008060]/30")}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium text-[#52575C]">{title}</p>
            <p className="text-2xl font-bold text-[#18181B]">{value}</p>
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              accent ? "bg-[#008060]/10 text-[#008060]" : "bg-[#F4F4F5] text-[#52575C]",
            )}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = getStatusColor(status);
  return (
    <Badge
      variant="status"
      className={cn(colors.bg, colors.text, "gap-1.5 capitalize px-2.5 py-0.5")}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
      {status}
    </Badge>
  );
}

function ProgressBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 rounded-full bg-[#E4E4E7] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#008060] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-[#52575C] whitespace-nowrap">
        {current}/{max}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Program Detail Dialog
// ---------------------------------------------------------------------------
function ProgramDetailDialog({
  program,
  open,
  onClose,
  accessType,
  hasApplied,
  onApply,
  onEdit,
  applicationsData,
}: {
  program: any;
  open: boolean;
  onClose: () => void;
  accessType: string;
  hasApplied: boolean;
  onApply: () => void;
  onEdit: () => void;
  applicationsData?: any;
}) {
  const router = useRouter();
  const params = useParams();

  if (!program) return null;

  const isDevOrg = accessType === "development" || accessType === "admin";
  const isSme = accessType === "sme" || accessType === "investor";

  const applicationStats = applicationsData?.applications
    ? {
        total: applicationsData.applications.length,
        accepted: applicationsData.applications.filter(
          (a: any) => a.status === "accepted",
        ).length,
        rejected: applicationsData.applications.filter(
          (a: any) => a.status === "rejected",
        ).length,
        pending: applicationsData.applications.filter(
          (a: any) => a.status === "pending",
        ).length,
      }
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto lg:max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle className="text-xl text-[#008060]">
              {program.name}
            </DialogTitle>
            <StatusBadge status={program.status} />
          </div>
          <DialogDescription className="text-sm text-[#52575C]">
            {formatDate(program.startDate)} - {formatDate(program.endDate)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-[#18181B] mb-1">Description</h4>
            <p className="text-sm text-[#52575C] leading-relaxed">{program.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {program.industryFocus?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#A0A4A8] mb-1">Industry Focus</p>
                <div className="flex flex-wrap gap-1.5">
                  {program.industryFocus.map((ind: string) => (
                    <Badge
                      key={ind}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {ind}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {program.eligibleCountries?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#A0A4A8] mb-1">
                  Eligible Countries
                </p>
                <p className="text-sm text-[#52575C]">
                  {program.eligibleCountries.join(", ")}
                </p>
              </div>
            )}

            {program.supportTypes?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#A0A4A8] mb-1">Support Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {program.supportTypes.map((st: string) => (
                    <Badge
                      key={st}
                      variant="secondary"
                      className="text-xs font-normal"
                    >
                      {st}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {program.smeStage?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[#A0A4A8] mb-1">SME Stages</p>
                <div className="flex flex-wrap gap-1.5">
                  {program.smeStage.map((s: string) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {program.maxParticipants && (
              <div>
                <p className="text-xs font-medium text-[#A0A4A8] mb-1">
                  Max Participants
                </p>
                <p className="text-sm text-[#52575C]">{program.maxParticipants}</p>
              </div>
            )}

            {program.applicationDeadline && (
              <div>
                <p className="text-xs font-medium text-[#A0A4A8] mb-1">
                  Application Deadline
                </p>
                <p className="text-sm text-[#52575C]">
                  {formatDate(program.applicationDeadline)}
                </p>
              </div>
            )}
          </div>

          {/* Objectives */}
          {program.objectives?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[#18181B] mb-2">
                Objectives
              </h4>
              <ul className="space-y-1.5">
                {program.objectives.map((obj: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-[#52575C]"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#008060] mt-0.5 shrink-0" />
                    {obj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Partners */}
          {program.partners?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-[#18181B] mb-2">Partners</h4>
              <div className="flex flex-wrap gap-2">
                {program.partners.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-[#E4E4E7] px-3 py-2"
                  >
                    <img
                      src="/icons/partnerBadge.png"
                      className="h-4 w-4"
                      alt=""
                    />
                    <div>
                      <p className="text-sm font-medium text-[#18181B]">
                        {p.name}
                      </p>
                      {p.role && (
                        <p className="text-xs text-[#A0A4A8]">{p.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participant Progress */}
          {program.maxParticipants && (
            <div>
              <h4 className="text-sm font-semibold text-[#18181B] mb-2">
                Participants
              </h4>
              <ProgressBar
                current={program.currentParticipants ?? applicationStats?.accepted ?? 0}
                max={program.maxParticipants}
              />
            </div>
          )}

          {/* Application Stats (Dev Org) */}
          {isDevOrg && applicationStats && (
            <div>
              <h4 className="text-sm font-semibold text-[#18181B] mb-2">
                Application Statistics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-lg bg-[#F4F4F5] p-3 text-center">
                  <p className="text-lg font-bold text-[#18181B]">
                    {applicationStats.total}
                  </p>
                  <p className="text-xs text-[#52575C]">Total</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-lg font-bold text-green-700">
                    {applicationStats.accepted}
                  </p>
                  <p className="text-xs text-green-600">Accepted</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-lg font-bold text-red-700">
                    {applicationStats.rejected}
                  </p>
                  <p className="text-xs text-red-600">Rejected</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3 text-center">
                  <p className="text-lg font-bold text-orange-700">
                    {applicationStats.pending}
                  </p>
                  <p className="text-xs text-orange-600">Pending</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E4E7] mt-2">
          {isSme && !hasApplied && (
            <Button
              onClick={() => {
                router.push(
                  `/${params.accessType}/programs/${program.id}?apply=true`,
                );
                onClose();
              }}
            >
              <Send className="h-4 w-4 mr-1" />
              Apply Now
            </Button>
          )}
          {isSme && hasApplied && (
            <Button variant="secondary" state="disabled">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Already Applied
            </Button>
          )}
          {isDevOrg && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  router.push(`/${params.accessType}/programs/${program.id}`);
                  onClose();
                }}
              >
                <Users className="h-4 w-4 mr-1" />
                View Applications
              </Button>
              <Button
                onClick={() => {
                  onEdit();
                  onClose();
                }}
              >
                <FileText className="h-4 w-4 mr-1" />
                Edit Program
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// My Applications Table (SME)
// ---------------------------------------------------------------------------
function MyApplicationsSection({ accessType }: { accessType: string }) {
  const router = useRouter();
  const params = useParams();
  const [appPage, setAppPage] = useState(1);

  const { data: myApps, isLoading } = useListMyApplications(
    { page: String(appPage), limit: "10", status: "" },
    accessType === "sme" || accessType === "investor",
  );

  const applications = myApps?.applications ?? [];
  const totalPages = myApps?.pagination?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#008060] border-t-transparent" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="py-12 flex items-center justify-center">
        <EmptyBox
          buttonText="Browse Programs"
          caption="No Applications Yet!"
          caption2="You have not applied to any programs yet."
          showButton={false}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E4E7]">
              <th className="text-left py-3 px-4 font-semibold text-[#52575C]">
                Program Name
              </th>
              <th className="text-left py-3 px-4 font-semibold text-[#52575C]">
                Applied Date
              </th>
              <th className="text-left py-3 px-4 font-semibold text-[#52575C]">
                Status
              </th>
              <th className="text-right py-3 px-4 font-semibold text-[#52575C]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app: any) => (
              <tr
                key={app.id}
                className="border-b border-[#E4E4E7] hover:bg-[#FAFAFA] transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="font-medium text-[#18181B]">
                    {app.program?.name ?? app.programName ?? "Program"}
                  </p>
                </td>
                <td className="py-3 px-4 text-[#52575C]">
                  {formatDate(app.createdAt ?? app.appliedAt)}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={app.status ?? "pending"} />
                </td>
                <td className="py-3 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="small"
                    className="text-[#008060] hover:text-[#008060]"
                    onClick={() =>
                      router.push(
                        `/${params.accessType}/programs/${app.programId ?? app.program?.id}?view=true`,
                      )
                    }
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="small"
            onClick={() => setAppPage((p) => Math.max(1, p - 1))}
            state={appPage <= 1 ? "disabled" : "default"}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#52575C]">
            Page {appPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="small"
            onClick={() => setAppPage((p) => Math.min(totalPages, p + 1))}
            state={appPage >= totalPages ? "disabled" : "default"}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
function ProgramsPage() {
  const params = useParams();
  const router = useRouter();
  const accessType = (params.accessType as AccessType) ?? "sme";
  const isDevOrg = accessType === "development" || accessType === "admin";
  const isSme = accessType === "sme" || accessType === "investor";

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [detailProgram, setDetailProgram] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [supportFilter, setSupportFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const debouncedSearch = useDebounce(search, 300);
  const auth = useAtomValue(authAtom);

  const tabs = isDevOrg ? DEV_TABS : SME_TABS;
  const [currentTab, setCurrentTab] = useState<string>(tabs[0]);

  // Queries
  const { data: industries = [] } = useIndustries();

  const ITEMS_PER_PAGE = 10;

  const filterParams = {
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    industry: industryFilter !== "all" ? industryFilter : undefined,
    country: undefined,
    stage: stageFilter !== "all" ? stageFilter : undefined,
    supportType: supportFilter !== "all" ? supportFilter : undefined,
    status: undefined,
    sortBy: sortBy !== "newest" ? sortBy : undefined,
    q: debouncedSearch || undefined,
  };

  const { data: programsData, isLoading: programsLoading } = GetPrograms({
    ...filterParams,
    userId: auth?.id,
  });

  const { data: myAppsData } = useListMyApplications(
    { page: "1", limit: "100", status: "" },
    isSme,
  );

  // For detail dialog application stats
  const { data: detailApplications } = GetProgramApplications(
    detailProgram?.id ?? "",
  );

  // Derived data
  const allPrograms = programsData?.programs ?? [];
  const myApplications = myAppsData?.applications ?? [];

  const appliedProgramIds = useMemo(
    () => new Set(myApplications.map((a: any) => a.programId ?? a.program?.id)),
    [myApplications],
  );

  // Filter programs based on tab + role
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter((p: any) => {
      const isMyProgram = p.developmentOrgId === auth?.id;

      // Role filtering: dev orgs see their own, SMEs see all
      if (isDevOrg && !isMyProgram && accessType !== "admin") return false;

      // Tab filtering
      if (isDevOrg) {
        switch (currentTab) {
          case "active":
            return (
              p.status === "published" ||
              p.status === "active"
            );
          case "draft":
            return p.status === "draft";
          case "closed":
            return (
              p.status === "closed" ||
              p.status === "completed" ||
              p.status === "cancelled"
            );
          case "all":
          default:
            return true;
        }
      } else {
        switch (currentTab) {
          case "applications":
            return false; // Handled by separate section
          case "recommended":
            // Simple heuristic: show published/active programs
            return p.status === "published" || p.status === "active";
          case "browse":
          default:
            return (
              p.status === "published" ||
              p.status === "active" ||
              p.status === "draft"
            );
        }
      }
    });
  }, [allPrograms, currentTab, auth?.id, isDevOrg, accessType]);

  // Sort programs
  const sortedPrograms = useMemo(() => {
    const sorted = [...filteredPrograms];
    switch (sortBy) {
      case "deadline":
        sorted.sort(
          (a: any, b: any) =>
            new Date(a.applicationDeadline ?? a.endDate ?? 0).getTime() -
            new Date(b.applicationDeadline ?? b.endDate ?? 0).getTime(),
        );
        break;
      case "participants":
        sorted.sort(
          (a: any, b: any) =>
            (b.currentParticipants ?? 0) - (a.currentParticipants ?? 0),
        );
        break;
      case "newest":
      default:
        sorted.sort(
          (a: any, b: any) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
        break;
    }
    return sorted;
  }, [filteredPrograms, sortBy]);

  // Pagination
  const totalPages = programsData?.pagination?.totalPages ??
    Math.max(1, Math.ceil(sortedPrograms.length / ITEMS_PER_PAGE));

  // KPI Calculations
  const kpiData = useMemo(() => {
    if (isDevOrg) {
      const myPrograms = allPrograms.filter(
        (p: any) => p.developmentOrgId === auth?.id,
      );
      const activePrograms = myPrograms.filter(
        (p: any) => p.status === "published" || p.status === "active",
      );
      const totalApplicants = myPrograms.reduce(
        (sum: number, p: any) => sum + (p.applicantsCount ?? p.currentParticipants ?? 0),
        0,
      );
      const totalAccepted = myPrograms.reduce(
        (sum: number, p: any) => sum + (p.acceptedCount ?? 0),
        0,
      );
      const acceptanceRate =
        totalApplicants > 0
          ? Math.round((totalAccepted / totalApplicants) * 100)
          : 0;
      return {
        card1: { title: "My Programs", value: myPrograms.length },
        card2: { title: "Active Programs", value: activePrograms.length },
        card3: { title: "Total Applicants", value: totalApplicants },
        card4: { title: "Acceptance Rate", value: `${acceptanceRate}%` },
      };
    } else {
      const availablePrograms = allPrograms.filter(
        (p: any) => p.status === "published" || p.status === "active",
      );
      const accepted = myApplications.filter(
        (a: any) => a.status === "accepted",
      );
      const pending = myApplications.filter(
        (a: any) => a.status === "pending",
      );
      return {
        card1: { title: "Available Programs", value: availablePrograms.length },
        card2: { title: "My Applications", value: myApplications.length },
        card3: { title: "Accepted", value: accepted.length },
        card4: { title: "Pending", value: pending.length },
      };
    }
  }, [allPrograms, myApplications, auth?.id, isDevOrg]);

  // Handlers
  const handleOpenDetail = (program: any) => {
    setDetailProgram(program);
    setDetailDialogOpen(true);
  };

  const handleEditProgram = (program: any) => {
    setSelectedProgram(program);
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setIndustryFilter("all");
    setSupportFilter("all");
    setStageFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    industryFilter !== "all" ||
    supportFilter !== "all" ||
    stageFilter !== "all";

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <DashboardCardLayout height="h-full" caption="">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <img src="/icons/code.svg" alt="" />
              <div>
                <p className="text-[#008060] text-base font-bold">Programs</p>
                <p className="text-xs text-[#52575C]">
                  {isDevOrg
                    ? "Manage and track your development programs"
                    : "Discover and apply to development programs"}
                </p>
              </div>
            </div>
            {isDevOrg && (
              <Button
                size="small"
                onClick={() => {
                  setIsOpen(true);
                  setIsEdit(false);
                  setSelectedProgram(null);
                }}
              >
                Create New Program
              </Button>
            )}
          </div>
        </div>
      </DashboardCardLayout>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title={kpiData.card1.title}
          value={kpiData.card1.value}
          icon={<BookOpen className="h-5 w-5" />}
          accent
        />
        <KpiCard
          title={kpiData.card2.title}
          value={kpiData.card2.value}
          icon={<TrendingUp className="h-5 w-5" />}
          accent
        />
        <KpiCard
          title={kpiData.card3.title}
          value={kpiData.card3.value}
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          title={kpiData.card4.title}
          value={kpiData.card4.value}
          icon={<Target className="h-5 w-5" />}
        />
      </div>

      {/* Tabs + Filters */}
      <DashboardCardLayout height="h-full" caption="">
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-[#E4E4E7]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab);
                  setCurrentPage(1);
                }}
                className={cn(
                  "transition-all capitalize duration-300 ease-in-out px-4 py-2 text-sm h-[39px] whitespace-nowrap",
                  currentTab === tab
                    ? "text-[#008060] border-b-2 border-b-[#008060] font-bold"
                    : "text-[#A0A4A8] hover:text-[#52575C] hover:font-bold",
                )}
              >
                {tab === "browse"
                  ? "Browse All"
                  : tab === "applications"
                    ? "My Applications"
                    : tab}
              </button>
            ))}
          </div>

          {/* Filters (not shown on "applications" tab) */}
          {currentTab !== "applications" && (
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A4A8] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-10 rounded-md border border-[#E4E4E7] bg-white pl-9 pr-3 text-sm text-[#18181B] placeholder:text-[#A0A4A8] focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
                />
              </div>

              {/* Industry Filter */}
              <Select
                value={industryFilter}
                onValueChange={(v) => {
                  setIndustryFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full lg:w-[180px] h-10 text-sm">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {(industries as string[]).map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Support Type Filter */}
              <Select
                value={supportFilter}
                onValueChange={(v) => {
                  setSupportFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full lg:w-[180px] h-10 text-sm">
                  <SelectValue placeholder="Support Type" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORT_TYPES.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Stage Filter */}
              <Select
                value={stageFilter}
                onValueChange={(v) => {
                  setStageFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full lg:w-[160px] h-10 text-sm">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[160px] h-10 text-sm">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-[#A0A4A8]" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-[#E4E4E7] rounded-md p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "list"
                      ? "bg-[#008060] text-white"
                      : "text-[#A0A4A8] hover:text-[#52575C]",
                  )}
                >
                  <LayoutList className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    viewMode === "grid"
                      ? "bg-[#008060] text-white"
                      : "text-[#A0A4A8] hover:text-[#52575C]",
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-[#008060] font-medium hover:underline whitespace-nowrap"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </DashboardCardLayout>

      {/* Content Area */}
      {currentTab === "applications" && isSme ? (
        <DashboardCardLayout height="h-full" caption="">
          <MyApplicationsSection accessType={accessType} />
        </DashboardCardLayout>
      ) : programsLoading ? (
        <DashboardCardLayout height="h-full" caption="">
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#008060] border-t-transparent" />
          </div>
        </DashboardCardLayout>
      ) : sortedPrograms.length > 0 ? (
        <div className="flex flex-col gap-4">
          {/* Programs Grid/List */}
          <DashboardCardLayout height="h-full" caption="">
            <div
              className={cn(
                "my-4 flex flex-col gap-3",
                viewMode === "grid" &&
                  "grid grid-cols-1 lg:grid-cols-2 gap-4",
              )}
            >
              {sortedPrograms.map((program: any) => (
                <div
                  key={program.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleOpenDetail(program)}
                >
                  {/* Enhanced wrapper around existing Programs card */}
                  <div className="flex flex-col gap-0">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Programs
                        editProgram={isEdit}
                        setEditProgram={(edit) => {
                          setIsEdit(edit);
                          if (edit) {
                            setSelectedProgram(program);
                            setIsOpen(true);
                          }
                        }}
                        program={program}
                        status={program.status}
                      />
                    </div>

                    {/* Enhancement overlay bar */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-6 pb-4 -mt-2">
                      {/* Industry + support badges */}
                      <div className="flex flex-wrap gap-1.5">
                        {program.industryFocus?.slice(0, 3).map((ind: string) => (
                          <Badge
                            key={ind}
                            variant="outline"
                            className="text-[10px] font-normal py-0 px-1.5"
                          >
                            {ind}
                          </Badge>
                        ))}
                        {program.industryFocus?.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal py-0 px-1.5"
                          >
                            +{program.industryFocus.length - 3}
                          </Badge>
                        )}
                        {program.supportTypes?.slice(0, 2).map((st: string) => (
                          <Badge
                            key={st}
                            variant="secondary"
                            className="text-[10px] font-normal py-0 px-1.5"
                          >
                            {st}
                          </Badge>
                        ))}
                      </div>

                      {/* Progress bar + deadline */}
                      <div className="flex items-center gap-4">
                        {program.applicationDeadline && (
                          <div className="flex items-center gap-1 text-[10px] text-[#52575C]">
                            <Clock className="h-3 w-3" />
                            <span>
                              Deadline: {formatDate(program.applicationDeadline)}
                            </span>
                          </div>
                        )}
                        {program.maxParticipants && (
                          <div className="w-32">
                            <ProgressBar
                              current={
                                program.currentParticipants ??
                                program.applicantsCount ??
                                0
                              }
                              max={program.maxParticipants}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCardLayout>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="ghost"
                size="small"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                state={currentPage <= 1 ? "disabled" : "default"}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "h-8 w-8 rounded-md text-sm font-medium transition-colors",
                        currentPage === pageNum
                          ? "bg-[#008060] text-white"
                          : "text-[#52575C] hover:bg-[#F4F4F5]",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="small"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                state={currentPage >= totalPages ? "disabled" : "default"}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <DashboardCardLayout height="h-full" caption="">
          <div className="w-full h-full py-16 flex flex-col items-center justify-center gap-4">
            <EmptyBox
              buttonText={isDevOrg ? "Create Program" : "Browse Programs"}
              caption={
                hasActiveFilters
                  ? "No Programs Match Your Filters"
                  : "No Programs Yet!"
              }
              caption2={
                hasActiveFilters
                  ? "Try adjusting your search or filter criteria."
                  : isDevOrg
                    ? "You have not created any programs yet."
                    : "There are no available programs at the moment."
              }
              actionType={isDevOrg ? "createProgram" : undefined}
              showButton={isDevOrg && !hasActiveFilters}
            />
            {hasActiveFilters && (
              <Button variant="secondary" size="small" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            )}
          </div>
        </DashboardCardLayout>
      )}

      {/* Program Detail Dialog */}
      <ProgramDetailDialog
        program={detailProgram}
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setDetailProgram(null);
        }}
        accessType={accessType}
        hasApplied={detailProgram ? appliedProgramIds.has(detailProgram.id) : false}
        onApply={() => {
          if (detailProgram) {
            router.push(
              `/${params.accessType}/programs/${detailProgram.id}?apply=true`,
            );
          }
        }}
        onEdit={() => {
          if (detailProgram) {
            handleEditProgram(detailProgram);
          }
        }}
        applicationsData={
          isDevOrg && detailProgram ? detailApplications : undefined
        }
      />

      {/* Create/Edit Program Dialog */}
      <CreateProgram
        isOpen={isOpen}
        setIsOpen={(open) => {
          setIsOpen(open);
          if (!open) {
            setIsEdit(false);
            setSelectedProgram(null);
          }
        }}
        isEdit={isEdit}
        program={selectedProgram}
      />
    </div>
  );
}

export default ProgramsPage;
