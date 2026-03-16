"use client";

import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchForm } from "@/components/search-form";
import { ReusableTable } from "@/components/ui/table";
import {
  CreateComplianceForm,
  useCompliance,
  useGetComplianceCases,
} from "@/hooks/useCompliance";
import { useDocument } from "@/hooks/useDocument";
import { complianceAttachment } from "@/lib/uitils/types";
import {
  useAfricanCountries,
  useProductCategories,
} from "@/hooks/useComplianceCatalogs";
import InlineAgentCTA from "@/components/ui/inline-agent-cta";
import { cn } from "@/lib/utils";
import {
  Loader,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertTriangleIcon,
  FileTextIcon,
  UploadIcon,
  DownloadIcon,
  EyeIcon,
  MoreHorizontalIcon,
  CalendarIcon,
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FilterIcon,
  HistoryIcon,
  MessageSquareIcon,
  File,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabKey = "overview" | "cases" | "documents" | "audit";

type CaseStatus = "compliant" | "non_compliant" | "pending" | "under_review";
type CasePriority = "high" | "medium" | "low";
type DocumentStatus = "approved" | "pending" | "rejected";

interface ComplianceCase {
  id: string;
  title: string;
  category: string;
  status: CaseStatus;
  priority: CasePriority;
  assignedReviewer: string;
  dueDate: string;
  createdAt: string;
  description: string;
  country: string;
  productCategory: string;
  attachments: { name: string; url: string; type: string }[];
  comments: { author: string; text: string; date: string }[];
  statusHistory: { status: string; date: string; actor: string }[];
}

interface ComplianceDocument {
  id: string;
  name: string;
  status: DocumentStatus;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  mimeType: string;
  version: number;
  versions: { version: number; date: string; uploadedBy: string }[];
}

interface AuditEvent {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: string;
  caseId?: string;
  category: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "cases", label: "My Cases" },
  { key: "documents", label: "Documents" },
  { key: "audit", label: "Audit Trail" },
];

const STATUS_COLORS: Record<CaseStatus, string> = {
  compliant: "bg-green-100 text-green-800",
  non_compliant: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
};

const STATUS_LABELS: Record<CaseStatus, string> = {
  compliant: "Compliant",
  non_compliant: "Non-Compliant",
  pending: "Pending",
  under_review: "Under Review",
};

const PRIORITY_COLORS: Record<CasePriority, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const DOC_STATUS_COLORS: Record<DocumentStatus, string> = {
  approved: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  rejected: "bg-red-100 text-red-800",
};

