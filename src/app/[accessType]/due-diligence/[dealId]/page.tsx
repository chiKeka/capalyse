"use client";

import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import {
  useDueDiligenceRoom,
  useDueDiligenceDocuments,
  useUploadDueDiligenceDoc,
  useUpdateDocStatus,
  useDueDiligenceChecklist,
  useDueDiligenceActivity,
  type DocStatus,
  type DueDiligenceDocument,
  type ChecklistItem,
  type ActivityLogEntry,
} from "@/hooks/useDueDiligence";
import { formatCurrency } from "@/lib/uitils/fns";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  Loader2Icon,
  FileTextIcon,
  UploadIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FileIcon,
  FolderIcon,
  MessageSquareIcon,
  ListChecksIcon,
  ActivityIcon,
  ShieldCheckIcon,
  DownloadIcon,
  ArrowLeftIcon,
  CheckIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type Tab = "documents" | "checklist" | "activity" | "chat";

type DocCategory = "financial" | "legal" | "operational" | "market";

const DOC_CATEGORIES: { key: DocCategory; label: string; icon: React.ReactNode }[] = [
  { key: "financial", label: "Financial", icon: <CIcons.walletMoney /> },
  { key: "legal", label: "Legal", icon: <ShieldCheckIcon className="w-5 h-5" /> },
  { key: "operational", label: "Operational", icon: <CIcons.linearGraph /> },
  { key: "market", label: "Market", icon: <CIcons.readiness /> },
];

const docStatusConfig: Record<
  DocStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  requested: {
    label: "Requested",
    className: "bg-yellow-100 text-yellow-800",
    icon: <ClockIcon className="w-3 h-3" />,
  },
  uploaded: {
    label: "Uploaded",
    className: "bg-blue-100 text-blue-800",
    icon: <UploadIcon className="w-3 h-3" />,
  },
  under_review: {
    label: "Under Review",
    className: "bg-orange-100 text-orange-800",
    icon: <EyeIcon className="w-3 h-3" />,
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800",
    icon: <CheckCircle2Icon className="w-3 h-3" />,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800",
    icon: <XCircleIcon className="w-3 h-3" />,
  },
};

