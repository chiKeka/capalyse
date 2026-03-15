"use client";

import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
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
import { ReusableTable } from "@/components/ui/table";
import {
  useAdminPrograms,
  useAdminProgramById,
  useAdminProgramCategories,
  useAdminProgramApplications,
  useCreateAdminProgram,
  useUpdateAdminProgram,
  useUpdateProgramStatus,
  useReviewApplication,
  type AdminProgramFormData,
} from "@/hooks/admin/programs";
import useDebounce from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Loader2Icon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  UsersIcon,
  LayoutListIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ── Status helpers ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Closed", value: "closed" },
];

const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    case "closed":
    case "ended":
      return "bg-red-100 text-red-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
    case "approved":
      return "bg-green-100 text-green-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "waitlisted":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "—";

// ── Modal type definitions ───────────────────────────────────────────────────

type ModalState =
  | null
  | { type: "create" }
  | { type: "edit"; programId: string }
  | { type: "detail"; programId: string }
  | { type: "applications"; programId: string }
  | { type: "review"; programId: string; applicationId: string };

// ── Empty form state ─────────────────────────────────────────────────────────

const emptyForm: AdminProgramFormData = {
  name: "",
  description: "",
  objectives: [],
  startDate: "",
  endDate: "",
  smeStage: [],
  eligibleCountries: [],
  industryFocus: [],
  maxParticipants: 0,
  supportTypes: [],
  applicationDeadline: "",
};

// ── Main Page Component ──────────────────────────────────────────────────────

