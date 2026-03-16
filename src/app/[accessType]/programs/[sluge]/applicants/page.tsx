"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ReusableTable } from "@/components/ui/table";
import { useIndustries } from "@/hooks/useComplianceCatalogs";
import { GetProgramApplications, GetProgramById, reviewApplication } from "@/hooks/usePrograms";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronRight,
  Users,
  ClockIcon,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
  LayoutGrid,
  LayoutList,
  Search,
  Filter,
  Loader2,
  FileText,
  Building2,
  ArrowUpDown,
  BarChart3,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type ViewMode = "table" | "card";
type StatusFilter = "all" | "submitted" | "accepted" | "rejected" | "draft" | "waitlisted";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusBadge(status: string) {
  const s = status?.toLowerCase();
  switch (s) {
    case "accepted":
      return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" };
    case "rejected":
      return { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" };
    case "submitted":
    case "draft":
      return { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500" };
    case "waitlisted":
      return { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-500" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedApplicants, setSelectedApplicants] = useState<string[]>([]);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; applicant: any | null }>({ open: false, applicant: null });
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<any[]>([]);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: program } = GetProgramApplications(params.sluge as string);
  const { data: programDetails, isLoading } = GetProgramById(params.sluge as string);
  const { data: industries = [] } = useIndustries();

  const applicants: any[] = program?.applications ?? [];

  // Filtering
  const filteredApplicants = useMemo(() => {
    let result = [...applicants];

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a: any) =>
          a?.sme?.smeBusinessInfo?.businessName?.toLowerCase().includes(q) ||
          a?.sme?.smeBusinessInfo?.industry?.toLowerCase().includes(q) ||
          a?.sme?.smeBusinessInfo?.countryOfOperation?.join(", ").toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter((a: any) => a.status?.toLowerCase() === statusFilter);
    }

    // Industry
    if (industryFilter !== "all") {
      result = result.filter(
        (a: any) => a?.sme?.smeBusinessInfo?.industry?.toLowerCase() === industryFilter.toLowerCase()
      );
    }

    // Sort
    if (sortBy === "newest") {
      result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "readiness") {
      result.sort((a: any, b: any) => (b.sme?.readinessPct ?? 0) - (a.sme?.readinessPct ?? 0));
    } else if (sortBy === "name") {
      result.sort((a: any, b: any) => (a.sme?.smeBusinessInfo?.businessName ?? "").localeCompare(b.sme?.smeBusinessInfo?.businessName ?? ""));
    }

    return result;
  }, [applicants, search, statusFilter, industryFilter, sortBy]);

  // KPI values
  const kpi = useMemo(() => {
    const total = applicants.length;
    const accepted = applicants.filter((a: any) => a.status === "accepted").length;
    const rejected = applicants.filter((a: any) => a.status === "rejected").length;
    const underReview = applicants.filter((a: any) => a.status === "submitted" || a.status === "draft").length;
    return { total, accepted, rejected, underReview };
  }, [applicants]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedApplicants.length === filteredApplicants.length) {
      setSelectedApplicants([]);
    } else {
      setSelectedApplicants(filteredApplicants.map((a: any) => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedApplicants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Compare toggle
  const toggleCompare = (applicant: any) => {
    setCompareList((prev) => {
      const exists = prev.find((a: any) => a.id === applicant.id);
      if (exists) return prev.filter((a: any) => a.id !== applicant.id);
      if (prev.length >= 3) {
        toast.error("You can compare up to 3 applicants");
        return prev;
      }
      return [...prev, applicant];
    });
  };

  // Table columns
  const columns = [
    {
      header: () => (
        <input
          type="checkbox"
          checked={selectedApplicants.length === filteredApplicants.length && filteredApplicants.length > 0}
          onChange={toggleSelectAll}
          className="rounded border-gray-300"
        />
      ),
      accessor: (row: any) => (
        <input
          type="checkbox"
          checked={selectedApplicants.includes(row.id)}
          onChange={() => toggleSelect(row.id)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      header: "Name",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F4FFFC] flex items-center justify-center text-[#008060] font-semibold text-xs shrink-0">
            {(row.sme?.smeBusinessInfo?.businessName || "S").charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-medium text-sm block">{row.sme?.smeBusinessInfo?.businessName || "N/A"}</span>
            <span className="text-xs text-gray-400">{row.sme?.smeBusinessInfo?.industry || ""}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Country",
      accessor: (row: any) => row.sme?.smeBusinessInfo?.countryOfOperation?.join(", ") || "N/A",
    },
    {
      header: "Readiness Score",
      accessor: (row: any) => {
        const score = row.sme?.readinessPct ?? 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(score, 100)}%`,
                  backgroundColor: score >= 70 ? "#22C55E" : score >= 40 ? "#FACC15" : "#EF4444",
                }}
              />
            </div>
            <span className="text-xs font-medium w-8">{score}%</span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (row: any) => {
        const style = getStatusBadge(row.status);
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", style.bg, style.text)}>
            <div className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
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
      header: "Revenue",
      accessor: (row: any) => row.sme?.revenueTTM ?? "-",
    },
    {
      header: "Team Size",
      accessor: (row: any) => row.sme?.teamSize ?? "-",
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Button
            variant="tertiary"
            size="small"
            className="text-green text-xs"
            onClick={() =>
              router.push(
                `/${params.accessType}/programs/${params.sluge}/applicants/${row.smeId}?applicationId=${row.id}&status=${encodeURIComponent(row.status)}`
              )
            }
          >
            <Eye className="w-3 h-3 mr-1" />
            Review
          </Button>
          {compareMode && (
            <button
              onClick={() => toggleCompare(row)}
              className={cn(
                "p-1 rounded-md border text-xs",
                compareList.find((c) => c.id === row.id)
                  ? "bg-[#008060] text-white border-[#008060]"
                  : "border-gray-300 text-gray-600"
              )}
            >
              <Star className="w-3 h-3" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#008060]" />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between my-3">
        <div className="inline-flex items-center gap-1 text-xs md:text-sm lg:text-base">
          <button
            onClick={() => router.push(`/${params.accessType}/programs/${params.sluge}`)}
            className="hover:text-[#008060] flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            {programDetails?.name || "Program"}
          </button>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <p className="font-medium text-[#008060]">Applicants</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="small" className="text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Applicants", value: kpi.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Under Review", value: kpi.underReview, icon: ClockIcon, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Accepted", value: kpi.accepted, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Rejected", value: kpi.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4 shadow-none border border-[#E8E8E8]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-[#18181B] mt-1">{card.value}</p>
                </div>
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", card.bg)}>
                  <Icon className={cn("w-5 h-5", card.color)} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters & Controls */}
      <DashboardCardLayout>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#18181B] flex items-center gap-2">
              Program Applicants
              <Badge className="bg-[#F4FFFC] text-[#008060]">{filteredApplicants.length}</Badge>
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="submitted">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="waitlisted">Waitlisted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Industry Filter */}
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-9 text-xs">
                <ArrowUpDown className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="readiness">Readiness Score</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <SearchForm
              className="w-full sm:w-auto md:min-w-[200px]"
              inputClassName="h-9 pl-9 text-xs"
              iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-7"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />

            {/* View Toggle */}
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setViewMode("table")}
                className={cn("p-2 rounded-l-md", viewMode === "table" ? "bg-[#008060] text-white" : "text-gray-500")}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={cn("p-2 rounded-r-md", viewMode === "card" ? "bg-[#008060] text-white" : "text-gray-500")}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions & Compare */}
        {(selectedApplicants.length > 0 || compareMode) && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-[#F4FFFC] rounded-lg border border-[#ABD2C7]">
            {selectedApplicants.length > 0 && (
              <>
                <span className="text-xs text-gray-600">{selectedApplicants.length} selected</span>
                <Button variant="primary" size="small" className="text-xs">Accept Selected</Button>
                <Button variant="secondary" size="small" className="text-xs !border-red-300 !text-red-600">Reject Selected</Button>
                <Button variant="secondary" size="small" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export Selected
                </Button>
                <Separator orientation="vertical" className="h-5" />
              </>
            )}
            <Button
              variant={compareMode ? "primary" : "secondary"}
              size="small"
              className="text-xs"
              onClick={() => {
                setCompareMode(!compareMode);
                if (compareMode) {
                  setCompareList([]);
                }
              }}
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              {compareMode ? `Compare (${compareList.length}/3)` : "Compare Mode"}
            </Button>
            {compareMode && compareList.length >= 2 && (
              <Button variant="primary" size="small" className="text-xs" onClick={() => setCompareDialogOpen(true)}>
                Compare Now
              </Button>
            )}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <ReusableTable
            columns={columns}
            noDataCaption="No applicants found"
            noDataText="No applicants match your current filters. Try adjusting your search criteria."
            data={filteredApplicants}
            totalPages={program?.pagination?.totalPages ?? 0}
          />
        )}

        {/* Card View */}
        {viewMode === "card" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplicants.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No applicants found</p>
              </div>
            )}
            {filteredApplicants.map((applicant: any) => {
              const score = applicant.sme?.readinessPct ?? 0;
              const statusStyle = getStatusBadge(applicant.status);
              return (
                <Card key={applicant.id} className="p-4 shadow-none border border-[#E8E8E8] hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-[#F4FFFC] flex items-center justify-center text-[#008060] font-semibold text-sm">
                        {(applicant.sme?.smeBusinessInfo?.businessName || "S").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{applicant.sme?.smeBusinessInfo?.businessName || "N/A"}</p>
                        <p className="text-xs text-gray-400">{applicant.sme?.smeBusinessInfo?.industry || ""}</p>
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", statusStyle.bg, statusStyle.text)}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                      {applicant.status?.replace(/_/g, " ") || "N/A"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Readiness Score</span>
                      <span className="font-medium">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(score, 100)}%`,
                          backgroundColor: score >= 70 ? "#22C55E" : score >= 40 ? "#FACC15" : "#EF4444",
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-gray-400">Country</span>
                      <p className="font-medium">{applicant.sme?.smeBusinessInfo?.countryOfOperation?.join(", ") || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Team Size</span>
                      <p className="font-medium">{applicant.sme?.teamSize ?? "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Revenue</span>
                      <p className="font-medium">{applicant.sme?.revenueTTM ?? "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Applied</span>
                      <p className="font-medium">{applicant.createdAt ? format(new Date(applicant.createdAt), "MMM d") : "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="small"
                      className="flex-1 text-xs"
                      onClick={() =>
                        router.push(
                          `/${params.accessType}/programs/${params.sluge}/applicants/${applicant.smeId}?applicationId=${applicant.id}&status=${encodeURIComponent(applicant.status)}`
                        )
                      }
                    >
                      Review
                    </Button>
                    {compareMode && (
                      <button
                        onClick={() => toggleCompare(applicant)}
                        className={cn(
                          "p-2 rounded-md border",
                          compareList.find((c) => c.id === applicant.id)
                            ? "bg-[#008060] text-white border-[#008060]"
                            : "border-gray-300 text-gray-500"
                        )}
                      >
                        <Star className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DashboardCardLayout>

      {/* Comparison Dialog */}
      <Dialog open={compareDialogOpen} onOpenChange={setCompareDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Applicant Comparison</DialogTitle>
            <DialogDescription>Side-by-side comparison of selected applicants</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${compareList.length}, 1fr)` }}>
            {compareList.map((applicant: any) => {
              const score = applicant.sme?.readinessPct ?? 0;
              const statusStyle = getStatusBadge(applicant.status);
              return (
                <Card key={applicant.id} className="p-4 shadow-none border border-[#E8E8E8]">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#F4FFFC] flex items-center justify-center text-[#008060] font-semibold mx-auto mb-2">
                      {(applicant.sme?.smeBusinessInfo?.businessName || "S").charAt(0).toUpperCase()}
                    </div>
                    <p className="font-bold text-sm">{applicant.sme?.smeBusinessInfo?.businessName || "N/A"}</p>
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium mt-1", statusStyle.bg, statusStyle.text)}>
                      {applicant.status}
                    </span>
                  </div>

                  <Separator className="mb-3" />

                  <div className="space-y-3 text-xs">
                    {[
                      { label: "Industry", value: applicant.sme?.smeBusinessInfo?.industry || "N/A" },
                      { label: "Country", value: applicant.sme?.smeBusinessInfo?.countryOfOperation?.join(", ") || "N/A" },
                      { label: "Readiness", value: `${score}%` },
                      { label: "Revenue", value: applicant.sme?.revenueTTM ?? "N/A" },
                      { label: "Team Size", value: applicant.sme?.teamSize ?? "N/A" },
                      { label: "Applied", value: applicant.createdAt ? format(new Date(applicant.createdAt), "MMM d, yyyy") : "N/A" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-gray-500">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Readiness Bar */}
                  <div className="mt-3">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(score, 100)}%`,
                          backgroundColor: score >= 70 ? "#22C55E" : score >= 40 ? "#FACC15" : "#EF4444",
                        }}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApplicantsPage;
