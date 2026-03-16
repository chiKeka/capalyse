"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusBadge } from "@/components/ui/statusBar";
import { ReusableTable } from "@/components/ui/table";
import {
  useAdminProgramById,
  useAdminProgramApplications,
  useUpdateAdminProgram,
  useUpdateProgramStatus,
  useReviewApplication,
} from "@/hooks/admin/programs";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Users,
  DollarSign,
  BarChart3,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  PencilIcon,
  Copy,
  Archive,
  Download,
  Eye,
  TrendingUp,
  Target,
  Calendar,
  Globe,
  Briefcase,
  Building2,
  AlertTriangle,
  MoreHorizontal,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------
const TABS = ["details", "applicants", "funding", "compliance", "analytics"] as const;
type TabKey = (typeof TABS)[number];

const STATUS_ACTIONS = [
  { value: "publish", label: "Publish", icon: CheckCircle2 },
  { value: "close", label: "Close Applications", icon: XCircle },
  { value: "complete", label: "Mark Complete", icon: CheckCircle2 },
  { value: "cancel", label: "Cancel Program", icon: AlertTriangle },
];

function getStatusClass(status: string) {
  switch (status?.toLowerCase()) {
    case "published":
    case "active":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
    case "close":
      return "bg-gray-100 text-gray-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "cancel":
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function formatStatus(status: string) {
  return status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "N/A";
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
function AdminProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabKey>("details");
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [applicantStatusFilter, setApplicantStatusFilter] = useState("all");
  const [reviewingApp, setReviewingApp] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  // Form state for editable details
  const [formData, setFormData] = useState<any>({});

  const { data: program, isLoading: isProgramLoading } = useAdminProgramById(programId);
  const { data: applicantsData, isLoading: isApplicantsLoading } = useAdminProgramApplications(programId);
  const updateProgram = useUpdateAdminProgram(programId);
  const updateStatus = useUpdateProgramStatus(programId);
  const { data: industries = [] } = useIndustries();

  const applicants = applicantsData?.applications ?? [];

  // Initialize form data from program
  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || "",
        description: program.description || "",
        objectives: program.objectives || [],
        startDate: program.startDate ? program.startDate.split("T")[0] : "",
        endDate: program.endDate ? program.endDate.split("T")[0] : "",
        applicationDeadline: program.applicationDeadline ? program.applicationDeadline.split("T")[0] : "",
        maxParticipants: program.maxParticipants || 0,
        eligibleCountries: program.eligibleCountries || [],
        industryFocus: program.industryFocus || [],
        smeStage: program.smeStage || [],
        supportTypes: program.supportTypes || [],
      });
    }
  }, [program]);

  // Filtered applicants
  const filteredApplicants = useMemo(() => {
    let result = [...applicants];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a: any) =>
          a?.sme?.smeBusinessInfo?.businessName?.toLowerCase().includes(q) ||
          a?.sme?.smeBusinessInfo?.industry?.toLowerCase().includes(q)
      );
    }
    if (applicantStatusFilter !== "all") {
      result = result.filter((a: any) => a.status?.toLowerCase() === applicantStatusFilter);
    }
    return result;
  }, [applicants, search, applicantStatusFilter]);

  // KPI computations
  const kpi = useMemo(() => {
    const total = applicants.length;
    const accepted = applicants.filter((a: any) => a.status === "accepted").length;
    const rejected = applicants.filter((a: any) => a.status === "rejected").length;
    const pending = applicants.filter((a: any) => a.status === "submitted" || a.status === "draft").length;
    const avgReadiness = total > 0 ? Math.round(applicants.reduce((sum: number, a: any) => sum + (a.sme?.readinessPct ?? 0), 0) / total) : 0;
    return { total, accepted, rejected, pending, avgReadiness };
  }, [applicants]);

  // Handlers
  const handleStatusUpdate = (status: string) => {
    updateStatus.mutate(status, {
      onSuccess: () => toast.success(`Program status updated to ${status}`),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSaveDetails = () => {
    updateProgram.mutate(formData, {
      onSuccess: () => {
        toast.success("Program details updated successfully");
        setIsEditing(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  // Applicant columns
  const applicantColumns = [
    {
      header: "SME Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#F4FFFC] flex items-center justify-center text-[#008060] font-semibold text-xs">
            {(row.sme?.smeBusinessInfo?.businessName || "S").charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-sm">{row.sme?.smeBusinessInfo?.businessName || "N/A"}</span>
            <span className="block text-xs text-gray-400">{row.sme?.smeBusinessInfo?.industry || ""}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Country",
      accessor: (row: any) => row.sme?.smeBusinessInfo?.countryOfOperation?.join(", ") || "N/A",
    },
    {
      header: "Readiness",
      accessor: (row: any) => {
        const score = row.sme?.readinessPct ?? 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
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
      accessor: (row: any) => (
        <Badge className={cn(getStatusClass(row.status), "capitalize text-[10px]")}>
          {formatStatus(row.status)}
        </Badge>
      ),
    },
    {
      header: "Applied",
      accessor: (row: any) => row.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy") : "N/A",
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-1">
          {(row.status === "submitted" || row.status === "draft") && (
            <>
              <Button
                variant="primary"
                size="small"
                className="text-[10px] px-2 py-1"
                onClick={() => setReviewingApp(row)}
              >
                Review
              </Button>
            </>
          )}
          <Button
            variant="tertiary"
            size="small"
            className="text-green text-[10px] px-2 py-1"
            onClick={() => setReviewingApp(row)}
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      ),
    },
  ];

  // Mock funding data
  const fundingData = {
    totalBudget: 500000,
    disbursed: 125000,
    pending: 75000,
    remaining: 300000,
    disbursements: [
      { id: "1", recipient: "GreenPack Solutions", amount: 25000, date: "2025-01-15", status: "completed" },
      { id: "2", recipient: "TechFarm Nigeria", amount: 30000, date: "2025-02-01", status: "completed" },
      { id: "3", recipient: "AgroConnect Ltd", amount: 20000, date: "2025-02-15", status: "completed" },
      { id: "4", recipient: "EcoPackaging Co", amount: 25000, date: "2025-03-01", status: "pending" },
      { id: "5", recipient: "SmartRetail Hub", amount: 25000, date: "2025-03-01", status: "pending" },
    ],
  };

  // Mock compliance checklist
  const complianceChecklist = [
    { id: "1", item: "Program Terms & Conditions Published", status: "completed", dueDate: "2025-01-01" },
    { id: "2", item: "Participant Agreements Signed", status: "in_progress", dueDate: "2025-02-01" },
    { id: "3", item: "Quarterly Progress Report Q1", status: "completed", dueDate: "2025-04-01" },
    { id: "4", item: "Quarterly Progress Report Q2", status: "pending", dueDate: "2025-07-01" },
    { id: "5", item: "Mid-Program Audit Review", status: "pending", dueDate: "2025-06-01" },
    { id: "6", item: "Final Impact Assessment", status: "pending", dueDate: "2025-12-01" },
  ];

  if (isProgramLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-4">
        <Link href="/admin/program-management" className="hover:text-[#008060] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Program Management
        </Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="font-medium text-[#008060]">{program?.name || "Program Details"}</span>
      </div>

      {/* Program Header */}
      <Card className="p-6 mb-6 shadow-none border border-[#E8E8E8]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#18181B]">{program?.name}</h1>
              <Badge className={cn(getStatusClass(program?.status), "capitalize")}>{formatStatus(program?.status)}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{program?.organization?.organizationName || program?.partners?.map((p: any) => p.name).join(", ") || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {program?.createdAt ? format(new Date(program.createdAt), "MMM d, yyyy") : "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              className="text-xs"
              onClick={() => {
                setIsEditing(true);
                setActiveTab("details");
              }}
            >
              <PencilIcon className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="small" className="text-xs flex items-center gap-1">
                  Actions
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 bg-white border shadow-lg rounded-lg">
                {STATUS_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <DropdownMenuItem
                      key={action.value}
                      onClick={() => handleStatusUpdate(action.value)}
                      className="px-3 py-2 text-sm cursor-pointer"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
                <Separator />
                <DropdownMenuItem className="px-3 py-2 text-sm cursor-pointer">
                  <Copy className="w-4 h-4 mr-2" />
                  Clone Program
                </DropdownMenuItem>
                <DropdownMenuItem className="px-3 py-2 text-sm cursor-pointer">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Program
                </DropdownMenuItem>
                <DropdownMenuItem className="px-3 py-2 text-sm cursor-pointer">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b border-[#E8E8E8] overflow-x-auto">
        {TABS.map((tab) => (
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
        ))}
      </div>

      {/* ===== Details Tab ===== */}
      {activeTab === "details" && (
        <div className="space-y-6">
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#18181B]">Program Information</h3>
              {!isEditing ? (
                <Button variant="tertiary" size="small" className="text-green text-xs" onClick={() => setIsEditing(true)}>
                  <PencilIcon className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="secondary" size="small" className="text-xs" onClick={() => setIsEditing(false)}>
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button variant="primary" size="small" className="text-xs" onClick={handleSaveDetails} disabled={updateProgram.isPending}>
                    {updateProgram.isPending && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-500">Program Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium mt-1">{program?.name}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Description</Label>
                  {isEditing ? (
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1"
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm mt-1 text-gray-700">{program?.description}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Objectives</Label>
                  <ul className="mt-1 space-y-1">
                    {(isEditing ? formData.objectives : program?.objectives)?.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#008060] shrink-0 mt-0.5" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Start Date</Label>
                    {isEditing ? (
                      <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="text-sm font-medium mt-1">{program?.startDate ? format(new Date(program.startDate), "MMM d, yyyy") : "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">End Date</Label>
                    {isEditing ? (
                      <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="mt-1" />
                    ) : (
                      <p className="text-sm font-medium mt-1">{program?.endDate ? format(new Date(program.endDate), "MMM d, yyyy") : "N/A"}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Application Deadline</Label>
                  {isEditing ? (
                    <Input type="date" value={formData.applicationDeadline} onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })} className="mt-1" />
                  ) : (
                    <p className="text-sm font-medium mt-1">{program?.applicationDeadline ? format(new Date(program.applicationDeadline), "MMM d, yyyy") : "N/A"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Max Participants</Label>
                  {isEditing ? (
                    <Input type="number" value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })} className="mt-1" />
                  ) : (
                    <p className="text-sm font-medium mt-1">{program?.maxParticipants ?? "Unlimited"}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Eligible Countries</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {program?.eligibleCountries?.map((c: string, i: number) => (
                      <Badge key={i} className="bg-gray-100 text-gray-700 text-[10px]">{c}</Badge>
                    )) || <p className="text-sm text-gray-400">None specified</p>}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Industry Focus</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {program?.industryFocus?.map((ind: string, i: number) => (
                      <Badge key={i} className="bg-[#F4FFFC] text-[#008060] text-[10px]">{ind}</Badge>
                    )) || <p className="text-sm text-gray-400">None specified</p>}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Support Types</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {program?.supportTypes?.map((t: string, i: number) => (
                      <Badge key={i} className="bg-blue-50 text-blue-700 text-[10px] capitalize">{t.replace(/_/g, " ")}</Badge>
                    )) || <p className="text-sm text-gray-400">None specified</p>}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ===== Applicants Tab ===== */}
      {activeTab === "applicants" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Total", value: kpi.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pending", value: kpi.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Accepted", value: kpi.accepted, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
              { label: "Rejected", value: kpi.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
              { label: "Avg Readiness", value: `${kpi.avgReadiness}%`, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="p-3 shadow-none border border-[#E8E8E8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500">{card.label}</p>
                      <p className="text-xl font-bold text-[#18181B]">{card.value}</p>
                    </div>
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", card.bg)}>
                      <Icon className={cn("w-4 h-4", card.color)} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Filters */}
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
                SME Applicants
                <Badge className="bg-[#F4FFFC] text-[#008060]">{filteredApplicants.length}</Badge>
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={applicantStatusFilter} onValueChange={setApplicantStatusFilter}>
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="submitted">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <SearchForm
                  className="w-full sm:w-auto md:min-w-[180px]"
                  inputClassName="h-8 pl-8 text-xs"
                  iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-7"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {isApplicantsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#008060]" />
              </div>
            ) : (
              <ReusableTable
                columns={applicantColumns}
                data={filteredApplicants}
                noDataCaption="No applicants found"
                noDataText="No applicants match your filters."
                totalPages={applicantsData?.pagination?.totalPages ?? 0}
              />
            )}
          </Card>
        </div>
      )}

      {/* ===== Funding Tab ===== */}
      {activeTab === "funding" && (
        <div className="space-y-6">
          {/* Budget Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Budget", value: `$${fundingData.totalBudget.toLocaleString()}`, color: "text-[#18181B]", bg: "bg-gray-50" },
              { label: "Disbursed", value: `$${fundingData.disbursed.toLocaleString()}`, color: "text-green-700", bg: "bg-green-50" },
              { label: "Pending", value: `$${fundingData.pending.toLocaleString()}`, color: "text-yellow-700", bg: "bg-yellow-50" },
              { label: "Remaining", value: `$${fundingData.remaining.toLocaleString()}`, color: "text-blue-700", bg: "bg-blue-50" },
            ].map((item) => (
              <Card key={item.label} className={cn("p-4 shadow-none border border-[#E8E8E8]", item.bg)}>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className={cn("text-xl font-bold mt-1", item.color)}>{item.value}</p>
              </Card>
            ))}
          </div>

          {/* Utilization Bar */}
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <h3 className="font-bold text-base text-[#18181B] mb-4">Budget Utilization</h3>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500" style={{ width: `${(fundingData.disbursed / fundingData.totalBudget) * 100}%` }} />
              <div className="h-full bg-yellow-400" style={{ width: `${(fundingData.pending / fundingData.totalBudget) * 100}%` }} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" />Disbursed ({Math.round((fundingData.disbursed / fundingData.totalBudget) * 100)}%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-400" />Pending ({Math.round((fundingData.pending / fundingData.totalBudget) * 100)}%)</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-200" />Remaining ({Math.round((fundingData.remaining / fundingData.totalBudget) * 100)}%)</div>
            </div>
          </Card>

          {/* Disbursement Schedule */}
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <h3 className="font-bold text-base text-[#18181B] mb-4">Disbursement Schedule</h3>
            <div className="space-y-3">
              {fundingData.disbursements.map((d) => (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-[#E8E8E8] hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", d.status === "completed" ? "bg-green-100" : "bg-yellow-100")}>
                      {d.status === "completed" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Clock className="w-4 h-4 text-yellow-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{d.recipient}</p>
                      <p className="text-xs text-gray-500">{format(new Date(d.date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${d.amount.toLocaleString()}</p>
                    <Badge className={cn(d.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800", "text-[10px] capitalize")}>{d.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ===== Compliance Tab ===== */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[#18181B]">Compliance Checklist</h3>
              <Badge className="bg-[#F4FFFC] text-[#008060]">
                {complianceChecklist.filter((c) => c.status === "completed").length}/{complianceChecklist.length} Complete
              </Badge>
            </div>
            <div className="space-y-3">
              {complianceChecklist.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#E8E8E8]">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    item.status === "completed" ? "bg-green-100" : item.status === "in_progress" ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    {item.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    ) : item.status === "in_progress" ? (
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", item.status === "completed" ? "text-gray-500 line-through" : "text-[#18181B]")}>{item.item}</p>
                    <p className="text-xs text-gray-400">Due: {format(new Date(item.dueDate), "MMM d, yyyy")}</p>
                  </div>
                  <Badge className={cn(
                    item.status === "completed" ? "bg-green-100 text-green-800" : item.status === "in_progress" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600",
                    "text-[10px] capitalize"
                  )}>
                    {item.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Audit Notes */}
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <h3 className="font-bold text-base text-[#18181B] mb-4">Audit Notes</h3>
            <Textarea placeholder="Add compliance or audit notes here..." rows={4} />
            <Button variant="primary" size="small" className="mt-3 text-xs">Save Notes</Button>
          </Card>
        </div>
      )}

      {/* ===== Analytics Tab ===== */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Funnel */}
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <h3 className="font-bold text-base text-[#18181B] mb-4">Applicant Funnel</h3>
            <div className="space-y-3">
              {[
                { stage: "Applied", count: kpi.total, pct: 100, color: "bg-blue-500" },
                { stage: "Under Review", count: kpi.pending, pct: kpi.total > 0 ? Math.round((kpi.pending / kpi.total) * 100) : 0, color: "bg-yellow-500" },
                { stage: "Accepted", count: kpi.accepted, pct: kpi.total > 0 ? Math.round((kpi.accepted / kpi.total) * 100) : 0, color: "bg-green-500" },
                { stage: "Rejected", count: kpi.rejected, pct: kpi.total > 0 ? Math.round((kpi.rejected / kpi.total) * 100) : 0, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.stage}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.stage}</span>
                    <span className="font-medium">{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Acceptance Rate", value: kpi.total > 0 ? `${Math.round((kpi.accepted / kpi.total) * 100)}%` : "0%", icon: TrendingUp, color: "text-green-600" },
              { label: "Avg Readiness Score", value: `${kpi.avgReadiness}%`, icon: Target, color: "text-blue-600" },
              { label: "Countries Represented", value: program?.eligibleCountries?.length ?? 0, icon: Globe, color: "text-purple-600" },
              { label: "Industries Covered", value: program?.industryFocus?.length ?? 0, icon: Briefcase, color: "text-orange-600" },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label} className="p-4 shadow-none border border-[#E8E8E8]">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-8 h-8", metric.color)} />
                    <div>
                      <p className="text-xs text-gray-500">{metric.label}</p>
                      <p className="text-xl font-bold text-[#18181B]">{metric.value}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Impact Summary */}
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <h3 className="font-bold text-base text-[#18181B] mb-4">Impact Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "SMEs Supported", value: kpi.accepted },
                { label: "Total Funding Disbursed", value: `$${fundingData.disbursed.toLocaleString()}` },
                { label: "Compliance Items", value: `${complianceChecklist.filter((c) => c.status === "completed").length}/${complianceChecklist.length}` },
                { label: "Program Status", value: formatStatus(program?.status) },
              ].map((item) => (
                <div key={item.label} className="text-center p-4 rounded-lg bg-[#F4FFFC]">
                  <p className="text-xl font-bold text-[#008060]">{item.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Review Application Dialog */}
      <Dialog open={!!reviewingApp} onOpenChange={(open) => !open && setReviewingApp(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              {reviewingApp?.sme?.smeBusinessInfo?.businessName || "Applicant"} - {reviewingApp?.sme?.smeBusinessInfo?.industry || "N/A"}
            </DialogDescription>
          </DialogHeader>
          {reviewingApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="font-medium">{reviewingApp.sme?.smeBusinessInfo?.countryOfOperation?.join(", ") || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Readiness Score</p>
                  <p className="font-medium">{reviewingApp.sme?.readinessPct ?? 0}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="font-medium">{reviewingApp.sme?.revenueTTM ?? "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Team Size</p>
                  <p className="font-medium">{reviewingApp.sme?.teamSize ?? "N/A"}</p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Review Notes</Label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review notes..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" size="small" className="text-xs !border-red-300 !text-red-600" onClick={() => setReviewingApp(null)}>
                  Reject
                </Button>
                <Button variant="secondary" size="small" className="text-xs" onClick={() => setReviewingApp(null)}>
                  Request More Info
                </Button>
                <Button variant="primary" size="small" className="text-xs" onClick={() => { setReviewingApp(null); toast.success("Application approved"); }}>
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminProgramDetailPage;