// ---------------------------------------------------------------------------
// Mock Data (clearly marked — replace with API data when available)
// ---------------------------------------------------------------------------
const MOCK_CASES: ComplianceCase[] = [
  {
    id: "CC-001",
    title: "Export License - Kenya",
    category: "Trade Compliance",
    status: "compliant",
    priority: "low",
    assignedReviewer: "Sarah Johnson",
    dueDate: "2026-04-15",
    createdAt: "2026-02-10",
    description: "Export license renewal for agricultural products to Kenya.",
    country: "Kenya",
    productCategory: "Agriculture",
    attachments: [{ name: "license.pdf", url: "#", type: "application/pdf" }],
    comments: [
      { author: "Sarah Johnson", text: "All documents verified. Approved.", date: "2026-03-01" },
    ],
    statusHistory: [
      { status: "Submitted", date: "2026-02-10", actor: "User" },
      { status: "Under Review", date: "2026-02-15", actor: "Sarah Johnson" },
      { status: "Compliant", date: "2026-03-01", actor: "Sarah Johnson" },
    ],
  },
  {
    id: "CC-002",
    title: "Product Safety Certification",
    category: "Product Compliance",
    status: "pending",
    priority: "high",
    assignedReviewer: "Michael Obi",
    dueDate: "2026-03-25",
    createdAt: "2026-03-01",
    description: "Safety certification for electronic goods exported to Nigeria.",
    country: "Nigeria",
    productCategory: "Electronics",
    attachments: [],
    comments: [],
    statusHistory: [
      { status: "Submitted", date: "2026-03-01", actor: "User" },
      { status: "Pending Review", date: "2026-03-02", actor: "System" },
    ],
  },
  {
    id: "CC-003",
    title: "Import Tariff Documentation",
    category: "Customs",
    status: "non_compliant",
    priority: "high",
    assignedReviewer: "Amina Diallo",
    dueDate: "2026-03-20",
    createdAt: "2026-02-20",
    description: "Tariff documentation for textile imports from Ghana.",
    country: "Ghana",
    productCategory: "Textiles",
    attachments: [{ name: "tariff_schedule.xlsx", url: "#", type: "application/vnd.ms-excel" }],
    comments: [
      {
        author: "Amina Diallo",
        text: "Missing HS codes for 3 product lines. Please resubmit.",
        date: "2026-03-05",
      },
    ],
    statusHistory: [
      { status: "Submitted", date: "2026-02-20", actor: "User" },
      { status: "Under Review", date: "2026-02-25", actor: "Amina Diallo" },
      { status: "Non-Compliant", date: "2026-03-05", actor: "Amina Diallo" },
    ],
  },
  {
    id: "CC-004",
    title: "Environmental Impact Assessment",
    category: "Environmental",
    status: "under_review",
    priority: "medium",
    assignedReviewer: "David Mensah",
    dueDate: "2026-04-01",
    createdAt: "2026-03-05",
    description: "Environmental compliance review for manufacturing expansion.",
    country: "South Africa",
    productCategory: "Manufacturing",
    attachments: [{ name: "eia_report.pdf", url: "#", type: "application/pdf" }],
    comments: [],
    statusHistory: [
      { status: "Submitted", date: "2026-03-05", actor: "User" },
      { status: "Under Review", date: "2026-03-10", actor: "David Mensah" },
    ],
  },
  {
    id: "CC-005",
    title: "Food Safety Standards - EAC",
    category: "Product Compliance",
    status: "compliant",
    priority: "medium",
    assignedReviewer: "Grace Wanjiku",
    dueDate: "2026-05-01",
    createdAt: "2026-01-15",
    description: "EAC food safety standards compliance for processed goods.",
    country: "Tanzania",
    productCategory: "Food & Beverage",
    attachments: [{ name: "food_cert.pdf", url: "#", type: "application/pdf" }],
    comments: [
      { author: "Grace Wanjiku", text: "Certification valid until 2027.", date: "2026-02-01" },
    ],
    statusHistory: [
      { status: "Submitted", date: "2026-01-15", actor: "User" },
      { status: "Compliant", date: "2026-02-01", actor: "Grace Wanjiku" },
    ],
  },
];

const MOCK_DOCUMENTS: ComplianceDocument[] = [
  {
    id: "DOC-001",
    name: "Business Registration Certificate",
    status: "approved",
    category: "Legal",
    uploadedBy: "User",
    uploadedAt: "2026-01-10",
    size: "2.4 MB",
    mimeType: "application/pdf",
    version: 2,
    versions: [
      { version: 1, date: "2025-12-01", uploadedBy: "User" },
      { version: 2, date: "2026-01-10", uploadedBy: "User" },
    ],
  },
  {
    id: "DOC-002",
    name: "Export License",
    status: "approved",
    category: "Trade",
    uploadedBy: "User",
    uploadedAt: "2026-02-15",
    size: "1.8 MB",
    mimeType: "application/pdf",
    version: 1,
    versions: [{ version: 1, date: "2026-02-15", uploadedBy: "User" }],
  },
  {
    id: "DOC-003",
    name: "Product Safety Report",
    status: "pending",
    category: "Product",
    uploadedBy: "User",
    uploadedAt: "2026-03-01",
    size: "3.1 MB",
    mimeType: "application/pdf",
    version: 1,
    versions: [{ version: 1, date: "2026-03-01", uploadedBy: "User" }],
  },
  {
    id: "DOC-004",
    name: "Environmental Impact Assessment",
    status: "pending",
    category: "Environmental",
    uploadedBy: "User",
    uploadedAt: "2026-03-05",
    size: "5.2 MB",
    mimeType: "application/pdf",
    version: 1,
    versions: [{ version: 1, date: "2026-03-05", uploadedBy: "User" }],
  },
  {
    id: "DOC-005",
    name: "Import Tariff Schedule",
    status: "rejected",
    category: "Customs",
    uploadedBy: "User",
    uploadedAt: "2026-02-20",
    size: "892 KB",
    mimeType: "application/vnd.ms-excel",
    version: 1,
    versions: [{ version: 1, date: "2026-02-20", uploadedBy: "User" }],
  },
];

