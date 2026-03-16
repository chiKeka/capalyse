"use client";

import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/dialog";
import { useGetSingleTicket, useGetTicketMessage, useSupportTicketMutations } from "@/hooks/useSupport";
import { authAtom } from "@/lib/atoms/atoms";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  ChevronRight,
  Send,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Headphones,
  ExternalLink,
  Loader2,
  Eye,
  MoreVertical,
  ArrowUp,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

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
      return { bg: "bg-red-100", text: "text-red-800", icon: AlertTriangle };
    case "high":
      return { bg: "bg-orange-100", text: "text-orange-800", icon: AlertCircle };
    case "medium":
      return { bg: "bg-yellow-100", text: "text-yellow-800", icon: ArrowUp };
    case "low":
      return { bg: "bg-gray-100", text: "text-gray-600", icon: ArrowUp };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600", icon: ArrowUp };
  }
}

function getCategoryLabel(category: string) {
  return category?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "General";
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
function SupportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  const auth = useAtomValue(authAtom);

  const [replyMessage, setReplyMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);

  const messageEndRef = useRef<HTMLDivElement>(null);

  const { data: ticketData, isLoading: ticketLoading } = useGetSingleTicket(ticketId);
  const { data: ticketMessages } = useGetTicketMessage(ticketId);
  const { updateTicket, submitSupportMessage } = useSupportTicketMutations();

  const ticket = ticketData?.ticket;
  const messages = ticketData?.messages ?? ticketMessages ?? [];
  const statusStyle = getStatusStyle(ticket?.status);
  const priorityStyle = getPriorityStyle(ticket?.priority);
  const PriorityIcon = priorityStyle.icon;

  // Timeline
  const timeline = useMemo(() => {
    const items: { event: string; date: string; actor: string; type: "status" | "message" | "system" }[] = [];

    if (ticket?.createdAt) {
      items.push({
        event: "Ticket created",
        date: ticket.createdAt,
        actor: "System",
        type: "system",
      });
    }

    messages.forEach((msg: any) => {
      items.push({
        event: msg.message?.substring(0, 60) + (msg.message?.length > 60 ? "..." : ""),
        date: msg.createdAt,
        actor: msg.sender?.name || "Unknown",
        type: "message",
      });
    });

    if (ticket?.resolvedAt) {
      items.push({
        event: "Ticket resolved",
        date: ticket.resolvedAt,
        actor: "System",
        type: "status",
      });
    }

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [ticket, messages]);

  // Send reply
  const handleSendReply = () => {
    if (!replyMessage.trim()) return;
    submitSupportMessage.mutate(
      { id: ticketId, rest: { message: replyMessage } },
      {
        onSuccess: () => {
          setReplyMessage("");
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
              ? "Ticket is now being processed"
              : status === "resolved"
                ? "Ticket has been marked as resolved"
                : "Ticket status updated";
          submitSupportMessage.mutate({ id: ticketId, rest: { message } });
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
        <button onClick={() => router.push(`/${params.accessType}/support`)} className="hover:text-[#008060] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Support
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
              {ticket?.priority && (
                <Badge className={cn(priorityStyle.bg, priorityStyle.text, "gap-1 capitalize")}>
                  <PriorityIcon className="w-3 h-3" />
                  {ticket.priority}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                ID: {ticketId?.slice(-8)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created {ticket?.createdAt ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true }) : "N/A"}
              </span>
              {ticket?.category && (
                <Badge className="bg-gray-100 text-gray-600 text-[10px]">{getCategoryLabel(ticket.category)}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ticket?.status !== "resolved" && ticket?.status !== "closed" && (
              <Select onValueChange={handleStatusChange}>
                <SelectTrigger className="w-36 h-9 text-xs">
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">Mark In Progress</SelectItem>
                  <SelectItem value="resolved">Mark Resolved</SelectItem>
                  <SelectItem value="closed">Close Ticket</SelectItem>
                </SelectContent>
              </Select>
            )}
            {(ticket?.status === "resolved" || ticket?.status === "closed") && (
              <Button variant="secondary" size="small" className="text-xs" onClick={() => handleStatusChange("open")}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Reopen Ticket
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Description */}
          <Card className="p-6 shadow-none border border-[#E8E8E8]">
            <h3 className="font-bold text-sm text-[#18181B] mb-3">Description</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{ticket?.description || "No description provided."}</p>
          </Card>

          {/* Conversation Thread */}
          <Card className="shadow-none border border-[#E8E8E8] flex flex-col">
            <div className="p-4 border-b border-[#E8E8E8]">
              <h3 className="font-bold text-sm text-[#18181B] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conversation
                <Badge className="bg-[#F4FFFC] text-[#008060] text-[10px]">{messages.length}</Badge>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No messages yet. Start the conversation below.</p>
                </div>
              )}

              {messages.map((msg: any, i: number) => {
                const isCurrentUser = msg.sender?.id === auth?.id || msg.senderId === auth?.id;
                const isSystem = msg.senderType === "system" || !msg.sender;
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
                      <div className={cn("flex gap-3", isCurrentUser ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold",
                          isCurrentUser ? "bg-blue-100 text-blue-600" : "bg-[#F4FFFC] text-[#008060]"
                        )}>
                          {isCurrentUser ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Headphones className="w-4 h-4" />
                          )}
                        </div>
                        <div className={cn("max-w-[75%]")}>
                          <div className={cn(
                            "rounded-xl px-4 py-3",
                            isCurrentUser
                              ? "bg-blue-500 text-white rounded-br-sm"
                              : "bg-[#F4FFFC] text-[#18181B] border border-[#ABD2C7] rounded-bl-sm"
                          )}>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                          </div>
                          <div className={cn("flex items-center gap-2 mt-1", isCurrentUser ? "justify-end" : "justify-start")}>
                            <span className="text-[10px] text-gray-400">
                              {msg.sender?.name || "You"}
                            </span>
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
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    className="pr-10 resize-none"
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
                  className="h-10 px-4"
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

          {/* Attachments */}
          {ticket?.images?.length > 0 && (
            <Card className="p-6 shadow-none border border-[#E8E8E8]">
              <h3 className="font-bold text-sm text-[#18181B] mb-4 flex items-center gap-2">
                Attachments
                <Badge className="bg-gray-100 text-gray-600 text-[10px]">{ticket.images.length}</Badge>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {ticket.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="group relative border border-[#E8E8E8] rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={image}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="p-2 flex items-center gap-2">
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">IMG-{String(index + 1).padStart(5, "0")}.PNG</span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Ticket Information</h4>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Ticket ID</p>
                <p className="text-sm font-medium text-[#18181B] font-mono">{ticketId?.slice(-8)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Status</p>
                <Badge className={cn(statusStyle.bg, statusStyle.text, "mt-1 gap-1")}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                  {statusStyle.label}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Priority</p>
                {ticket?.priority ? (
                  <Badge className={cn(priorityStyle.bg, priorityStyle.text, "mt-1 capitalize")}>{ticket.priority}</Badge>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">Not set</p>
                )}
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Category</p>
                <p className="text-sm font-medium mt-1">{getCategoryLabel(ticket?.category || ticket?.subject)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Created</p>
                <p className="text-sm font-medium mt-1">
                  {ticket?.createdAt ? format(new Date(ticket.createdAt), "MMM d, yyyy") : "N/A"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {ticket?.createdAt ? format(new Date(ticket.createdAt), "h:mm a") : ""}
                </p>
              </div>
            </div>
          </Card>

          {/* SLA Timer (mock) */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Response SLA</h4>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-700">
                {ticket?.status === "resolved" || ticket?.status === "closed" ? "Completed" : "Within 24 hours"}
              </span>
            </div>
          </Card>

          {/* Ticket Timeline */}
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
                      item.type === "status" ? "bg-green-100" : item.type === "system" ? "bg-gray-100" : "bg-blue-100"
                    )}>
                      {item.type === "status" ? (
                        <CheckCircle2 className="w-3 h-3 text-green-600" />
                      ) : item.type === "system" ? (
                        <AlertCircle className="w-3 h-3 text-gray-500" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#18181B]">{item.event}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{item.actor}</span>
                        <span className="text-[10px] text-gray-400">
                          {format(new Date(item.date), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Related Tickets placeholder */}
          <Card className="p-5 shadow-none border border-[#E8E8E8]">
            <h4 className="font-bold text-sm text-[#18181B] mb-3">Related Tickets</h4>
            <p className="text-xs text-gray-400">No related tickets found.</p>
          </Card>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Attachment Preview</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4">
              <img
                src={selectedImage}
                alt="Document"
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder.png";
                }}
              />
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

export default SupportDetailsPage;
