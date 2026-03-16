"use client";

import { useMemo, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetSingleTicket, useGetTicketMessage, useSupportTicketMutations } from "@/hooks/useSupport";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  ChevronRight,
  Send,
  Paperclip,
  Download,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Headphones,
  Eye,
  ArrowUp,
  XCircle,
  RefreshCw,
  UserPlus,
  Shield,
  Star,
  Copy,
  Merge,
  BarChart3,
  Settings,
  ExternalLink,
  ArrowUpRight,
  Mail,
  Phone,
  MoreHorizontal,
  Flag,
  Bookmark,
  Smile,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STATUSES = [
  { name: "In Progress", key: "in_progress" },
  { name: "Resolved", key: "resolved" },
  { name: "Closed", key: "closed" },
];

const PRIORITIES = ["critical", "high", "medium", "low"];

const MOCK_AGENTS = [
  { id: "1", name: "Sarah Johnson", email: "sarah@capalyse.com" },
  { id: "2", name: "David Okafor", email: "david@capalyse.com" },
  { id: "3", name: "Linda Mensah", email: "linda@capalyse.com" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "open":
      return { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-500", label: "Open" };
    case "in_progress":
      return { bg: "bg-yellow-100", text: "text-yellow-800", dot: "bg-yellow-500", label: "In Progress" };
    case "resolved":
      return { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500", label: "Resolved" };
    case "closed":
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: "Closed" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400", label: status || "Unknown" };
  }
}

function getPriorityStyle(priority: string) {
  switch (priority?.toLowerCase()) {
    case "critical":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "high":
      return { bg: "bg-orange-100", text: "text-orange-800" };
    case "medium":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "low":
      return { bg: "bg-gray-100", text: "text-gray-600" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600" };
  }
}

function getCategoryLabel(category: string) {
  return category?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "General";
}

// ---------------------------------------------------------------------------
// SLA Timer Component
// ---------------------------------------------------------------------------
function SLATimer({ createdAt, status }: { createdAt: string; status: string }) {
  const isCompleted = status === "resolved" || status === "closed";
  const created = new Date(createdAt);
  const slaDeadline = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24h SLA
  const now = new Date();
  const remaining = slaDeadline.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.floor(remaining / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)));
  const isBreached = remaining <= 0 && !isCompleted;
  const isWarning = remaining > 0 && remaining < 4 * 60 * 60 * 1000 && !isCompleted; // <4h

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      isCompleted ? "bg-green-50 border-green-200" : isBreached ? "bg-red-50 border-red-200" : isWarning ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Clock className={cn(
          "w-4 h-4",
          isCompleted ? "text-green-600" : isBreached ? "text-red-600" : isWarning ? "text-orange-600" : "text-blue-600"
        )} />
        <span className={cn(
          "text-sm font-semibold",
          isCompleted ? "text-green-700" : isBreached ? "text-red-700" : isWarning ? "text-orange-700" : "text-blue-700"
        )}>
          {isCompleted ? "SLA Met" : isBreached ? "SLA Breached" : `${hoursRemaining}h ${minutesRemaining}m remaining`}
        </span>
      </div>
      <p className="text-[10px] text-gray-500">
        SLA Deadline: {format(slaDeadline, "MMM d, yyyy h:mm a")}
      </p>
      {!isCompleted && (
        <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className={cn("h-full rounded-full", isBreached ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-blue-500")}
            style={{ width: `${Math.min(100, isBreached ? 100 : 100 - (remaining / (24 * 60 * 60 * 1000)) * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
function AdminSupportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [replyMessage, setReplyMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [csatDialogOpen, setCsatDialogOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [mergeTicketId, setMergeTicketId] = useState("");

  const messageEndRef = useRef<HTMLDivElement>(null);

  const { data: ticketData, isLoading: ticketLoading } = useGetSingleTicket(ticketId);
  const { data: ticketMessages } = useGetTicketMessage(ticketId);
  const { updateTicket, submitSupportMessage } = useSupportTicketMutations();

  const ticket = ticketData?.ticket;
  const messages = ticketData?.messages ?? ticketMessages ?? [];
  const statusStyle = getStatusStyle(ticket?.status);
  const priorityStyle = getPriorityStyle(ticket?.priority || "medium");

  // Timeline
  const timeline = useMemo(() => {
    const items: { event: string; date: string; actor: string; type: "status" | "message" | "system" | "escalation" }[] = [];

    if (ticket?.createdAt) {
      items.push({ event: "Ticket created", date: ticket.createdAt, actor: "System", type: "system" });
    }

    messages.forEach((msg: any) => {
      items.push({
        event: msg.message?.substring(0, 50) + (msg.message?.length > 50 ? "..." : ""),
        date: msg.createdAt,
        actor: msg.sender?.name || "Agent",
        type: "message",
      });
    });

    if (ticket?.resolvedAt) {
      items.push({ event: "Ticket resolved", date: ticket.resolvedAt, actor: "Agent", type: "status" });
    }

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ticket, messages]);

  // Send reply
  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    const prefix = isInternalNote ? "[Internal Note] " : "";
    submitSupportMessage.mutate(
      { id: ticketId, rest: { message: prefix + replyMessage } },
      {
        onSuccess: () => {
          setReplyMessage("");
          setIsInternalNote(false);
        },
      }
    );
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    updateTicket.mutate(
      { id: ticketId, rest: { status } },
      {
        onSuccess: () => {
          const message =
            status === "in_progress"
              ? "Ticket has been picked up for processing"
              : status === "resolved"
                ? "Ticket has been marked as resolved"
                : "Ticket has been closed";
          submitSupportMessage.mutate({ id: ticketId, rest: { message } });
        },
      }
    );
  };

  // Handle priority change
  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
    updateTicket.mutate(
      { id: ticketId, rest: { priority } },
      {
        onSuccess: () => {
          submitSupportMessage.mutate({ id: ticketId, rest: { message: `Priority changed to ${priority}` } });
        },
      }
    );
  };

  // Handle escalation
  const handleEscalate = () => {
    updateTicket.mutate(
      { id: ticketId, rest: { priority: "critical", status: "in_progress" } },
      {
        onSuccess: () => {
          submitSupportMessage.mutate({ id: ticketId, rest: { message: "Ticket has been escalated to critical priority" } });
        },
      }
    );
  };

  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#008060] mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm">
        <button onClick={() => router.push("/admin/support")} className="hover:text-[#008060] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Support Management
        </button>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="font-medium text-[#008060]">Ticket #{ticketId?.slice(-8)}</span>
      </div>

      {/* Ticket Header */}
      <Card className="p-6 shadow-none border border-[#E8E8E8]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-[#18181B] capitalize">
                {ticket?.subject?.replace(/_/g, " ") || "Support Ticket"}
              </h1>
              <Badge className={cn(statusStyle.bg, statusStyle.text, "gap-1.5")}>
                <div className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                {statusStyle.label}
              </Badge>
              {(ticket?.priority || selectedPriority) && (
                <Badge className={cn(getPriorityStyle(ticket?.priority || selectedPriority).bg, getPriorityStyle(ticket?.priority || selectedPriority).text, "capitalize")}>
                  {ticket?.priority || selectedPriority}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" />ID: {ticketId?.slice(-8)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Created {ticket?.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "N/A"}</span>
              {ticket?.category && <Badge className="bg-gray-100 text-gray-600 text-[10px]">{getCategoryLabel(ticket.category)}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={updateTicket?.isPending || submitSupportMessage?.isPending}
                  variant="primary"
                  size="small"
                  className="text-xs flex items-center gap-1"
                >
                  {(updateTicket?.isPending || submitSupportMessage?.isPending) && <Loader2 className="w-3 h-3 animate-spin" />}
                  Change Status
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-44 bg-white border shadow-lg rounded-lg">
                {STATUSES.map((status) => (
                  <DropdownMenuItem
                    key={status.key}
                    onClick={() => handleStatusChange(status.key)}
                    disabled={ticket?.status === status.key}
                    className="px-3 py-2 text-sm cursor-pointer"
                  >
                    {status.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="small" className="text-xs">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 bg-white border shadow-lg rounded-lg">
                <DropdownMenuItem onClick={() => setAssignDialogOpen(true)} className="px-3 py-2 text-sm cursor-pointer">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Assign Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEscalate} className="px-3 py-2 text-sm cursor-pointer">
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Escalate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMergeDialogOpen(true)} className="px-3 py-2 text-sm cursor-pointer">
                  <Merge className="w-4 h-4 mr-2" />
                  Merge Ticket
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem onClick={() => setCsatDialogOpen(true)} className="px-3 py-2 text-sm cursor-pointer">
                  <Smile className="w-4 h-4 mr-2" />
                  Send CSAT Survey
                </DropdownMenuItem>
                {(ticket?.status === "resolved" || ticket?.status === "closed") && (
                  <DropdownMenuItem onClick={() => handleStatusChange("open")} className="px-3 py-2 text-sm cursor-pointer">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reopen Ticket
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Ticket Summary Card */}
          <Card className="shadow-none border border-[#E8E8E8] overflow-hidden">
            <div className="p-4 bg-[#F4FFFC] border-b border-[#ABD2C7]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Ticket No</p>
                  <p className="text-sm font-semibold">{ticketId?.slice(-8)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Created</p>
                  <p className="text-sm font-semibold">{ticket?.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy") : "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Category</p>
                  <p className="text-sm font-semibold">{getCategoryLabel(ticket?.category || ticket?.subject)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Priority</p>
                  <Select value={ticket?.priority || selectedPriority || "medium"} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="h-7 text-xs w-24 mt-0.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm text-[#18181B] mb-2">Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{ticket?.description || "No description provided."}</p>
            </div>
          </Card>

          {/* Conversation Thread */}
          <Card className="shadow-none border border-[#E8E8E8] flex flex-col">
            <div className="p-4 border-b border-[#E8E8E8]">
              <h3 className="font-bold text-sm text-[#18181B] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Activity & Messages
                <Badge className="bg-[#F4FFFC] text-[#008060] text-[10px]">{messages.length}</Badge>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No messages yet.</p>
                </div>
              )}

              {messages.map((msg: any, i: number) => {
                const isInternal = msg.message?.startsWith("[Internal Note]");
                const isSystem = msg.senderType === "system" || (!msg.sender && !msg.senderId);
                const isAgent = msg.sender?.role === "admin" || msg.sender?.role === "agent";
                const displayMessage = isInternal ? msg.message.replace("[Internal Note] ", "") : msg.message;

                return (
                  <div key={msg.id || i}>
                    {isSystem ? (
                      <div className="flex justify-center">
                        <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {msg.message}
                          <span className="text-gray-400 ml-1">
                            {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, h:mm a") : ""}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className={cn("flex gap-3", isAgent ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                          isAgent ? "bg-[#F4FFFC] text-[#008060]" : "bg-blue-100 text-blue-600"
                        )}>
                          {isAgent ? <Headphones className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div className="max-w-[75%]">
                          {isInternal && (
                            <div className="flex items-center gap-1 mb-1">
                              <Shield className="w-3 h-3 text-purple-500" />
                              <span className="text-[10px] text-purple-600 font-medium">Internal Note</span>
                            </div>
                          )}
                          <div className={cn(
                            "rounded-xl px-4 py-3",
                            isInternal
                              ? "bg-purple-50 text-purple-900 border border-purple-200 rounded-br-sm"
                              : isAgent
                                ? "bg-[#F4FFFC] text-[#18181B] border border-[#ABD2C7] rounded-br-sm"
                                : "bg-blue-500 text-white rounded-bl-sm"
                          )}>
                            <p className="text-sm leading-relaxed">{displayMessage}</p>
                          </div>
                          <div className={cn("flex items-center gap-2 mt-1", isAgent ? "justify-end" : "justify-start")}>
                            <span className="text-[10px] text-gray-400">{msg.sender?.name || (isAgent ? "Agent" : "User")}</span>
                            <span className="text-[10px] text-gray-400">
                              {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, h:mm a") : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            {/* Reply Composer */}
            <div className="p-4 border-t border-[#E8E8E8]">
              {/* Internal Note Toggle */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setIsInternalNote(false)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    !isInternalNote ? "bg-[#008060] text-white" : "bg-gray-100 text-gray-600"
                  )}
                >
                  Reply
                </button>
                <button
                  onClick={() => setIsInternalNote(true)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1",
                    isInternalNote ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
                  )}
                >
                  <Shield className="w-3 h-3" />
                  Internal Note
                </button>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={isInternalNote ? "Add an internal note (not visible to customer)..." : "Type your reply to the customer..."}
                    rows={2}
                    className={cn("pr-10 resize-none", isInternalNote && "border-purple-300 focus:border-purple-500")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <button className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600">
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSendReply}
                  disabled={!replyMessage.trim() || submitSupportMessage.isPending}
                  className={cn("h-10 px-4", isInternalNote && "!bg-purple-600 hover:!bg-purple-700")}
                >
                  {submitSupportMessage.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Documents */}
          {ticket?.images?.length > 0 && (
            <Card className="p-6 shadow-none border border-[#E8E8E8]">
              <h3 className="font-bold text-sm text-[#18181B] mb-4 flex items-center gap-2">
                Attachments
                <Badge className="bg-gray-100 text-gray-600 text-[10px]">{ticket.images.length}</Badge>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ticket.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="group relative border border-[#E8E8E8] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img src={image} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div className="p-2 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-600 truncate">IMG-{String(index + 1).padStart(5, "0")}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* SLA Timer */}
          {ticket?.createdAt && (
            <SLATimer createdAt={ticket.createdAt} status={ticket.status} />
          )}

          {/* Reporter Info */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Reporter</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{ticket?.user?.name || ticket?.createdBy?.name || "Unknown User"}</p>
                <p className="text-xs text-gray-500">{ticket?.user?.email || ticket?.createdBy?.email || ""}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {ticket?.user?.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3 h-3" />
                  {ticket.user.phone}
                </div>
              )}
              {(ticket?.user?.email || ticket?.createdBy?.email) && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3 h-3" />
                  {ticket?.user?.email || ticket?.createdBy?.email}
                </div>
              )}
            </div>
          </Card>

          {/* Assigned Agent */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-[#18181B]">Assigned Agent</h4>
              <button onClick={() => setAssignDialogOpen(true)} className="text-xs text-[#008060] hover:underline">Change</button>
            </div>
            {ticket?.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F4FFFC] flex items-center justify-center text-[#008060]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{ticket.assignedTo.name || "Agent"}</p>
                  <p className="text-xs text-gray-500">{ticket.assignedTo.email || ""}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <UserPlus className="w-4 h-4" />
                <span className="text-xs">No agent assigned</span>
              </div>
            )}
          </Card>

          {/* Ticket Details */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Ticket Details</h4>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Status</p>
                <Badge className={cn(statusStyle.bg, statusStyle.text, "mt-1 gap-1")}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                  {statusStyle.label}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Priority</p>
                <Select value={ticket?.priority || selectedPriority || "medium"} onValueChange={handlePriorityChange}>
                  <SelectTrigger className="h-7 text-xs w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Category</p>
                <p className="text-sm font-medium mt-1">{getCategoryLabel(ticket?.category || ticket?.subject)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-gray-400 uppercase">Created</p>
                <p className="text-sm font-medium mt-1">{ticket?.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy h:mm a") : "N/A"}</p>
              </div>
              {ticket?.resolvedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">Resolved</p>
                    <p className="text-sm font-medium mt-1">{format(new Date(ticket.resolvedAt), "MMM d, yyyy h:mm a")}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-4">Timeline</h4>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="relative">
                  {i < timeline.length - 1 && (
                    <div className="absolute left-3 top-6 w-0.5 h-full bg-gray-200 border-l border-dashed border-gray-300" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 relative z-10",
                      item.type === "status" ? "bg-green-100" : item.type === "escalation" ? "bg-red-100" : item.type === "system" ? "bg-gray-100" : "bg-blue-100"
                    )}>
                      {item.type === "status" ? <CheckCircle2 className="w-3 h-3 text-green-600" /> :
                       item.type === "escalation" ? <ArrowUpRight className="w-3 h-3 text-red-600" /> :
                       item.type === "system" ? <AlertCircle className="w-3 h-3 text-gray-500" /> :
                       <MessageSquare className="w-3 h-3 text-blue-600" />}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#18181B]">{item.event}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{item.actor}</span>
                        <span className="text-[10px] text-gray-400">{format(new Date(item.date), "MMM d, h:mm a")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Related Tickets */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Related Tickets</h4>
            <p className="text-xs text-gray-400">No related tickets found.</p>
          </Card>
        </div>
      </div>

      {/* Assign Agent Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Assign Agent</DialogTitle>
            <DialogDescription>Select an agent to handle this ticket</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {MOCK_AGENTS.map((agent) => (
              <button
                key={agent.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-[#E8E8E8] hover:bg-[#F4FFFC] transition-colors text-left"
                onClick={() => {
                  setAssignDialogOpen(false);
                  submitSupportMessage.mutate({ id: ticketId, rest: { message: `Ticket assigned to ${agent.name}` } });
                }}
              >
                <div className="w-8 h-8 rounded-full bg-[#F4FFFC] flex items-center justify-center text-[#008060]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.email}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Ticket Dialog */}
      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Merge Ticket</DialogTitle>
            <DialogDescription>Enter the ticket ID to merge with this one</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-500">Target Ticket ID</Label>
              <Input
                value={mergeTicketId}
                onChange={(e) => setMergeTicketId(e.target.value)}
                placeholder="Enter ticket ID..."
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="small" className="text-xs" onClick={() => setMergeDialogOpen(false)}>Cancel</Button>
              <Button variant="primary" size="small" className="text-xs" onClick={() => { setMergeDialogOpen(false); }}>Merge</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* CSAT Survey Dialog */}
      <Dialog open={csatDialogOpen} onOpenChange={setCsatDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customer Satisfaction Follow-up</DialogTitle>
            <DialogDescription>Send a satisfaction survey to the customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              A customer satisfaction survey will be sent to {ticket?.user?.email || "the reporter"} asking them to rate their support experience.
            </p>
            <div className="flex items-center justify-center gap-2 py-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button key={rating} className="p-2 rounded-lg hover:bg-yellow-50 transition-colors">
                  <Star className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                </button>
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" size="small" className="text-xs" onClick={() => setCsatDialogOpen(false)}>Cancel</Button>
              <Button variant="primary" size="small" className="text-xs" onClick={() => { setCsatDialogOpen(false); submitSupportMessage.mutate({ id: ticketId, rest: { message: "Customer satisfaction survey sent" } }); }}>
                Send Survey
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Attachment Preview</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <img src={selectedImage} alt="Document" className="max-w-full max-h-[60vh] object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.png"; }} />
              <a href={selectedImage} download target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="small" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AdminSupportDetailPage;
