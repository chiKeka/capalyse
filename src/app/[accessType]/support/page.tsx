"use client";

import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchForm } from "@/components/search-form";
import { ReusableTable } from "@/components/ui/table";
import useDocument from "@/hooks/useDocument";
import { useGetSupport, useSupports } from "@/hooks/useSupport";
import { CreateSupportForm } from "@/lib/uitils/types";
import { cn } from "@/lib/utils";
import {
  Loader,
  TicketIcon,
  ClockIcon,
  CheckCircle2Icon,
  SmileIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MessageSquareIcon,
  SearchIcon,
  PhoneIcon,
  MailIcon,
  SendIcon,
  PaperclipIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  HeadphonesIcon,
  StarIcon,
  UserIcon,
  FileTextIcon,
  UploadIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TabKey = "tickets" | "knowledge" | "contact";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "critical" | "high" | "medium" | "low";
type TicketCategory = "technical" | "billing" | "account" | "feature_request" | "other";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  assignedAgent: string;
  messages: TicketMessage[];
  attachments: { name: string; url: string }[];
  statusTimeline: { status: string; date: string; actor: string }[];
}

interface TicketMessage {
  id: string;
  sender: string;
  senderType: "user" | "agent" | "system";
  message: string;
  timestamp: string;
  attachments?: { name: string; url: string }[];
}

interface KBArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  views: number;
  helpful: number;
  createdAt: string;
}

interface KBCategory {
  id: string;
  name: string;
  icon: string;
  articleCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const TABS: { key: TabKey; label: string }[] = [
  { key: "tickets", label: "My Tickets" },
  { key: "knowledge", label: "Knowledge Base" },
  { key: "contact", label: "Contact Support" },
];

const STATUS_COLORS: Record<TicketStatus, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_COLORS: Record<TicketPriority, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: "Technical Issue",
  billing: "Billing Inquiry",
  account: "Account",
  feature_request: "Feature Request",
  other: "Other",
};