function DealSummaryHeader({
  room,
  isLoading,
}: {
  room: any;
  isLoading: boolean;
}) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2Icon className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <Card className="shadow-none">
      <CardContent className="py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-md border border-gray-200 hover:bg-gray-50 transition"
          >
            <ArrowLeftIcon className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            {room.sme?.logo ? (
              <Image
                src={room.sme.logo}
                alt={room.sme?.businessName || ""}
                width={40}
                height={40}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center text-sm font-bold text-green flex-shrink-0">
                {(room.sme?.businessName || room.sme?.name || "?")[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-lg truncate">
                {room.sme?.businessName || room.sme?.name || "Due Diligence Room"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {room.sme?.industry && <span>{room.sme.industry}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap text-sm">
            {room.amount != null && room.amount > 0 && (
              <div>
                <p className="text-muted-foreground text-xs">Investment Amount</p>
                <p className="font-bold">
                  {formatCurrency(room.amount, 0, 0, room.currency || "USD")}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Stage</p>
              <Badge variant="status" className="bg-blue-100 text-blue-800 capitalize">
                {room.stage?.replace("_", " ") || "Due Diligence"}
              </Badge>
            </div>
            {room.startedAt && (
              <div>
                <p className="text-muted-foreground text-xs">Started</p>
                <p className="font-medium">
                  {format(new Date(room.startedAt), "MMM dd, yyyy")}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge variant="status" className="bg-green-100 text-green-800 capitalize">
                {room.status || "active"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DocumentsPanel({
  documents,
  isLoading,
  selectedCategory,
  onUpload,
  onUpdateStatus,
  dealId,
}: {
  documents: DueDiligenceDocument[];
  isLoading: boolean;
  selectedCategory: DocCategory | "all";
  onUpload: (file: File, category: DocCategory) => void;
  onUpdateStatus: (docId: string, status: DocStatus, notes?: string) => void;
  dealId: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadCategory, setUploadCategory] = useState<DocCategory>("financial");

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    if (selectedCategory === "all") return documents;
    return documents.filter((doc) => doc.category === selectedCategory);
  }, [documents, selectedCategory]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, uploadCategory);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2Icon className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.png,.jpg,.jpeg"
        />
        <div className="flex items-center gap-2">
          <select
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as DocCategory)}
            className="h-9 rounded-md border border-gray-200 px-3 text-sm"
          >
            {DOC_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.label}
              </option>
            ))}
          </select>
          <Button
            variant="primary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className="w-4 h-4 mr-1.5" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileTextIcon className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="font-medium text-sm mb-1">No documents yet</p>
          <p className="text-xs text-muted-foreground">
            Upload documents to begin the due diligence review process.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocs.map((doc) => {
            const statusConf = docStatusConfig[doc.status] || docStatusConfig.requested;
            const docId = doc.id || doc._id || "";
            return (
              <Card key={docId} className="shadow-none border border-gray-100">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground capitalize">
                          {doc.category}
                        </span>
                        {doc.uploadedAt && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(doc.uploadedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <Badge
                      variant="status"
                      className={cn(
                        "text-[10px] px-2 py-0.5 gap-1 flex items-center",
                        statusConf.className,
                      )}
                    >
                      {statusConf.icon}
                      {statusConf.label}
                    </Badge>

                    <div className="flex items-center gap-1">
                      {doc.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-gray-50 transition"
                        >
                          <DownloadIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      )}
                      {(doc.status === "uploaded" || doc.status === "under_review") && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(docId, "approved")}
                            className="p-1.5 rounded-md hover:bg-green-50 transition"
                            title="Approve"
                          >
                            <CheckCircle2Icon className="w-3.5 h-3.5 text-green-600" />
                          </button>
                          <button
                            onClick={() => onUpdateStatus(docId, "rejected")}
                            className="p-1.5 rounded-md hover:bg-red-50 transition"
                            title="Reject"
                          >
                            <XCircleIcon className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {doc.notes && (
                    <p className="text-xs text-muted-foreground mt-2 pl-12 italic">
                      {doc.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChecklistPanel({
  checklist,
  isLoading,
}: {
  checklist: ChecklistItem[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2Icon className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!checklist || checklist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ListChecksIcon className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="font-medium text-sm mb-1">No checklist items</p>
        <p className="text-xs text-muted-foreground">
          The due diligence checklist will appear here once configured.
        </p>
      </div>
    );
  }

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  // Group by category
  const grouped = checklist.reduce(
    (acc, item) => {
      const cat = item.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>,
  );

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {completedCount}/{checklist.length} ({progress}%)
        </span>
      </div>

      {/* Grouped checklist */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
            {category}
          </h4>
          <div className="space-y-1">
            {items.map((item) => {
              const itemId = item.id || item._id || "";
              return (
                <div
                  key={itemId}
                  className={cn(
                    "flex items-center gap-3 py-2 px-3 rounded-md border transition",
                    item.completed
                      ? "bg-green-50/50 border-green-100"
                      : "bg-white border-gray-100",
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      item.completed
                        ? "bg-green border-green"
                        : "border-gray-300",
                    )}
                  >
                    {item.completed && <CheckIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={cn(
                      "text-sm flex-1",
                      item.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  {item.required && (
                    <Badge variant="status" className="bg-red-50 text-red-600 text-[10px]">
                      Required
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityPanel({
  activity,
  isLoading,
}: {
  activity: ActivityLogEntry[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2Icon className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!activity || activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ActivityIcon className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="font-medium text-sm mb-1">No activity yet</p>
        <p className="text-xs text-muted-foreground">
          Activity will be recorded as documents are shared and reviewed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activity.map((entry, idx) => {
        const entryId = entry.id || entry._id || idx;
        return (
          <div key={entryId} className="flex gap-3 pb-4 relative">
            {/* Timeline line */}
            {idx < activity.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-gray-200" />
            )}
            {/* Dot */}
            <div className="w-[22px] h-[22px] rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center flex-shrink-0 mt-0.5 z-10">
              <div className="w-2 h-2 rounded-full bg-green" />
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{entry.action}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
              <div className="flex items-center gap-2 mt-1">
                {entry.performedBy && (
                  <span className="text-xs text-muted-foreground">
                    by {entry.performedBy.name} ({entry.performedBy.role})
                  </span>
                )}
                {entry.createdAt && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <MessageSquareIcon className="w-10 h-10 text-muted-foreground mb-3" />
      <p className="font-medium text-sm mb-1">Chat coming soon</p>
      <p className="text-xs text-muted-foreground max-w-xs">
        Real-time messaging between investors and SMEs will be available here. Use the Messages
        section for now.
      </p>
    </div>
  );
}

export default function DueDiligencePage() {
  const params = useParams();
  const dealId = params.dealId as string;
  const [activeTab, setActiveTab] = useState<Tab>("documents");
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | "all">("all");

  const { data: room, isLoading: roomLoading } = useDueDiligenceRoom(dealId);
  const { data: documents = [], isLoading: docsLoading } = useDueDiligenceDocuments(dealId);
  const { data: checklist = [], isLoading: checklistLoading } = useDueDiligenceChecklist(dealId);
  const { data: activity = [], isLoading: activityLoading } = useDueDiligenceActivity(dealId);
  const uploadDoc = useUploadDueDiligenceDoc();
  const updateStatus = useUpdateDocStatus();

  const handleUpload = (file: File, category: DocCategory) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("name", file.name);

    uploadDoc.mutate(
      { dealId, data: formData },
      {
        onSuccess: () => toast.success("Document uploaded successfully"),
        onError: () => toast.error("Failed to upload document"),
      },
    );
  };

  const handleUpdateStatus = (docId: string, status: DocStatus, notes?: string) => {
    updateStatus.mutate(
      { dealId, docId, status, notes },
      {
        onSuccess: () => toast.success(`Document ${status.replace("_", " ")}`),
        onError: () => toast.error("Failed to update document status"),
      },
    );
  };

  // Document count by category
  const docCountByCategory = useMemo(() => {
    const counts: Record<string, number> = { all: 0 };
    if (!documents) return counts;
    const docs = Array.isArray(documents) ? documents : [];
    counts.all = docs.length;
    for (const doc of docs) {
      const cat = doc.category || "financial";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [documents]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "documents",
      label: "Documents",
      icon: <FolderIcon className="w-4 h-4" />,
    },
    {
      key: "checklist",
      label: "Checklist",
      icon: <ListChecksIcon className="w-4 h-4" />,
    },
    {
      key: "activity",
      label: "Activity",
      icon: <ActivityIcon className="w-4 h-4" />,
    },
    {
      key: "chat",
      label: "Chat",
      icon: <MessageSquareIcon className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Deal Summary Header */}
      <DealSummaryHeader room={room} isLoading={roomLoading} />

      {/* Main Layout */}
      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Left Sidebar - Document Categories */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <Card className="shadow-none">
            <CardContent className="py-3 px-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2 tracking-wide">
                Categories
              </p>
              <button
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition",
                  selectedCategory === "all"
                    ? "bg-[#F4FFFC] text-green font-semibold border border-green/20"
                    : "text-muted-foreground hover:bg-gray-50",
                )}
              >
                <FolderIcon className="w-4 h-4" />
                All Documents
                <span className="ml-auto text-xs">{docCountByCategory.all || 0}</span>
              </button>
              {DOC_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition",
                    selectedCategory === cat.key
                      ? "bg-[#F4FFFC] text-green font-semibold border border-green/20"
                      : "text-muted-foreground hover:bg-gray-50",
                  )}
                >
                  <span className="w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
                    {cat.icon}
                  </span>
                  {cat.label}
                  <span className="ml-auto text-xs">{docCountByCategory[cat.key] || 0}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Access Controls Indicator */}
          <Card className="shadow-none mt-3">
            <CardContent className="py-3 px-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wide">
                Access Controls
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green" />
                  <span className="text-xs">Investor: Full access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs">SME: Upload & View</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs">Advisors: Read Only</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 border-b border-gray-100 pb-px overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-md transition whitespace-nowrap border-b-2",
                  activeTab === tab.key
                    ? "text-green border-green bg-[#F4FFFC]/50"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-gray-50",
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "documents" && (
            <DocumentsPanel
              documents={documents}
              isLoading={docsLoading}
              selectedCategory={selectedCategory}
              onUpload={handleUpload}
              onUpdateStatus={handleUpdateStatus}
              dealId={dealId}
            />
          )}
          {activeTab === "checklist" && (
            <ChecklistPanel checklist={checklist} isLoading={checklistLoading} />
          )}
          {activeTab === "activity" && (
            <ActivityPanel activity={activity} isLoading={activityLoading} />
          )}
          {activeTab === "chat" && <ChatPanel />}
        </div>
      </div>
    </div>
  );
}
