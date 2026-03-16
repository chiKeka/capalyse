"use client";

import ChatPage from "@/components/messages";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetConversations } from "@/hooks/useMessages";
import { useSession } from "@/lib/auth-client";
import { getChatHeader } from "@/lib/uitils";
import { ChatConversation, ChatParticipant } from "@/lib/uitils/types";
import { cn } from "@/lib/utils";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  BellIcon,
  FilterIcon,
  Loader2Icon,
  MessageSquareIcon,
  MessageSquarePlusIcon,
  MoreVerticalIcon,
  PinIcon,
  RefreshCcwIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type FilterTab = "all" | "unread" | "starred";

interface MessagePreview {
  id: string;
  sender: string;
  senderType: string;
  avatar: string;
  time: string;
  unreadCount?: number;
  text?: string;
  online?: boolean;
  isStarred?: boolean;
  lastMessagePreview?: string;
}

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
}

// ============================================================================
// Helpers
// ============================================================================

const conversationToPreview = (
  conversation: ChatConversation,
  currentUserId: string
): MessagePreview => {
  const otherParticipant =
    conversation.participantsDetails?.find((p) => p.id !== currentUserId) ||
    conversation.participantsDetails?.[0];
  const chatHeader = getChatHeader(
    currentUserId,
    conversation.participantsDetails as ChatParticipant[]
  );

  return {
    id: conversation.id,
    sender: chatHeader?.name ?? otherParticipant?.name ?? "Unknown",
    senderType: otherParticipant?.businessName || "Member",
    avatar: chatHeader?.img ?? "",
    time: new Date(conversation.lastMessageAt || conversation.updatedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    unreadCount: conversation.unreadCount[currentUserId] || 0,
    lastMessagePreview: "",
  };
};

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRoleLabel(accessType: string): string {
  switch (accessType) {
    case "sme":
      return "SME";
    case "investor":
      return "Investor";
    case "development":
      return "Development Org";
    default:
      return "Member";
  }
}

// ============================================================================
// Quick Contacts & Templates
// ============================================================================

function getQuickContactsForRole(accessType: string): { label: string; description: string; icon: React.ReactNode }[] {
  switch (accessType) {
    case "sme":
      return [
        { label: "My Investors", description: "Message investors who expressed interest", icon: <UsersIcon className="w-4 h-4" /> },
        { label: "Program Managers", description: "Contact your program coordinators", icon: <UserIcon className="w-4 h-4" /> },
        { label: "Support Team", description: "Get help from platform support", icon: <MessageSquareIcon className="w-4 h-4" /> },
      ];
    case "investor":
      return [
        { label: "Saved SMEs", description: "Message SMEs in your saved list", icon: <StarIcon className="w-4 h-4" /> },
        { label: "Portfolio Companies", description: "Contact your investments", icon: <UsersIcon className="w-4 h-4" /> },
        { label: "Co-investors", description: "Reach out to fellow investors", icon: <UserIcon className="w-4 h-4" /> },
      ];
    case "development":
      return [
        { label: "Program SMEs", description: "Message SMEs in your programs", icon: <UsersIcon className="w-4 h-4" /> },
        { label: "Partner Organizations", description: "Contact partner orgs", icon: <UserIcon className="w-4 h-4" /> },
        { label: "Platform Admin", description: "Contact platform administrators", icon: <MessageSquareIcon className="w-4 h-4" /> },
      ];
    default:
      return [];
  }
}

function getTemplatesForRole(accessType: string): MessageTemplate[] {
  const common: MessageTemplate[] = [
    { id: "intro", title: "Introduction", content: "Hi! I came across your profile on Capalyse and would love to connect and discuss potential collaboration opportunities.", category: "General" },
    { id: "followup", title: "Follow Up", content: "I wanted to follow up on our previous conversation. Would you have time for a brief call this week?", category: "General" },
  ];

  switch (accessType) {
    case "sme":
      return [
        ...common,
        { id: "pitch", title: "Investment Inquiry", content: "Thank you for your interest in our business. I would be happy to share more details about our growth plans and funding needs.", category: "Investment" },
        { id: "program", title: "Program Question", content: "I have a question about the program requirements. Could you provide more details about the application process?", category: "Programs" },
      ];
    case "investor":
      return [
        ...common,
        { id: "interest", title: "Expression of Interest", content: "I have reviewed your business profile and I am interested in learning more about your company. Could we schedule a call to discuss potential investment?", category: "Investment" },
        { id: "duediligence", title: "Due Diligence Request", content: "As part of our evaluation process, I would appreciate if you could share your latest financial statements and business plan.", category: "Due Diligence" },
      ];
    case "development":
      return [
        ...common,
        { id: "program-invite", title: "Program Invitation", content: "We would like to invite your organization to participate in our upcoming development program. Please let me know if you are interested.", category: "Programs" },
        { id: "progress", title: "Progress Check-in", content: "I wanted to check in on your progress in the program. How are things going? Is there any support you need?", category: "Programs" },
      ];
    default:
      return common;
  }
}

// ============================================================================
// Sub-components
// ============================================================================

function ConversationListItem({
  msg,
  isActive,
  onClick,
}: {
  msg: MessagePreview;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-l-3",
        isActive ? "bg-[#F4FFFC] border-l-[#008060]" : "border-l-transparent"
      )}
      onClick={onClick}
    >
      {msg.avatar ? (
        <Image
          src={msg.avatar}
          alt={msg.sender}
          width={40}
          height={40}
          className="rounded-full object-cover mr-3"
        />
      ) : (
        <div className="rounded-full bg-[#F4FFFC] h-10 w-10 flex items-center justify-center mr-3 text-[#008060] font-semibold text-sm shrink-0">
          {getInitials(msg.sender)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn(
              "text-sm truncate max-w-[160px]",
              msg.unreadCount && msg.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"
            )}
          >
            {msg.sender}
          </span>
          <span className="text-[11px] text-gray-400 shrink-0 ml-2">{msg.time}</span>
        </div>
        <p className={cn("text-xs truncate max-w-[200px]", msg.unreadCount && msg.unreadCount > 0 ? "text-gray-700 font-medium" : "text-gray-400")}>
          {msg.lastMessagePreview || msg.senderType}
        </p>
      </div>
      {msg.unreadCount && msg.unreadCount > 0 ? (
        <span className="rounded-full bg-[#008060] text-white h-[1.125rem] w-[1.125rem] flex items-center justify-center font-bold text-[10px] ml-2 shrink-0">
          {msg.unreadCount}
        </span>
      ) : null}
    </li>
  );
}

function QuickContactCard({
  contact,
  onClick,
}: {
  contact: { label: string; description: string; icon: React.ReactNode };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-[#F4FFFC] hover:border-[#008060]/20 transition-colors text-left w-full"
    >
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#F4FFFC] text-[#008060] shrink-0">
        {contact.icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#18181B]">{contact.label}</p>
        <p className="text-xs text-gray-400 truncate">{contact.description}</p>
      </div>
    </button>
  );
}

function TemplatesDialog({
  open,
  onClose,
  templates,
  onSelectTemplate,
}: {
  open: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  onSelectTemplate: (content: string) => void;
}) {
  const categories = useMemo(() => {
    const set = new Set(templates.map((t) => t.category));
    return Array.from(set);
  }, [templates]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Message Templates</DialogTitle>
          <DialogDescription>Choose a template to quickly compose a message</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {category}
              </h4>
              <div className="space-y-2">
                {templates
                  .filter((t) => t.category === category)
                  .map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onSelectTemplate(template.content);
                        onClose();
                        toast.success("Template selected");
                      }}
                      className="w-full p-3 rounded-lg border border-gray-100 hover:bg-[#F4FFFC] hover:border-[#008060]/20 transition-colors text-left"
                    >
                      <p className="text-sm font-semibold text-[#18181B] mb-1">{template.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.content}</p>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MessagesPage() {
  const params = useParams();
  const accessType = params.accessType as string;

  const [selectedConversation, setSelectedConversation] = useState<MessagePreview | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showTemplates, setShowTemplates] = useState(false);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const { conversations, isLoading, refetch } = useGetConversations();
  const { data: session } = useSession();
  const currentUserId = session?.user?.id as string;

  const previews = useMemo(
    () => conversations.map((conv) => conversationToPreview(conv, currentUserId)),
    [conversations, currentUserId]
  );

  const filtered = useMemo(() => {
    let result = previews;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.sender.toLowerCase().includes(q) || p.senderType.toLowerCase().includes(q)
      );
    }

    // Filter tab
    if (filter === "unread") {
      result = result.filter((p) => p.unreadCount && p.unreadCount > 0);
    } else if (filter === "starred") {
      result = result.filter((p) => starredIds.has(p.id));
    }

    return result;
  }, [previews, search, filter, starredIds]);

  const totalUnread = useMemo(
    () => previews.reduce((sum, p) => sum + (p.unreadCount || 0), 0),
    [previews]
  );

  const quickContacts = useMemo(() => getQuickContactsForRole(accessType), [accessType]);
  const templates = useMemo(() => getTemplatesForRole(accessType), [accessType]);

  const handleToggleStar = useCallback((id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filterTabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread", count: totalUnread },
    { key: "starred", label: "Starred", count: starredIds.size },
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)] rounded-lg border overflow-hidden bg-white">
      {/* Conversation List */}
      <div
        className={cn(
          "w-full md:w-[22rem] md:min-w-[22rem] border-r flex flex-col",
          selectedConversation ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="px-4 py-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Messages</h1>
              {totalUnread > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#008060] text-white">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowTemplates(true)}
                className="text-gray-400 hover:text-[#008060] p-1.5 rounded-md hover:bg-gray-100 transition"
                aria-label="Templates"
                title="Message Templates"
              >
                <MessageSquarePlusIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => refetch()}
                className="text-gray-400 hover:text-[#008060] p-1.5 rounded-md hover:bg-gray-100 transition"
                aria-label="Refresh"
              >
                <RefreshCcwIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060]"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md transition",
                  filter === tab.key
                    ? "bg-[#F4FFFC] text-[#008060] border border-[#008060]"
                    : "text-gray-400 hover:bg-gray-100 border border-transparent"
                )}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1 py-0.5 text-[10px] rounded-full bg-[#008060] text-white min-w-[16px] text-center">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Contacts (when no conversations) */}
        {!isLoading && previews.length === 0 && (
          <div className="px-4 py-3 border-b">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Contacts</p>
            <div className="space-y-2">
              {quickContacts.map((contact, i) => (
                <QuickContactCard
                  key={i}
                  contact={contact}
                  onClick={() => toast.info("Navigate to directory to start a conversation")}
                />
              ))}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2Icon className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-center px-6">
              <div className="p-3 rounded-full bg-[#F4FFFC] mb-3">
                <MessageSquareIcon className="w-8 h-8 text-[#008060]" />
              </div>
              <p className="font-semibold text-sm mb-1">
                {filter === "unread"
                  ? "No unread messages"
                  : filter === "starred"
                    ? "No starred conversations"
                    : "No conversations yet"}
              </p>
              <p className="text-xs text-gray-400">
                {filter === "all"
                  ? "Start a conversation from the networking or directory pages."
                  : "Messages matching your filter will appear here."}
              </p>
              {filter === "all" && (
                <Link href={`/${accessType}/connections`}>
                  <Button variant="secondary" size="small" className="mt-3">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    Go to Connections
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y">
              {filtered.map((msg) => (
                <ConversationListItem
                  key={msg.id}
                  msg={msg}
                  isActive={selectedConversation?.id === msg.id}
                  onClick={() => setSelectedConversation(msg)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions Footer */}
        <div className="px-4 py-3 border-t bg-gray-50/50">
          <div className="flex items-center justify-between">
            <Link
              href={`/${accessType}/connections`}
              className="text-xs text-[#008060] font-medium hover:underline flex items-center gap-1"
            >
              <UsersIcon className="w-3.5 h-3.5" />
              Full Messaging Center
            </Link>
            <button
              onClick={() => setShowTemplates(true)}
              className="text-xs text-gray-400 hover:text-[#008060] font-medium flex items-center gap-1"
            >
              <MessageSquarePlusIcon className="w-3.5 h-3.5" />
              Templates
            </button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          selectedConversation ? "flex" : "hidden md:flex"
        )}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden text-[#008060] hover:bg-[#F4FFFC] rounded-full p-1"
                  aria-label="Back"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                {selectedConversation.avatar ? (
                  <Image
                    src={selectedConversation.avatar}
                    alt={selectedConversation.sender}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="rounded-full bg-[#F4FFFC] h-10 w-10 flex items-center justify-center text-[#008060] font-semibold text-sm">
                    {getInitials(selectedConversation.sender)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{selectedConversation.sender}</span>
                  <span className="text-xs text-gray-400">{selectedConversation.senderType}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleStar(selectedConversation.id)}
                  className={cn(
                    "p-2 rounded-md hover:bg-gray-100 transition",
                    starredIds.has(selectedConversation.id) ? "text-amber-400" : "text-gray-400"
                  )}
                  title="Star conversation"
                >
                  <StarIcon
                    className={cn(
                      "w-4 h-4",
                      starredIds.has(selectedConversation.id) && "fill-amber-400"
                    )}
                  />
                </button>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-[#008060] transition"
                  title="Use template"
                >
                  <MessageSquarePlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              <ChatPage
                chatUser={{
                  id: selectedConversation.id,
                  sender: selectedConversation.sender,
                  senderType: selectedConversation.senderType,
                  avatar: selectedConversation.avatar,
                  time: selectedConversation.time,
                }}
                currentUserId={currentUserId || "unknown-user"}
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="p-4 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] mb-4">
              <MessageSquareIcon className="w-12 h-12 text-[#008060]" />
            </div>
            <p className="font-semibold text-lg mb-1">Select a conversation</p>
            <p className="text-sm text-gray-400 max-w-sm mb-6">
              Choose a conversation from the left to start messaging, or visit the connections page to start a new conversation.
            </p>

            {/* Role-based Quick Contacts */}
            <div className="w-full max-w-sm space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider text-left">
                Quick Contacts ({getRoleLabel(accessType)})
              </p>
              {quickContacts.map((contact, i) => (
                <QuickContactCard
                  key={i}
                  contact={contact}
                  onClick={() => toast.info("Navigate to directory to start a conversation")}
                />
              ))}
            </div>

            <Link href={`/${accessType}/connections`} className="mt-4">
              <Button variant="primary" size="small">
                <UsersIcon className="w-4 h-4 mr-1" />
                Open Messaging Center
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Templates Dialog */}
      <TemplatesDialog
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templates}
        onSelectTemplate={(content) => {
          toast.success("Template copied. Paste it in your message.");
          navigator.clipboard.writeText(content);
        }}
      />
    </div>
  );
}