// ---------------------------------------------------------------------------
// Mock Data (clearly marked — replace with API data when available)
// ---------------------------------------------------------------------------
const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TKT-001",
    subject: "Cannot access compliance dashboard",
    description: "I am unable to load the compliance dashboard. It shows a blank page after login.",
    status: "in_progress",
    priority: "high",
    category: "technical",
    createdAt: "2026-03-12T10:30:00Z",
    updatedAt: "2026-03-14T15:00:00Z",
    slaDeadline: "2026-03-15T10:30:00Z",
    assignedAgent: "Support Team A",
    messages: [
      {
        id: "MSG-001",
        sender: "You",
        senderType: "user",
        message: "I am unable to load the compliance dashboard. It shows a blank page after login. I have tried clearing my cache and using a different browser.",
        timestamp: "2026-03-12T10:30:00Z",
      },
      {
        id: "MSG-002",
        sender: "Support Team A",
        senderType: "agent",
        message: "Thank you for reporting this issue. We have identified a caching problem on our end. Our engineering team is working on a fix. In the meantime, please try accessing the page in incognito mode.",
        timestamp: "2026-03-12T14:15:00Z",
      },
      {
        id: "MSG-003",
        sender: "You",
        senderType: "user",
        message: "Incognito mode works, thank you! When will the main fix be deployed?",
        timestamp: "2026-03-13T09:00:00Z",
      },
      {
        id: "MSG-004",
        sender: "Support Team A",
        senderType: "agent",
        message: "The fix is scheduled for deployment today. You should be able to access the dashboard normally by end of day.",
        timestamp: "2026-03-14T15:00:00Z",
      },
    ],
    attachments: [{ name: "screenshot.png", url: "#" }],
    statusTimeline: [
      { status: "Created", date: "2026-03-12T10:30:00Z", actor: "You" },
      { status: "Assigned", date: "2026-03-12T10:35:00Z", actor: "System" },
      { status: "In Progress", date: "2026-03-12T14:15:00Z", actor: "Support Team A" },
    ],
  },
  {
    id: "TKT-002",
    subject: "Billing discrepancy on March invoice",
    description: "The March invoice shows a charge that I did not authorize.",
    status: "open",
    priority: "medium",
    category: "billing",
    createdAt: "2026-03-14T08:00:00Z",
    updatedAt: "2026-03-14T08:00:00Z",
    slaDeadline: "2026-03-17T08:00:00Z",
    assignedAgent: "Billing Team",
    messages: [
      {
        id: "MSG-005",
        sender: "You",
        senderType: "user",
        message: "The March invoice shows a charge of $450 for 'Premium Features' that I did not authorize. Please investigate.",
        timestamp: "2026-03-14T08:00:00Z",
      },
    ],
    attachments: [{ name: "invoice_march.pdf", url: "#" }],
    statusTimeline: [
      { status: "Created", date: "2026-03-14T08:00:00Z", actor: "You" },
      { status: "Assigned", date: "2026-03-14T08:05:00Z", actor: "System" },
    ],
  },
  {
    id: "TKT-003",
    subject: "Request: Dark mode support",
    description: "Would like to request dark mode for the platform.",
    status: "closed",
    priority: "low",
    category: "feature_request",
    createdAt: "2026-02-20T11:00:00Z",
    updatedAt: "2026-03-01T09:00:00Z",
    slaDeadline: "2026-02-27T11:00:00Z",
    assignedAgent: "Product Team",
    messages: [
      {
        id: "MSG-006",
        sender: "You",
        senderType: "user",
        message: "I would love to have a dark mode option for the platform. It would help reduce eye strain during late working hours.",
        timestamp: "2026-02-20T11:00:00Z",
      },
      {
        id: "MSG-007",
        sender: "Product Team",
        senderType: "agent",
        message: "Thank you for your suggestion! Dark mode is already on our roadmap and is planned for Q2 2026. We will keep this ticket updated with progress.",
        timestamp: "2026-02-21T10:00:00Z",
      },
    ],
    attachments: [],
    statusTimeline: [
      { status: "Created", date: "2026-02-20T11:00:00Z", actor: "You" },
      { status: "Assigned", date: "2026-02-20T11:05:00Z", actor: "System" },
      { status: "Closed", date: "2026-03-01T09:00:00Z", actor: "Product Team" },
    ],
  },
  {
    id: "TKT-004",
    subject: "Export function not working",
    description: "PDF export generates an empty file.",
    status: "resolved",
    priority: "critical",
    category: "technical",
    createdAt: "2026-03-10T16:00:00Z",
    updatedAt: "2026-03-11T12:00:00Z",
    slaDeadline: "2026-03-11T04:00:00Z",
    assignedAgent: "Support Team B",
    messages: [
      {
        id: "MSG-008",
        sender: "You",
        senderType: "user",
        message: "When I try to export my readiness report as PDF, the file downloads but is empty (0 bytes).",
        timestamp: "2026-03-10T16:00:00Z",
      },
      {
        id: "MSG-009",
        sender: "Support Team B",
        senderType: "agent",
        message: "We have identified and fixed the export issue. Please try again and let us know if it works.",
        timestamp: "2026-03-11T12:00:00Z",
      },
      {
        id: "MSG-010",
        sender: "You",
        senderType: "user",
        message: "It works now, thank you for the quick fix!",
        timestamp: "2026-03-11T14:00:00Z",
      },
    ],
    attachments: [],
    statusTimeline: [
      { status: "Created", date: "2026-03-10T16:00:00Z", actor: "You" },
      { status: "Assigned", date: "2026-03-10T16:05:00Z", actor: "System" },
      { status: "In Progress", date: "2026-03-10T17:00:00Z", actor: "Support Team B" },
      { status: "Resolved", date: "2026-03-11T12:00:00Z", actor: "Support Team B" },
    ],
  },
];

const MOCK_KB_CATEGORIES: KBCategory[] = [
  { id: "cat-1", name: "Getting Started", icon: "rocket", articleCount: 12 },
  { id: "cat-2", name: "Compliance", icon: "shield", articleCount: 8 },
  { id: "cat-3", name: "Billing & Payments", icon: "wallet", articleCount: 6 },
  { id: "cat-4", name: "Account Management", icon: "user", articleCount: 10 },
  { id: "cat-5", name: "Technical Issues", icon: "wrench", articleCount: 15 },
  { id: "cat-6", name: "API & Integrations", icon: "code", articleCount: 5 },
];