const MOCK_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "AE-001",
    action: "Case Submitted",
    actor: "User",
    timestamp: "2026-03-10T14:30:00Z",
    details: "New compliance case CC-004 submitted for Environmental Impact Assessment",
    caseId: "CC-004",
    category: "Case",
  },
  {
    id: "AE-002",
    action: "Document Uploaded",
    actor: "User",
    timestamp: "2026-03-05T09:15:00Z",
    details: "Environmental Impact Assessment document uploaded",
    category: "Document",
  },
  {
    id: "AE-003",
    action: "Status Changed",
    actor: "Amina Diallo",
    timestamp: "2026-03-05T11:45:00Z",
    details: "Case CC-003 status changed from Under Review to Non-Compliant",
    caseId: "CC-003",
    category: "Case",
  },
  {
    id: "AE-004",
    action: "Comment Added",
    actor: "Amina Diallo",
    timestamp: "2026-03-05T11:46:00Z",
    details: "Reviewer comment added to case CC-003",
    caseId: "CC-003",
    category: "Comment",
  },
  {
    id: "AE-005",
    action: "Case Approved",
    actor: "Sarah Johnson",
    timestamp: "2026-03-01T16:20:00Z",
    details: "Case CC-001 marked as Compliant",
    caseId: "CC-001",
    category: "Case",
  },
  {
    id: "AE-006",
    action: "Document Approved",
    actor: "System",
    timestamp: "2026-02-28T08:00:00Z",
    details: "Export License document auto-verified and approved",
    category: "Document",
  },
  {
    id: "AE-007",
    action: "Case Submitted",
    actor: "User",
    timestamp: "2026-02-20T10:00:00Z",
    details: "New compliance case CC-003 submitted for Import Tariff Documentation",
    caseId: "CC-003",
    category: "Case",
  },
  {
    id: "AE-008",
    action: "Review Assigned",
    actor: "System",
    timestamp: "2026-02-15T09:00:00Z",
    details: "Case CC-001 assigned to reviewer Sarah Johnson",
    caseId: "CC-001",
    category: "Assignment",
  },
];

// Mock upcoming deadlines
const MOCK_DEADLINES = [
  { id: "DL-1", title: "Import Tariff Documentation", dueDate: "2026-03-20", caseId: "CC-003", priority: "high" as CasePriority },
  { id: "DL-2", title: "Product Safety Certification", dueDate: "2026-03-25", caseId: "CC-002", priority: "high" as CasePriority },
  { id: "DL-3", title: "Environmental Impact Assessment", dueDate: "2026-04-01", caseId: "CC-004", priority: "medium" as CasePriority },
  { id: "DL-4", title: "Export License - Kenya", dueDate: "2026-04-15", caseId: "CC-001", priority: "low" as CasePriority },
];