export default function ProgramManagementPage() {
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  // Modal state
  const [modal, setModal] = useState<ModalState>(null);

  // Form state for create/edit
  const [form, setForm] = useState<AdminProgramFormData>(emptyForm);

  // Review state
  const [reviewNotes, setReviewNotes] = useState("");

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data, isLoading } = useAdminPrograms({
    page,
    limit: 20,
    q: debouncedSearch || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
  });

  const programs: any[] = data?.programs || data?.data || [];
  const totalPages = data?.pagination?.totalPages || data?.totalPages || 1;
  const totalPrograms = data?.pagination?.total || programs.length;

  const { data: categories = [] } = useAdminProgramCategories();
  const categoryList: string[] = Array.isArray(categories)
    ? categories
    : categories?.categories || [];

  // Detail / edit program query
  const selectedProgramId =
    modal?.type === "detail" || modal?.type === "edit" || modal?.type === "applications"
      ? modal.programId
      : "";
  const { data: selectedProgram, isLoading: isLoadingProgram } =
    useAdminProgramById(selectedProgramId);
  const programDetail = selectedProgram?.program || selectedProgram;

  // Applications query
  const applicationsId =
    modal?.type === "applications" || modal?.type === "review" ? modal.programId : "";
  const { data: applicationsData, isLoading: isLoadingApplications } =
    useAdminProgramApplications(applicationsId);
  const applications: any[] =
    applicationsData?.applications || applicationsData?.data || applicationsData || [];

  // ── Mutations ────────────────────────────────────────────────────────────

  const createMutation = useCreateAdminProgram();
  const updateMutation = useUpdateAdminProgram(
    modal?.type === "edit" ? modal.programId : "",
  );
  const statusMutation = useUpdateProgramStatus(
    modal?.type === "detail" ? modal.programId : "",
  );
  const reviewMutation = useReviewApplication(
    modal?.type === "review" ? modal.programId : "",
    modal?.type === "review" ? modal.applicationId : "",
  );

  // ── Computed KPIs ────────────────────────────────────────────────────────

  const activeCount = programs.filter(
    (p: any) => p.status?.toLowerCase() === "active",
  ).length;
  const totalApplications = programs.reduce(
    (sum: number, p: any) => sum + (p.applications?.total || 0),
    0,
  );
  const pendingReviews = programs.reduce(
    (sum: number, p: any) => sum + (p.applications?.pending || 0),
    0,
  );

  const overviewCards = [
    { id: 1, icon: CIcons.compliance, label: "Total Programs", amount: totalPrograms },
    { id: 2, icon: CIcons.badgeCheck, label: "Active Programs", amount: activeCount },
    {
      id: 3,
      icon: CIcons.applicants,
      label: "Total Applications",
      amount: totalApplications,
    },
    {
      id: 4,
      icon: CIcons.stickyNote,
      label: "Pending Reviews",
      amount: pendingReviews,
    },
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ type: "create" });
  };

  const openEdit = (program: any) => {
    setForm({
      name: program.name || "",
      description: program.description || "",
      objectives: program.objectives || [],
      startDate: program.startDate ? program.startDate.slice(0, 10) : "",
      endDate: program.endDate ? program.endDate.slice(0, 10) : "",
      smeStage: program.smeStage || [],
      eligibleCountries: program.eligibleCountries || [],
      industryFocus: program.industryFocus || [],
      maxParticipants: program.maxParticipants || 0,
      supportTypes: program.supportTypes || [],
      applicationDeadline: program.applicationDeadline
        ? program.applicationDeadline.slice(0, 10)
        : "",
    });
    setModal({ type: "edit", programId: program._id || program.id });
  };

  const openDetail = (program: any) => {
    setModal({ type: "detail", programId: program._id || program.id });
  };

  const openApplications = (programId: string) => {
    setModal({ type: "applications", programId });
  };

  const handleSubmitForm = () => {
    if (!form.name.trim()) {
      toast.error("Program name is required");
      return;
    }

    if (modal?.type === "create") {
      createMutation.mutate(form, {
        onSuccess: () => {
          toast.success("Program created successfully");
          setModal(null);
          setForm(emptyForm);
        },
        onError: () => toast.error("Failed to create program"),
      });
    } else if (modal?.type === "edit") {
      updateMutation.mutate(form, {
        onSuccess: () => {
          toast.success("Program updated successfully");
          setModal(null);
          setForm(emptyForm);
        },
        onError: () => toast.error("Failed to update program"),
      });
    }
  };

  const handleStatusChange = (status: string) => {
    statusMutation.mutate(status, {
      onSuccess: () => {
        toast.success(`Program status changed to ${status}`);
        setModal(null);
      },
      onError: () => toast.error("Failed to update status"),
    });
  };

  const handleReview = (action: "accept" | "reject") => {
    reviewMutation.mutate(
      {
        action,
        reviewNotes,
        rejectionReason: action === "reject" ? reviewNotes : undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            action === "accept" ? "Application approved" : "Application rejected",
          );
          setReviewNotes("");
          if (modal?.type === "review") {
            setModal({ type: "applications", programId: modal.programId });
          }
        },
        onError: () => toast.error(`Failed to ${action} application`),
      },
    );
  };

  const isFormPending = createMutation.isPending || updateMutation.isPending;

  // ── Table columns ────────────────────────────────────────────────────────

  const columns = [
    {
      header: "Name",
      accessor: (row: any) => (
        <span className="font-medium text-sm">{row.name || "—"}</span>
      ),
    },
    {
      header: "Category",
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {row.industryFocus?.join(", ") || row.category || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="status"
          className={cn("capitalize", getStatusClass(row.status))}
        >
          {formatStatus(row.status)}
        </Badge>
      ),
    },
    {
      header: "Applications",
      accessor: (row: any) => (
        <span className="text-sm">{row.applications?.total || 0}</span>
      ),
      className: "text-center",
    },
    {
      header: "Created",
      accessor: (row: any) =>
        row.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy") : "—",
    },
    {
      header: "Actions",
      accessor: (row: any) => (
        <div className="flex gap-1.5 items-center">
          <button
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            title="View Details"
            onClick={(e) => {
              e.stopPropagation();
              openDetail(row);
            }}
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
            title="View Applications"
            onClick={(e) => {
              e.stopPropagation();
              openApplications(row._id || row.id);
            }}
          >
            <UsersIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // ── Application table columns ────────────────────────────────────────────

  const applicationColumns = [
    {
      header: "Applicant",
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.applicant?.businessName ||
              row.applicant?.name ||
              row.sme?.businessName ||
              "—"}
          </span>
          {(row.applicant?.email || row.sme?.email) && (
            <span className="text-xs text-muted-foreground">
              {row.applicant?.email || row.sme?.email}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Organization",
      accessor: (row: any) =>
        row.applicant?.organizationName ||
        row.sme?.organizationName ||
        row.organization?.name ||
        "—",
    },
    {
      header: "Applied",
      accessor: (row: any) =>
        row.createdAt ? format(new Date(row.createdAt), "MMM d, yyyy") : "—",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="status"
          className={cn("capitalize", getStatusClass(row.status))}
        >
          {formatStatus(row.status)}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: (row: any) => {
        const appId = row._id || row.id;
        const isPending =
          row.status?.toLowerCase() === "pending" ||
          row.status?.toLowerCase() === "submitted";
        if (!isPending) {
          return (
            <span className="text-xs text-muted-foreground capitalize">
              {formatStatus(row.status)}
            </span>
          );
        }
        return (
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              if (modal?.type === "applications") {
                setReviewNotes("");
                setModal({
                  type: "review",
                  programId: modal.programId,
                  applicationId: appId,
                });
              }
            }}
          >
            Review
          </Button>
        );
      },
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="min-h-[120px] shadow-none animate-pulse">
                <CardContent className="h-full py-4">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))
          : overviewCards.map((card) => (
              <Card key={card.id} className="min-h-[120px] shadow-none">
                <CardContent className="flex flex-col gap-2 justify-between h-full py-4">
                  <span className="font-bold text-sm">{card.label}</span>
                  <div className="flex items-center justify-between gap-2 mt-auto">
                    <span className="text-4xl font-bold">{card.amount}</span>
                    <div className="text-2xl border border-[#ABD2C7] bg-[#F4FFFC] text-green rounded-md p-2">
                      {card.icon()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Filter Bar */}
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Programs
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {totalPrograms}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full lg:w-auto justify-end flex-wrap">
          {/* Status filter */}
          <Select
            value={statusFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setStatusFilter(v === "__all__" ? "" : v);
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

          {/* Category filter */}
          <Select
            value={categoryFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setCategoryFilter(v === "__all__" ? "" : v);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Categories</SelectItem>
              {categoryList.map((cat: string) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <SearchForm
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full sm:w-auto md:min-w-[280px]"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
          />

          {/* Create button */}
          <Button variant="primary" size="medium" onClick={openCreate}>
            <PlusIcon className="w-4 h-4 mr-1" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Programs Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin text-green" />
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <LayoutListIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No programs found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            No programs match the selected filters. Try adjusting your search or create a
            new program.
          </p>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={programs}
          totalPages={totalPages}
          page={page}
          setPage={(p) => setPage(p)}
        />
      )}

      {/* ── Create / Edit Program Dialog ──────────────────────────────────── */}
      <Dialog
        open={modal?.type === "create" || modal?.type === "edit"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal?.type === "create" ? "Create New Program" : "Edit Program"}
            </DialogTitle>
            <DialogDescription>
              {modal?.type === "create"
                ? "Fill in the details below to create a new program."
                : "Update the program details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Program Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter program name"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the program..."
                rows={3}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <input
                  type="date"
                  value={form.endDate || ""}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Application Deadline */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Application Deadline
                </label>
                <input
                  type="date"
                  value={form.applicationDeadline}
                  onChange={(e) =>
                    setForm({ ...form, applicationDeadline: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
                />
              </div>

              {/* Max Participants */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={form.maxParticipants || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      maxParticipants: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  min={0}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
                />
              </div>
            </div>

            {/* Objectives */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Objectives (comma-separated)
              </label>
              <textarea
                value={form.objectives.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    objectives: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. Increase revenue, Expand market reach"
                rows={2}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
              />
            </div>

            {/* Industry Focus */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Industry Focus (comma-separated)
              </label>
              <input
                type="text"
                value={form.industryFocus.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    industryFocus: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. Agriculture, Technology"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            {/* Eligible Countries */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Eligible Countries (comma-separated)
              </label>
              <input
                type="text"
                value={form.eligibleCountries.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    eligibleCountries: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. Nigeria, Kenya, Ghana"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            {/* Support Types */}
            <div>
              <label className="text-sm font-medium mb-1 block">
                Support Types (comma-separated)
              </label>
              <input
                type="text"
                value={form.supportTypes.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    supportTypes: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="e.g. Mentorship, Funding, Training"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="small" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSubmitForm}
                state={isFormPending ? "loading" : "default"}
              >
                {modal?.type === "create" ? "Create Program" : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Program Detail Dialog ─────────────────────────────────────────── */}
      <Dialog
        open={modal?.type === "detail"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {programDetail?.name || "Program Details"}
              {programDetail?.status && (
                <Badge
                  variant="status"
                  className={cn("capitalize", getStatusClass(programDetail.status))}
                >
                  {formatStatus(programDetail.status)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoadingProgram ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="w-6 h-6 animate-spin text-green" />
            </div>
          ) : programDetail ? (
            <div className="space-y-6 py-2">
              {/* Description */}
              {programDetail.description && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Description
                  </h4>
                  <p className="text-sm">{programDetail.description}</p>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Duration
                  </h4>
                  <p className="text-sm">
                    {programDetail.startDate
                      ? format(new Date(programDetail.startDate), "MMM d, yyyy")
                      : "—"}{" "}
                    &ndash;{" "}
                    {programDetail.endDate
                      ? format(new Date(programDetail.endDate), "MMM d, yyyy")
                      : "Ongoing"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Max Participants
                  </h4>
                  <p className="text-sm">{programDetail.maxParticipants || "—"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Application Deadline
                  </h4>
                  <p className="text-sm">
                    {programDetail.applicationDeadline
                      ? format(
                          new Date(programDetail.applicationDeadline),
                          "MMM d, yyyy",
                        )
                      : "—"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Industry Focus
                  </h4>
                  <p className="text-sm">
                    {programDetail.industryFocus?.join(", ") || "—"}
                  </p>
                </div>
              </div>

              {/* Eligibility */}
              {programDetail.eligibleCountries?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Eligible Countries
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {programDetail.eligibleCountries.map((c: string) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Objectives */}
              {programDetail.objectives?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    Objectives
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {programDetail.objectives.map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Application statistics */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  Application Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Total",
                      value: programDetail.applications?.total || 0,
                      color: "bg-blue-50 text-blue-700",
                    },
                    {
                      label: "Accepted",
                      value: programDetail.applications?.accepted || 0,
                      color: "bg-green-50 text-green-700",
                    },
                    {
                      label: "Rejected",
                      value: programDetail.applications?.rejected || 0,
                      color: "bg-red-50 text-red-700",
                    },
                    {
                      label: "Pending",
                      value: programDetail.applications?.pending || 0,
                      color: "bg-yellow-50 text-yellow-700",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={cn(
                        "rounded-lg px-3 py-2 text-center",
                        stat.color,
                      )}
                    >
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs font-medium">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {programDetail.status?.toLowerCase() !== "active" && (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleStatusChange("activate")}
                    state={statusMutation.isPending ? "loading" : "default"}
                  >
                    Activate
                  </Button>
                )}
                {programDetail.status?.toLowerCase() === "active" && (
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleStatusChange("close")}
                    state={statusMutation.isPending ? "loading" : "default"}
                  >
                    Close Program
                  </Button>
                )}
                {programDetail.status?.toLowerCase() !== "draft" && (
                  <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => handleStatusChange("draft")}
                    state={statusMutation.isPending ? "loading" : "default"}
                  >
                    Move to Draft
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    openApplications(programDetail._id || programDetail.id)
                  }
                >
                  <UsersIcon className="w-4 h-4 mr-1" />
                  View Applications
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    setModal(null);
                    setTimeout(() => openEdit(programDetail), 150);
                  }}
                >
                  <PencilIcon className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Program not found.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Applications Dialog ───────────────────────────────────────────── */}
      <Dialog
        open={modal?.type === "applications"}
        onOpenChange={(open) => !open && setModal(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              Applications
              {programDetail?.name && (
                <span className="text-muted-foreground font-normal">
                  &mdash; {programDetail.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {isLoadingApplications ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="w-6 h-6 animate-spin text-green" />
            </div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-semibold mb-1">No applications yet</p>
              <p className="text-sm text-muted-foreground">
                No one has applied to this program yet.
              </p>
            </div>
          ) : (
            <ReusableTable
              columns={applicationColumns}
              data={applications}
              noDataText="No applications found for this program"
              noDataCaption="No applications yet"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Review Application Dialog ─────────────────────────────────────── */}
      <Dialog
        open={modal?.type === "review"}
        onOpenChange={(open) => {
          if (!open && modal?.type === "review") {
            setModal({ type: "applications", programId: modal.programId });
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Approve or reject this application. Optionally add review notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={3}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="danger"
                size="small"
                onClick={() => handleReview("reject")}
                state={reviewMutation.isPending ? "loading" : "default"}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => handleReview("accept")}
                state={reviewMutation.isPending ? "loading" : "default"}
              >
                Approve
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