const MOCK_KB_ARTICLES: KBArticle[] = [
  {
    id: "KB-001",
    title: "How to submit a compliance case",
    category: "Compliance",
    excerpt: "Learn how to create and submit compliance cases for regulatory review across African markets.",
    views: 1240,
    helpful: 89,
    createdAt: "2026-01-15",
  },
  {
    id: "KB-002",
    title: "Understanding your readiness score",
    category: "Getting Started",
    excerpt: "A comprehensive guide to interpreting your investment readiness score and improving it.",
    views: 2100,
    helpful: 156,
    createdAt: "2026-01-10",
  },
  {
    id: "KB-003",
    title: "Exporting reports and documents",
    category: "Technical Issues",
    excerpt: "Step-by-step guide on how to export your data, reports, and compliance documents.",
    views: 890,
    helpful: 67,
    createdAt: "2026-02-01",
  },
  {
    id: "KB-004",
    title: "Managing your subscription and billing",
    category: "Billing & Payments",
    excerpt: "Learn how to view invoices, update payment methods, and manage your subscription plan.",
    views: 750,
    helpful: 52,
    createdAt: "2026-02-10",
  },
  {
    id: "KB-005",
    title: "Setting up two-factor authentication",
    category: "Account Management",
    excerpt: "Enhance your account security by enabling two-factor authentication.",
    views: 560,
    helpful: 41,
    createdAt: "2026-02-20",
  },
  {
    id: "KB-006",
    title: "Connecting with investors through the platform",
    category: "Getting Started",
    excerpt: "How to use the networking features to connect with potential investors and partners.",
    views: 1850,
    helpful: 134,
    createdAt: "2026-01-05",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const SupportPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("tickets");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [kbSearchTerm, setKbSearchTerm] = useState("");
  const [selectedKbCategory, setSelectedKbCategory] = useState("all");
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  // Hooks
  const { createSupport } = useSupports();
  const router = useRouter();
  const { data: supportTicket } = useGetSupport();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateSupportForm>();
  const { useUploadDocument } = useDocument();
  const uploadDocument = useUploadDocument();
  const params = useParams();

  // Use mock data; real data from supportTicket would be merged here
  const tickets = MOCK_TICKETS;

  // KPI calculations
  const kpiData = useMemo(() => {
    const open = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
    const resolvedThisMonth = tickets.filter(
      (t) =>
        t.status === "resolved" &&
        new Date(t.updatedAt).getMonth() === new Date().getMonth()
    ).length;
    return {
      openTickets: open,
      avgResponseTime: "2.4h", // mock
      resolvedThisMonth,
      satisfactionScore: 4.6, // mock
    };
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(lower) ||
          t.id.toLowerCase().includes(lower)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (categoryFilter !== "all") {
      result = result.filter((t) => t.category === categoryFilter);
    }
    return result;
  }, [tickets, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  // Filtered KB articles
  const filteredArticles = useMemo(() => {
    let result = [...MOCK_KB_ARTICLES];
    if (kbSearchTerm) {
      const lower = kbSearchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          a.excerpt.toLowerCase().includes(lower) ||
          a.category.toLowerCase().includes(lower)
      );
    }
    if (selectedKbCategory !== "all") {
      result = result.filter((a) => a.category === selectedKbCategory);
    }
    return result;
  }, [kbSearchTerm, selectedKbCategory]);

  // Popular articles
  const popularArticles = useMemo(() => {
    return [...MOCK_KB_ARTICLES].sort((a, b) => b.views - a.views).slice(0, 3);
  }, []);

  // Submit ticket handler
  const onSubmit = ({ subject, description }: CreateSupportForm) => {
    createSupport
      .mutateAsync({
        subject,
        images: files?.map((file) => file.fileUrl),
        description,
      })
      .then(() => {
        toast.success("Ticket submitted successfully");
        reset();
        setFiles([]);
        setActiveTab("tickets");
      });
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
          fileName: file.name,
          category: "support",
        },
        {
          onSuccess: (res) => {
            setFiles((prev) => [
              ...prev,
              {
                fileName: res?.originalName,
                fileUrl: `${process.env.NEXT_PUBLIC_API_URL}/documents/${res?._id}/download`,
                fileSize: res?.size,
                mimeType: res?.mimeType,
              },
            ]);
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

  const openTicketDetail = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  const getSlaStatus = (deadline: string) => {
    const now = Date.now();
    const dl = new Date(deadline).getTime();
    const hoursLeft = Math.round((dl - now) / (1000 * 60 * 60));
    if (hoursLeft < 0) return { label: "Overdue", color: "text-red-600 bg-red-50" };
    if (hoursLeft < 4) return { label: `${hoursLeft}h left`, color: "text-red-600 bg-red-50" };
    if (hoursLeft < 24) return { label: `${hoursLeft}h left`, color: "text-yellow-600 bg-yellow-50" };
    const daysLeft = Math.round(hoursLeft / 24);
    return { label: `${daysLeft}d left`, color: "text-green-600 bg-green-50" };
  };

  // Ticket table columns
  const ticketColumns = [
    {
      header: "Ticket",
      accessor: (row: SupportTicket) => (
        <div>
          <p className="font-medium text-sm text-[#008060]">{row.id}</p>
          <p className="text-sm text-[#18181B] line-clamp-1">{row.subject}</p>
        </div>
      ),
    },
    {
      header: "Priority",
      accessor: (row: SupportTicket) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium capitalize",
            PRIORITY_COLORS[row.priority]
          )}
        >
          {row.priority}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row: SupportTicket) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            STATUS_COLORS[row.status]
          )}
        >
          {STATUS_LABELS[row.status]}
        </span>
      ),
    },
    {
      header: "Category",
      accessor: (row: SupportTicket) => (
        <span className="text-sm text-gray-600">{CATEGORY_LABELS[row.category]}</span>
      ),
    },
    {
      header: "SLA",
      accessor: (row: SupportTicket) => {
        const sla = getSlaStatus(row.slaDeadline);
        return (
          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", sla.color)}>
            {sla.label}
          </span>
        );
      },
    },
    {
      header: "Agent",
      accessor: (row: SupportTicket) => (
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#F4FFFC] flex items-center justify-center">
            <UserIcon className="w-3 h-3 text-[#008060]" />
          </div>
          <span className="text-xs">{row.assignedAgent}</span>
        </div>
      ),
    },
    {
      header: "Updated",
      accessor: (row: SupportTicket) => (
        <span className="text-xs text-gray-500">
          {format(new Date(row.updatedAt), "MMM dd, HH:mm")}
        </span>
      ),
    },
    {
      header: "",
      accessor: (row: SupportTicket) => (
        <Button variant="ghost" size="small" onClick={() => openTicketDetail(row)}>
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-gray-50/50">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Open Tickets</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.openTickets}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <TicketIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowDownIcon className="w-3.5 h-3.5 text-[#008060]" />
            <span className="text-xs text-[#008060] font-medium">-1 from last week</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Response Time</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.avgResponseTime}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowDownIcon className="w-3.5 h-3.5 text-[#008060]" />
            <span className="text-xs text-[#008060] font-medium">-0.8h improvement</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Resolved This Month</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.resolvedThisMonth}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2Icon className="w-5 h-5 text-[#008060]" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpIcon className="w-3.5 h-3.5 text-[#008060]" />
            <span className="text-xs text-[#008060] font-medium">+2 from last month</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Satisfaction Score</p>
              <p className="text-2xl font-bold text-[#18181B] mt-1">{kpiData.satisfactionScore}/5</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
              <SmileIcon className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <StarIcon
                  key={s}
                  className={cn(
                    "w-3 h-3",
                    s <= Math.round(kpiData.satisfactionScore) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  )}
                />
              ))}
            </div>
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
              setPriorityFilter("all");
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
      </div>

      {/* ========================= MY TICKETS TAB ========================= */}
      {activeTab === "tickets" && (
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
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Tickets Table */}
          <Card>
            <ReusableTable columns={ticketColumns} data={filteredTickets} />
          </Card>
        </div>
      )}

      {/* ========================= KNOWLEDGE BASE TAB ========================= */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          {/* Search */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg text-[#18181B] mb-3">How can we help?</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <SearchForm
                  value={kbSearchTerm}
                  onChange={(e) => setKbSearchTerm(e.target.value)}
                  className="w-full"
                  inputClassName="!min-h-10"
                />
              </div>
            </div>
          </Card>

          {/* FAQ Categories */}
          <div>
            <h3 className="font-semibold text-base text-[#18181B] mb-3">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {MOCK_KB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedKbCategory(selectedKbCategory === cat.name ? "all" : cat.name)
                  }
                  className={cn(
                    "p-4 rounded-lg border text-center transition-all hover:border-[#008060] hover:shadow-sm",
                    selectedKbCategory === cat.name
                      ? "border-[#008060] bg-[#F4FFFC]"
                      : "border-gray-200 bg-white"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-[#F4FFFC] flex items-center justify-center mx-auto mb-2">
                    <BookOpenIcon className="w-4 h-4 text-[#008060]" />
                  </div>
                  <p className="text-xs font-medium text-[#18181B]">{cat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{cat.articleCount} articles</p>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Articles */}
          {!kbSearchTerm && selectedKbCategory === "all" && (
            <div>
              <h3 className="font-semibold text-base text-[#18181B] mb-3">Popular Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {popularArticles.map((article) => (
                  <Card key={article.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F4FFFC] text-[#008060]">
                      {article.category}
                    </span>
                    <h4 className="font-medium text-sm text-[#18181B] mt-2 mb-1">{article.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                      <span>{article.views.toLocaleString()} views</span>
                      <span>{article.helpful} found helpful</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search Results / All Articles */}
          <div>
            <h3 className="font-semibold text-base text-[#18181B] mb-3">
              {kbSearchTerm
                ? `Search Results (${filteredArticles.length})`
                : selectedKbCategory !== "all"
                  ? selectedKbCategory
                  : "All Articles"}
            </h3>
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="p-4 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {article.category}
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-[#18181B]">{article.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{article.excerpt}</p>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 ml-4 shrink-0" />
                  </div>
                </Card>
              ))}
              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <SearchIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No articles found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================= CONTACT SUPPORT TAB ========================= */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Ticket Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h3 className="font-semibold text-lg text-[#18181B] mb-1">Submit a New Ticket</h3>
              <p className="text-sm text-gray-500 mb-6">
                Describe your issue and we will get back to you as soon as possible.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select onValueChange={(val) => setValue("subject", val)}>
                      <SelectTrigger id="subject">
                        <SelectValue
                          placeholder="Select Reason"
                          className="placeholder:text-[#D1D1D1]"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Inquiry</SelectItem>
                        <SelectItem value="account">Service Quality</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.subject && (
                      <span className="text-[10px] text-red-500">{errors.subject.message}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical - System down</SelectItem>
                        <SelectItem value="high">High - Major impact</SelectItem>
                        <SelectItem value="medium">Medium - Minor impact</SelectItem>
                        <SelectItem value="low">Low - Question</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    {...register("description", {
                      required: "Description is required",
                    })}
                    id="description"
                    placeholder="Please describe your issue in detail..."
                    className="min-h-[140px]"
                  />
                  {errors.description && (
                    <span className="text-[10px] text-red-500">{errors.description.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Attachments (Optional)</Label>
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="support-upload"
                      className="flex flex-col items-center justify-center w-full min-h-[80px] border-2 border-dashed border-gray-200 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg"
                    >
                      <div className="flex flex-col items-center justify-center py-3">
                        {!fileUploadLoading ? (
                          <>
                            <UploadIcon className="w-5 h-5 text-gray-400 mb-1" />
                            <p className="text-sm text-gray-500">Click to upload files</p>
                            <p className="text-xs text-gray-400 mt-1">
                              PNG, PDF, DOC, DOCX, JPG (max 2MB)
                            </p>
                          </>
                        ) : (
                          <Loader className="animate-spin h-6 w-6 text-[#008060]" />
                        )}
                      </div>
                      <Input
                        disabled={fileUploadLoading}
                        name="supportFile"
                        onChange={handleFileUpload}
                        id="support-upload"
                        type="file"
                        className="hidden"
                      />
                      {files?.map((items, idx) => (
                        <div key={idx} className="mx-auto w-full items-start text-[#008060] text-xs px-4 pb-2">
                          {items.fileName}
                        </div>
                      ))}
                    </Label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={createSupport.isPending || fileUploadLoading}
                  state={createSupport.isPending ? "loading" : undefined}
                  size="big"
                  className="w-full"
                >
                  Submit Ticket
                </Button>
              </form>
            </Card>
          </div>

          {/* Sidebar — Contact Info & Live Chat Placeholder */}
          <div className="space-y-4">
            {/* Live Chat Placeholder */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#F4FFFC] flex items-center justify-center">
                  <MessageSquareIcon className="w-5 h-5 text-[#008060]" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#18181B]">Live Chat</h4>
                  <p className="text-xs text-gray-500">Available Mon-Fri, 9am-6pm WAT</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <HeadphonesIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">Start a live chat with our support team</p>
                <Button variant="secondary" size="small" className="w-full">
                  Start Chat
                </Button>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="p-6">
              <h4 className="font-semibold text-sm text-[#18181B] mb-4">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <MailIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">support@capalyse.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 text-[#008060]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">+234 800 123 4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <ClockIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Business Hours</p>
                    <p className="text-sm font-medium">Mon - Fri, 9:00 - 18:00 WAT</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6">
              <h4 className="font-semibold text-sm text-[#18181B] mb-3">Quick Links</h4>
              <div className="space-y-2">
                {[
                  "Getting Started Guide",
                  "API Documentation",
                  "Community Forum",
                  "System Status",
                ].map((link) => (
                  <button
                    key={link}
                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-600">{link}</span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================= TICKET DETAIL DIALOG ========================= */}
      <Dialog open={ticketDialogOpen} onOpenChange={setTicketDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span>{selectedTicket?.subject}</span>
              {selectedTicket && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    STATUS_COLORS[selectedTicket.status]
                  )}
                >
                  {STATUS_LABELS[selectedTicket.status]}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              Ticket {selectedTicket?.id} - {selectedTicket && CATEGORY_LABELS[selectedTicket.category]}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6 mt-4">
              {/* Ticket Meta */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Priority</p>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium capitalize inline-block",
                      PRIORITY_COLORS[selectedTicket.priority]
                    )}
                  >
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Assigned Agent</p>
                  <p className="text-sm font-medium">{selectedTicket.assignedAgent}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Created</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedTicket.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">SLA Deadline</p>
                  <p className="text-sm font-medium">
                    {format(new Date(selectedTicket.slaDeadline), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Status Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-3">Status Timeline</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.statusTimeline.map((st, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#008060]" />
                      <span className="text-xs font-medium">{st.status}</span>
                      <span className="text-xs text-gray-400">
                        {format(new Date(st.date), "MMM dd, HH:mm")}
                      </span>
                      {i < selectedTicket.statusTimeline.length - 1 && (
                        <ChevronRightIcon className="w-3 h-3 text-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Message Thread */}
              <div>
                <h4 className="text-sm font-semibold text-[#18181B] mb-3">Conversation</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.senderType === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          msg.senderType === "user"
                            ? "bg-[#008060] text-white"
                            : msg.senderType === "system"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-gray-50 text-[#18181B] border border-gray-100"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "text-xs font-medium",
                              msg.senderType === "user" ? "text-white/80" : "text-gray-500"
                            )}
                          >
                            {msg.sender}
                          </span>
                          <span
                            className={cn(
                              "text-xs ml-3",
                              msg.senderType === "user" ? "text-white/60" : "text-gray-400"
                            )}
                          >
                            {format(new Date(msg.timestamp), "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Attachments */}
              {selectedTicket.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-[#18181B] mb-2">Attachments</h4>
                  <div className="flex gap-2">
                    {selectedTicket.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <FileTextIcon className="w-4 h-4 text-[#008060]" />
                        <span className="text-xs">{att.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Reply Area */}
              <div className="space-y-3">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="min-h-[80px]"
                />
                <div className="flex justify-between items-center">
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#008060]">
                    <PaperclipIcon className="w-4 h-4" />
                    Attach file
                  </button>
                  <div className="flex gap-2">
                    {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                      <Button variant="secondary" size="small">
                        Escalate
                      </Button>
                    )}
                    {selectedTicket.status === "resolved" && (
                      <Button variant="secondary" size="small">
                        Close Ticket
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => {
                        if (replyText.trim()) {
                          toast.success("Reply sent");
                          setReplyText("");
                        }
                      }}
                    >
                      <SendIcon className="w-4 h-4 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportPage;