// Mock category breakdown for overview
const MOCK_CATEGORIES = [
  { name: "Trade Compliance", score: 85, total: 100, cases: 2 },
  { name: "Product Compliance", score: 60, total: 100, cases: 2 },
  { name: "Customs", score: 30, total: 100, cases: 1 },
  { name: "Environmental", score: 50, total: 100, cases: 1 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ProgressBar({ value, color = "bg-[#008060]" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className={cn("h-2 rounded-full transition-all duration-500", color)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

function ComplianceScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const getColor = (s: number) => {
    if (s >= 80) return "#008060";
    if (s >= 60) return "#f59e0b";
    if (s >= 40) return "#f97316";
    return "#ef4444";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 70 70)"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-[#18181B]">{score}%</span>
        <span className="text-xs text-gray-500">Compliance</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function CompliancePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [files, setFiles] = useState<complianceAttachment[]>([]);

  // Hooks
  const { createCompliance, refreshCompliance } = useCompliance();
  const { data: complianceCases } = useGetComplianceCases();
  const { useUploadDocument } = useDocument();
  const uploadDocument = useUploadDocument();
  const {
    data: countries = [],
    isLoading: countriesLoading,
    isError: countriesError,
  } = useAfricanCountries();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useProductCategories();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateComplianceForm>();

  // Use mock data; real data from complianceCases would be mapped here
  const cases = MOCK_CASES;
  const documents = MOCK_DOCUMENTS;
  const auditEvents = MOCK_AUDIT_EVENTS;

  // KPI calculations from mock data
  const kpiData = useMemo(() => {
    const total = cases.length;
    const pending = cases.filter((c) => c.status === "pending" || c.status === "under_review").length;
    const compliant = cases.filter((c) => c.status === "compliant").length;
    const nonCompliant = cases.filter((c) => c.status === "non_compliant").length;
    return { total, pending, compliant, nonCompliant };
  }, [cases]);

  const overallScore = useMemo(() => {
    if (cases.length === 0) return 0;
    const compliant = cases.filter((c) => c.status === "compliant").length;
    return Math.round((compliant / cases.length) * 100);
  }, [cases]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    let result = [...cases];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(lower) ||
          c.category.toLowerCase().includes(lower) ||
          c.id.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((c) => c.category === categoryFilter);
    }
    return result;
  }, [cases, searchTerm, statusFilter, categoryFilter]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    let result = [...documents];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(lower) || d.category.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }
    return result;
  }, [documents, searchTerm, statusFilter]);

  // Submit handler
  const onSubmit = (data: CreateComplianceForm) => {
    if (createCompliance?.data?.data?.data?.case?._id) {
      refreshCompliance
        .mutateAsync(createCompliance?.data?.data?.data?.case?._id)
        .then(() => {
          toast.success("Compliance refreshed successfully");
        });
    } else {
      createCompliance.mutateAsync(data).then(() => {
        toast.success("Compliance submitted successfully");
        setShowNewCaseForm(false);
      });
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file && file.size > 2000000) {
      toast.error("File size must be less than 2MB");
      return;
    }
    if (file) {
      setFileUploadLoading(true);
      uploadDocument.mutateAsync(
        {
          file: e.target.files[0],
          fileName: getValues("imageDocumentId") || file.name,
          category: "compliance",
        },
        {
          onSuccess: (res) => {
            setFiles([
              {
                fileName: res?.originalName,
                fileUrl: `${process.env.NEXT_PUBLIC_API_URL}/documents/${res?._id}/download`,
                fileSize: res?.size,
                mimeType: res?.mimeType,
              },
            ]);
            setValue("imageDocumentId", res?._id);
            setFileUploadLoading(false);
          },
          onError(error: any) {
            toast.error(error?.response?.data?.message);
            setFileUploadLoading(false);
          },
        }
      );
    }
  };

  const openCaseDetail = (c: ComplianceCase) => {
    setSelectedCase(c);
    setCaseDialogOpen(true);
  };

  const result = createCompliance?.data?.data?.data;

  // Case table columns
  const caseColumns = [
    {
      header: "Case ID",
      accessor: (row: ComplianceCase) => (
        <span className="font-medium text-[#008060]">{row.id}</span>
      ),
    },
    {
      header: "Title",
      accessor: (row: ComplianceCase) => (
        <div>
          <p className="font-medium text-sm text-[#18181B]">{row.title}</p>
          <p className="text-xs text-gray-500">{row.category}</p>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: ComplianceCase) => (
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", STATUS_COLORS[row.status])}>
          {STATUS_LABELS[row.status]}
        </span>
      ),
    },
    {
      header: "Priority",
      accessor: (row: ComplianceCase) => (
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium capitalize", PRIORITY_COLORS[row.priority])}>
          {row.priority}
        </span>
      ),
    },
    {
      header: "Reviewer",
      accessor: (row: ComplianceCase) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#F4FFFC] flex items-center justify-center">
            <UserIcon className="w-3 h-3 text-[#008060]" />
          </div>
          <span className="text-sm">{row.assignedReviewer}</span>
        </div>
      ),
    },
    {
      header: "Due Date",
      accessor: (row: ComplianceCase) => (
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm">{format(new Date(row.dueDate), "MMM dd, yyyy")}</span>
        </div>
      ),
    },
    {
      header: "",
      accessor: (row: ComplianceCase) => (
        <Button variant="ghost" size="small" onClick={() => openCaseDetail(row)}>
          <EyeIcon className="w-4 h-4" />
        </Button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-gray-50/50">
      {/* AI Regulatory Check Agent */}
      <InlineAgentCTA
        agentName="regulatory_check"
        title="Regulatory Check Agent"
        description="Let AI check your regulatory requirements and identify compliance gaps automatically."
        segment="smb_formation"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Cases</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.total}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpIcon className="w-3.5 h-3.5 text-[#008060]" />
            <span className="text-xs text-[#008060] font-medium">+2 this month</span>
          </div>
        </Card>

        {/* Pending Review */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Review</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.pending}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowDownIcon className="w-3.5 h-3.5 text-[#008060]" />
            <span className="text-xs text-[#008060] font-medium">-1 from last week</span>
          </div>
        </Card>

        {/* Compliant */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Compliant</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.compliant}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2Icon className="w-5 h-5 text-[#008060]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpIcon className="w-3.5 h-3.5 text-[#008060]" />
            <span className="text-xs text-[#008060] font-medium">+1 this month</span>
          </div>
        </Card>

        {/* Non-Compliant */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Non-Compliant</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.nonCompliant}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <AlertTriangleIcon className="w-3.5 h-3.5 text-red-500" />
            <span className="text-xs text-red-500 font-medium">Needs attention</span>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearchTerm("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
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
        <div className="flex-1" />
        <Button variant="primary" size="small" onClick={() => setShowNewCaseForm(true)}>
          + New Case
        </Button>
      </div>

      {/* ========================= OVERVIEW TAB ========================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compliance Score Gauge */}
          <Card className="p-6">
            <h3 className="font-semibold text-base text-[#18181B] mb-4">Compliance Score</h3>
            <div className="flex justify-center mb-4">
              <ComplianceScoreGauge score={overallScore} />
            </div>
            <p className="text-center text-sm text-gray-500">
              {overallScore >= 80
                ? "Excellent compliance standing"
                : overallScore >= 60
                  ? "Good progress, some areas need attention"
                  : "Significant improvements needed"}
            </p>
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6">
            <h3 className="font-semibold text-base text-[#18181B] mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {MOCK_CATEGORIES.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-[#18181B]">{cat.name}</span>
                    <span className="text-sm font-bold text-[#18181B]">{cat.score}%</span>
                  </div>
                  <ProgressBar
                    value={cat.score}
                    color={
                      cat.score >= 80
                        ? "bg-[#008060]"
                        : cat.score >= 60
                          ? "bg-yellow-500"
                          : cat.score >= 40
                            ? "bg-orange-500"
                            : "bg-red-500"
                    }
                  />
                  <p className="text-xs text-gray-400 mt-0.5">{cat.cases} case(s)</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-6">
            <h3 className="font-semibold text-base text-[#18181B] mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {MOCK_DEADLINES.map((dl) => {
                const daysLeft = Math.ceil(
                  (new Date(dl.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={dl.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          dl.priority === "high"
                            ? "bg-red-500"
                            : dl.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#18181B]">{dl.title}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(dl.dueDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        daysLeft <= 7
                          ? "bg-red-100 text-red-700"
                          : daysLeft <= 14
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      )}
                    >
                      {daysLeft > 0 ? `${daysLeft}d left` : "Overdue"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ========================= MY CASES TAB ========================= */}
      {activeTab === "cases" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <SearchForm
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Trade Compliance">Trade Compliance</SelectItem>
                  <SelectItem value="Product Compliance">Product Compliance</SelectItem>
                  <SelectItem value="Customs">Customs</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Cases Table */}
          <Card>
            <ReusableTable columns={caseColumns} data={filteredCases} />
          </Card>
        </div>
      )}

      {/* ========================= DOCUMENTS TAB ========================= */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          {/* Upload Area */}
          <Card className="p-6">
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-[#008060] transition-colors">
              <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-[#18181B]">Upload Compliance Documents</p>
              <p className="text-xs text-gray-400 mt-1">Drag and drop or click to upload. Max 2MB per file.</p>
              <label htmlFor="doc-upload" className="cursor-pointer">
                <Button variant="secondary" size="small" className="mt-3">
                  Choose Files
                </Button>
                <input
                  id="doc-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={fileUploadLoading}
                />
              </label>
              {fileUploadLoading && (
                <div className="flex items-center justify-center mt-2">
                  <Loader className="animate-spin w-5 h-5 text-[#008060]" />
                  <span className="ml-2 text-sm text-gray-500">Uploading...</span>
                </div>
              )}
            </div>
          </Card>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <SearchForm
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <Card key={doc.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F4FFFC] flex items-center justify-center">
                      <FileTextIcon className="w-5 h-5 text-[#008060]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#18181B] line-clamp-1">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.category}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                      DOC_STATUS_COLORS[doc.status]
                    )}
                  >
                    {doc.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Uploaded</span>
                    <span>{format(new Date(doc.uploadedAt), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size</span>
                    <span>{doc.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version</span>
                    <span>v{doc.version}</span>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <button className="text-xs text-gray-400 hover:text-[#008060] flex items-center gap-1">
                    <HistoryIcon className="w-3 h-3" />
                    {doc.versions.length} version(s)
                  </button>
                  <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-[#008060]">
                      <EyeIcon className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-[#008060]">
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================= AUDIT TRAIL TAB ========================= */}
      {activeTab === "audit" && (
        <Card className="p-6">
          <h3 className="font-semibold text-base text-[#18181B] mb-6">Compliance Audit Trail</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {auditEvents.map((event, idx) => {
                const iconMap: Record<string, React.ReactNode> = {
                  Case: <ShieldCheckIcon className="w-3.5 h-3.5 text-blue-600" />,
                  Document: <FileTextIcon className="w-3.5 h-3.5 text-[#008060]" />,
                  Comment: <MessageSquareIcon className="w-3.5 h-3.5 text-purple-600" />,
                  Assignment: <UserIcon className="w-3.5 h-3.5 text-orange-600" />,
                };
                const bgMap: Record<string, string> = {
                  Case: "bg-blue-50",
                  Document: "bg-green-50",
                  Comment: "bg-purple-50",
                  Assignment: "bg-orange-50",
                };
                return (
                  <div key={event.id} className="relative flex items-start gap-4 pl-10">
                    <div
                      className={cn(
                        "absolute left-2 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white",
                        bgMap[event.category] || "bg-gray-50"
                      )}
                    >
                      {iconMap[event.category] || <HistoryIcon className="w-3 h-3 text-gray-500" />}
                    </div>
                    <div className="flex-1 bg-white border border-gray-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[#18181B]">{event.action}</p>
                        <span className="text-xs text-gray-400">
                          {format(new Date(event.timestamp), "MMM dd, yyyy HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.details}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">by</span>
                        <span className="text-xs font-medium text-[#18181B]">{event.actor}</span>
                        {event.caseId && (
                          <span className="text-xs text-[#008060] font-medium ml-2">
                            {event.caseId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* ========================= CASE DETAIL DIALOG ========================= */}
      <Dialog open={caseDialogOpen} onOpenChange={setCaseDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedCase?.title}</span>
              {selectedCase && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    STATUS_COLORS[selectedCase.status]
                  )}
                >
                  {STATUS_LABELS[selectedCase.status]}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Case {selectedCase?.id} - {selectedCase?.category}
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6 mt-4">
              {/* Case Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Country</p>
                  <p className="text-sm font-medium">{selectedCase.country}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Product Category</p>
                  <p className="text-sm font-medium">{selectedCase.productCategory}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Priority</p>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium capitalize inline-block",
                      PRIORITY_COLORS[selectedCase.priority]
                    )}
                  >
                    {selectedCase.priority}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Assigned Reviewer</p>
                  <p className="text-sm font-medium">{selectedCase.assignedReviewer}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedCase.dueDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedCase.createdAt), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedCase.description}</p>
              </div>

              {/* Document Attachments */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-2">Attachments</h4>
                {selectedCase.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCase.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <FileTextIcon className="w-4 h-4 text-[#008060]" />
                          <span className="text-sm">{att.name}</span>
                        </div>
                        <button className="text-gray-400 hover:text-[#008060]">
                          <DownloadIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No attachments</p>
                )}
              </div>

              {/* Reviewer Comments */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-2">Reviewer Comments</h4>
                {selectedCase.comments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCase.comments.map((comment, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{comment.author}</span>
                          <span className="text-xs text-gray-400">
                            {format(new Date(comment.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No comments yet</p>
                )}
              </div>

              {/* Status History */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-2">Status History</h4>
                <div className="space-y-2">
                  {selectedCase.statusHistory.map((sh, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#008060]" />
                      <span className="text-sm font-medium w-32">{sh.status}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(sh.date), "MMM dd, yyyy")}
                      </span>
                      <span className="text-xs text-gray-500">by {sh.actor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                {selectedCase.status === "non_compliant" && (
                  <Button variant="secondary" size="small">
                    Appeal
                  </Button>
                )}
                {(selectedCase.status === "pending" || selectedCase.status === "non_compliant") && (
                  <Button variant="secondary" size="small">
                    Request Review
                  </Button>
                )}
                <Button variant="primary" size="small">
                  Submit Update
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================= NEW CASE DIALOG ========================= */}
      <Dialog open={showNewCaseForm} onOpenChange={setShowNewCaseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit New Compliance Case</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new compliance case for review.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Select Country</Label>
                <Select
                  onValueChange={(val) => setValue("country", val)}
                  disabled={countriesLoading || (!!countriesError && countries.length === 0)}
                >
                  <SelectTrigger id="country">
                    <SelectValue
                      placeholder={
                        countriesLoading
                          ? "Loading countries..."
                          : countriesError
                            ? "Failed to load countries"
                            : "Select Country"
                      }
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <span className="text-[10px] text-red-500">{errors.country.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="productCategory">Product Category</Label>
                <Select
                  onValueChange={(val) => setValue("productCategory", val)}
                  disabled={categoriesLoading || (!!categoriesError && categories.length === 0)}
                >
                  <SelectTrigger id="productCategory">
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : categoriesError
                            ? "Failed to load categories"
                            : "Select Category"
                      }
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productCategory && (
                  <span className="text-[10px] text-red-500">
                    {errors.productCategory.message}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                {...register("description", { required: "Description is required" })}
                id="description"
                placeholder="Describe your product and compliance requirements..."
                className="min-h-[100px]"
              />
              {errors.description && (
                <span className="text-[10px] text-red-500">{errors.description.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label>Upload Documents (Optional)</Label>
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="new-case-upload"
                  className="flex flex-col items-center justify-center w-full min-h-20 border-2 border-dashed border-gray-200 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg"
                >
                  <div className="flex flex-col items-center justify-center py-4">
                    {!fileUploadLoading ? (
                      <>
                        <CIcons.documentUpload />
                        <p className="text-sm text-[#52575C] mt-1">Click to add files</p>
                        <p className="text-xs text-gray-400 mt-1">Max file size: 2MB each</p>
                      </>
                    ) : (
                      <Loader className="animate-spin h-8 w-8" />
                    )}
                  </div>
                  <input
                    disabled={fileUploadLoading}
                    name="imageDocumentId"
                    onChange={handleFileUpload}
                    id="new-case-upload"
                    type="file"
                    className="hidden"
                  />
                  {files?.map((items, i) => (
                    <div key={i} className="mx-auto w-full items-start text-[#008060] text-xs px-4 pb-2">
                      {items.fileName}
                    </div>
                  ))}
                </Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="small"
                onClick={() => setShowNewCaseForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCompliance.isPending || fileUploadLoading}
                state={createCompliance.isPending ? "loading" : undefined}
                size="small"
              >
                Submit Case
              </Button>
            </div>
          </form>

          {/* Compliance Result */}
          {result?.case && (
            <div className="mt-4 p-4 bg-[#F4FFFC] rounded-lg space-y-3">
              <h4 className="font-semibold text-sm">Compliance Result</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className="capitalize">
                  {result?.case?.status?.replace("_", " ")}
                </Badge>
              </div>
              {result?.requirements?.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Suggested Improvements</p>
                  <div className="space-y-2">
                    {result?.requirements?.map((requirement: any) => (
                      <div
                        key={requirement._id}
                        className="p-3 bg-white rounded-lg border border-gray-100"
                      >
                        <span className="font-medium text-sm">{requirement.name}</span>
                        <p className="text-xs text-gray-500 mt-1">{requirement.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CompliancePage;
