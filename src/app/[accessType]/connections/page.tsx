"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  useGetConversations,
  useGetConversationMessages,
  useMessages,
  useCreateConversation,
} from "@/hooks/useMessages";
import { useSession } from "@/lib/auth-client";
import { getChatHeader } from "@/lib/uitils";
import {
  ChatParticipant,
  ChatMessage,
  createSendMessageRequest,
  validateMessageRequest,
} from "@/lib/uitils/types";
import { cn } from "@/lib/utils";
import useDebounce from "@/hooks/useDebounce";
import { formatDistanceToNow, format, isToday, isYesterday, isSameDay } from "date-fns";
import {
  Archive,
  ArrowLeft,
  Check,
  CheckCheck,
  ChevronDown,
  Clock,
  Filter,
  Loader2Icon,
  MessageSquarePlus,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  UsersIcon,
  Video,
  X,
  Bell,
  BellOff,
  UserX,
  ExternalLink,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type FilterTab = "all" | "unread" | "archived";
type SortMode = "recent" | "unread" | "name";

interface ConversationItem {
  id: string;
  name: string;
  avatar: string;
  businessName: string;
  lastMessageAt: string | undefined;
  lastMessagePreview: string;
  unreadCount: number;
  isGroup: boolean;
  participantCount: number;
  isOnline: boolean;
  participantsDetails: ChatParticipant[];
}

interface ContactInfo {
  id: string;
  name: string;
  avatar: string;
  businessName: string;
  email: string;
  role: string;
}

// ============================================================================
// Mock data for online status and last message previews
// (The API does not return these fields; they are simulated here)
// ============================================================================

const MOCK_ONLINE_IDS = new Set<string>(); // Will be populated from participant IDs
const MOCK_MESSAGE_PREVIEWS = [
  "Looking forward to our next meeting.",
  "Thanks for sharing the financial report.",
  "Can we schedule a call this week?",
  "Great progress on the due diligence!",
  "I have some updates on the funding round.",
  "Let me review the proposal and get back to you.",
  "The partnership agreement looks good.",
  "Would love to discuss the market expansion plan.",
  "Just sent over the updated business plan.",
  "Let's connect next Tuesday afternoon.",
];

/** Generate a deterministic mock preview based on conversation ID */
function getMockPreview(conversationId: string): string {
  let hash = 0;
  for (let i = 0; i < conversationId.length; i++) {
    hash = (hash << 5) - hash + conversationId.charCodeAt(i);
    hash |= 0;
  }
  return MOCK_MESSAGE_PREVIEWS[Math.abs(hash) % MOCK_MESSAGE_PREVIEWS.length];
}

/** Determine mock online status from participant ID */
function isMockOnline(participantId: string): boolean {
  if (MOCK_ONLINE_IDS.size === 0) return false;
  return MOCK_ONLINE_IDS.has(participantId);
}

// ============================================================================
// Utility helpers
// ============================================================================

function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  if (isYesterday(date)) return "Yesterday";

  return format(date, "MMM d");
}

function formatMessageTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, "h:mm a");
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d, yyyy");
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getRoleBadgeColor(role: string): string {
  const r = role?.toLowerCase() || "";
  if (r.includes("investor")) return "bg-blue-100 text-blue-700";
  if (r.includes("sme") || r.includes("business")) return "bg-[#F4FFFC] text-[#008060]";
  if (r.includes("dev") || r.includes("development")) return "bg-purple-100 text-purple-700";
  if (r.includes("admin")) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-600";
}

function getRoleLabel(accessType: string): string {
  switch (accessType) {
    case "sme":
      return "SME";
    case "investor":
      return "Investor";
    case "development":
    case "dev-org":
      return "Development Org";
    default:
      return "Member";
  }
}

// ============================================================================
// Sub-components
// ============================================================================

/** Online status indicator dot */
function OnlineIndicator({ isOnline, size = "sm" }: { isOnline: boolean; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-3 w-3" : "h-2.5 w-2.5";
  return (
    <span
      className={cn(
        "rounded-full border-2 border-white absolute bottom-0 right-0",
        sizeClass,
        isOnline ? "bg-green-500" : "bg-gray-300",
      )}
    />
  );
}

/** Typing indicator with animated dots */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md w-fit">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

/** Message status indicator (sent / delivered / read) */
function MessageStatus({ readBy, deliveredTo, currentUserId }: {
  readBy: string[];
  deliveredTo: string[];
  currentUserId: string;
}) {
  const othersRead = readBy.filter((id) => id !== currentUserId).length > 0;
  const othersDelivered = deliveredTo.filter((id) => id !== currentUserId).length > 0;

  if (othersRead) {
    return <CheckCheck className="w-3.5 h-3.5 text-[#008060]" />;
  }
  if (othersDelivered) {
    return <CheckCheck className="w-3.5 h-3.5 text-gray-400" />;
  }
  return <Check className="w-3.5 h-3.5 text-gray-400" />;
}

// ============================================================================
// Conversation List Item
// ============================================================================

function ConversationListItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: ConversationItem;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 border-l-3",
        isActive
          ? "bg-[#F4FFFC] border-l-[#008060]"
          : "border-l-transparent",
      )}
    >
      {/* Avatar with online indicator */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarImage src={conversation.avatar} alt={conversation.name} />
          <AvatarFallback className="bg-[#F4FFFC] text-[#008060] font-semibold text-sm">
            {getInitials(conversation.name)}
          </AvatarFallback>
        </Avatar>
        <OnlineIndicator isOnline={conversation.isOnline} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn(
              "text-sm truncate max-w-[160px]",
              conversation.unreadCount > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700",
            )}
          >
            {conversation.name}
          </span>
          <span className="text-[11px] text-gray-400 flex-shrink-0 ml-2">
            {formatRelativeTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p
            className={cn(
              "text-xs truncate max-w-[180px]",
              conversation.unreadCount > 0
                ? "text-gray-600 font-medium"
                : "text-gray-400",
            )}
          >
            {conversation.lastMessagePreview || conversation.businessName}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 ml-2 min-w-[20px] h-5 rounded-full bg-[#008060] text-white text-[10px] font-bold flex items-center justify-center px-1.5">
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// Conversation List (Left Pane)
// ============================================================================

function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  isLoading,
  search,
  onSearchChange,
  filterTab,
  onFilterTabChange,
  sortMode,
  onSortModeChange,
  onNewMessage,
  totalCount,
}: {
  conversations: ConversationItem[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  filterTab: FilterTab;
  onFilterTabChange: (tab: FilterTab) => void;
  sortMode: SortMode;
  onSortModeChange: (mode: SortMode) => void;
  onNewMessage: () => void;
  totalCount: number;
}) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filterTabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    {
      key: "unread",
      label: "Unread",
      count: conversations.filter((c) => c.unreadCount > 0).length,
    },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Messages</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#F4FFFC] text-[#008060]">
              {totalCount}
            </span>
          </div>
          <Button
            variant="primary"
            size="small"
            className="!px-3 !py-1.5 text-xs"
            onClick={onNewMessage}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] bg-gray-50"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs & sort */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onFilterTabChange(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                filterTab === tab.key
                  ? "bg-[#F4FFFC] text-[#008060]"
                  : "text-gray-500 hover:bg-gray-100",
              )}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="ml-1 text-[10px] font-bold">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
        <div ref={sortRef} className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Sort conversations"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
              {(
                [
                  { key: "recent", label: "Most Recent" },
                  { key: "unread", label: "Unread First" },
                  { key: "name", label: "By Name" },
                ] as { key: SortMode; label: string }[]
              ).map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    onSortModeChange(option.key);
                    setShowSortMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-xs transition-colors",
                    sortMode === option.key
                      ? "bg-[#F4FFFC] text-[#008060] font-medium"
                      : "text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {option.label}
                  {sortMode === option.key && <Check className="w-3 h-3 inline ml-1" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {search
                ? "No conversations match your search"
                : filterTab === "unread"
                  ? "No unread conversations"
                  : filterTab === "archived"
                    ? "No archived conversations"
                    : "No conversations yet"}
            </p>
            <p className="text-xs text-gray-400 max-w-[220px]">
              {search
                ? "Try a different search term."
                : "Start a new conversation from the networking or SME directory pages."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                isActive={activeConversationId === conv.id}
                onClick={() => onSelectConversation(conv.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Message Thread (Right Pane)
// ============================================================================

function MessageThread({
  conversationId,
  conversationName,
  conversationAvatar,
  conversationBusinessName,
  conversationIsOnline,
  conversationParticipants,
  currentUserId,
  onBack,
  onOpenContactInfo,
}: {
  conversationId: string;
  conversationName: string;
  conversationAvatar: string;
  conversationBusinessName: string;
  conversationIsOnline: boolean;
  conversationParticipants: ChatParticipant[];
  currentUserId: string;
  onBack: () => void;
  onOpenContactInfo: () => void;
}) {
  const [input, setInput] = useState("");
  const [messagePage, setMessagePage] = useState(1);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const {
    messages: apiMessages,
    isLoading,
    hasNextPage,
    pagination,
  } = useGetConversationMessages(conversationId, {
    page: messagePage,
    limit: 50,
  });

  const { sendMessage, markConversationAsRead } = useMessages();

  // Mark conversation as read when opening
  useEffect(() => {
    if (conversationId) {
      markConversationAsRead.mutate(conversationId);
    }
    // Reset message page when changing conversation
    setMessagePage(1);
    setInput("");
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter deleted messages
  const messages = useMemo(() => {
    return (apiMessages || []).filter((msg) => !msg.deletedAt);
  }, [apiMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagePage === 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, messagePage]);

  // Close actions menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const messageRequest = createSendMessageRequest(conversationId, input.trim());
    const validationErrors = validateMessageRequest(messageRequest);

    if (validationErrors.length > 0) {
      toast.error(validationErrors.join(", "));
      return;
    }

    sendMessage.mutate(messageRequest, {
      onSuccess: () => {
        setInput("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to send message.");
      },
    });
  }, [input, conversationId, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date for separators
  const messageGroups = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    messages.forEach((msg) => {
      const msgDate = format(new Date(msg.createdAt), "yyyy-MM-dd");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msg.createdAt, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  const characterCount = input.length;
  const showCharCount = characterCount > 1500;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Conversation header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          {/* Back button (mobile only) */}
          <button
            onClick={onBack}
            className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <button onClick={onOpenContactInfo} className="relative flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversationAvatar} alt={conversationName} />
              <AvatarFallback className="bg-[#F4FFFC] text-[#008060] font-semibold text-sm">
                {getInitials(conversationName)}
              </AvatarFallback>
            </Avatar>
            <OnlineIndicator isOnline={conversationIsOnline} size="sm" />
          </button>

          {/* Name & status */}
          <button onClick={onOpenContactInfo} className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                {conversationName}
              </span>
              <Badge
                variant="status"
                className={cn("text-[10px] px-1.5 py-0", getRoleBadgeColor(conversationBusinessName))}
              >
                {conversationBusinessName || "Member"}
              </Badge>
            </div>
            <span className="text-xs text-gray-400">
              {conversationIsOnline ? "Online" : "Offline"}
            </span>
          </button>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors hidden sm:flex"
            title="Voice call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors hidden sm:flex"
            title="Video call"
          >
            <Video className="w-4 h-4" />
          </button>
          <div ref={actionsRef} className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title="More actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={() => {
                    onOpenContactInfo();
                    setShowActions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Contact Info
                </button>
                <button
                  onClick={() => setShowActions(false)}
                  className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                >
                  <BellOff className="w-3.5 h-3.5" />
                  Mute Notifications
                </button>
                <button
                  onClick={() => setShowActions(false)}
                  className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Block Contact
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 bg-gray-50/50">
        {/* Load more button */}
        {hasNextPage && (
          <div className="text-center mb-4">
            <button
              onClick={() => setMessagePage((p) => p + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#008060] bg-white border border-gray-200 rounded-full hover:bg-[#F4FFFC] transition-colors"
            >
              <Clock className="w-3 h-3" />
              Load older messages
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2Icon className="w-6 h-6 animate-spin text-[#008060]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-16">
            <div className="w-16 h-16 rounded-full bg-[#F4FFFC] flex items-center justify-center mb-4">
              <Send className="w-7 h-7 text-[#008060]" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">No messages yet</p>
            <p className="text-xs text-gray-400 max-w-[240px]">
              Send a message to start the conversation with {conversationName}.
            </p>
          </div>
        ) : (
          messageGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded-full">
                  {formatDateSeparator(group.date)}
                </span>
              </div>

              {/* Messages in group */}
              {group.messages.map((msg, msgIdx) => {
                const isOwn = msg.senderId === currentUserId;
                const showAvatar =
                  msgIdx === 0 ||
                  group.messages[msgIdx - 1].senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-1",
                      isOwn ? "justify-end" : "justify-start",
                      showAvatar && msgIdx > 0 ? "mt-3" : "",
                    )}
                  >
                    {/* Their avatar */}
                    {!isOwn && showAvatar && (
                      <div className="flex-shrink-0 mr-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={msg.senderDetails?.image}
                            alt={msg.senderDetails?.name}
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-[10px] font-semibold">
                            {getInitials(msg.senderDetails?.name || "")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    {!isOwn && !showAvatar && <div className="w-7 mr-2 flex-shrink-0" />}

                    {/* Bubble */}
                    <div
                      className={cn(
                        "max-w-[70%] group",
                        isOwn ? "items-end" : "items-start",
                      )}
                    >
                      {/* Sender name for received messages */}
                      {!isOwn && showAvatar && (
                        <p className="text-[10px] font-medium text-gray-500 mb-0.5 ml-1">
                          {msg.senderDetails?.name}
                        </p>
                      )}
                      <div
                        className={cn(
                          "px-3.5 py-2 text-sm leading-relaxed",
                          isOwn
                            ? "bg-[#008060] text-white rounded-2xl rounded-br-md"
                            : "bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 shadow-sm",
                        )}
                      >
                        {msg.content}
                      </div>
                      {/* Timestamp & status */}
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-0.5 px-1",
                          isOwn ? "justify-end" : "justify-start",
                        )}
                      >
                        <span className="text-[10px] text-gray-400">
                          {formatMessageTimestamp(msg.createdAt)}
                        </span>
                        {isOwn && (
                          <MessageStatus
                            readBy={msg.readBy || []}
                            deliveredTo={msg.deliveredTo || []}
                            currentUserId={currentUserId}
                          />
                        )}
                        {msg.edited && (
                          <span className="text-[10px] text-gray-400 italic">edited</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message composer */}
      <div className="border-t border-gray-200 bg-white">
        {/* Character count */}
        {showCharCount && (
          <div className="px-4 py-1 text-right">
            <span
              className={cn(
                "text-[10px]",
                characterCount > 1900 ? "text-red-500 font-medium" : "text-gray-400",
              )}
            >
              {characterCount}/2000
            </span>
          </div>
        )}

        <form
          className="px-4 lg:px-6 py-3 flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          {/* Attachment button */}
          <button
            type="button"
            className="flex-shrink-0 p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mb-0.5"
            title="Attach file"
            onClick={() => toast.info("File attachments coming soon!")}
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setInput(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              maxLength={2000}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/20 focus:border-[#008060] bg-gray-50 placeholder:text-gray-400"
              style={{ minHeight: "40px", maxHeight: "120px" }}
            />
          </div>

          {/* Emoji button */}
          <button
            type="button"
            className="flex-shrink-0 p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors mb-0.5"
            title="Emoji"
            onClick={() => toast.info("Emoji picker coming soon!")}
          >
            <Smile className="w-4.5 h-4.5" />
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || sendMessage.isPending}
            className={cn(
              "flex-shrink-0 p-2.5 rounded-xl transition-all mb-0.5",
              input.trim()
                ? "bg-[#008060] text-white hover:bg-[#006d52] shadow-sm"
                : "bg-gray-100 text-gray-300 cursor-not-allowed",
            )}
            title="Send message"
          >
            {sendMessage.isPending ? (
              <Loader2Icon className="w-4.5 h-4.5 animate-spin" />
            ) : (
              <Send className="w-4.5 h-4.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// Contact Info Dialog
// ============================================================================

function ContactInfoDialog({
  open,
  onOpenChange,
  participant,
  conversationId,
  onBlock,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: ChatParticipant | null;
  conversationId: string;
  onBlock?: () => void;
}) {
  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" hideIcon>
        <DialogHeader>
          <DialogTitle>Contact Information</DialogTitle>
          <DialogDescription>
            Details about this conversation participant.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Avatar */}
          <Avatar className="h-20 w-20">
            <AvatarImage src={participant.image} alt={participant.name} />
            <AvatarFallback className="bg-[#F4FFFC] text-[#008060] font-bold text-2xl">
              {getInitials(participant.name)}
            </AvatarFallback>
          </Avatar>

          {/* Name & business */}
          <div className="text-center">
            <h3 className="font-bold text-lg text-gray-900">{participant.name}</h3>
            {participant.businessName && (
              <Badge
                variant="status"
                className={cn("mt-1 text-xs", getRoleBadgeColor(participant.businessName))}
              >
                {participant.businessName}
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="w-full space-y-3 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Email</span>
              <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                {participant.email || "Not available"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Organization</span>
              <span className="text-xs font-medium text-gray-700">
                {participant.businessName || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Member ID</span>
              <span className="text-xs font-medium text-gray-500 font-mono">
                {participant.id?.slice(0, 8)}...
              </span>
            </div>
          </div>

          {/* Shared files placeholder */}
          <div className="w-full">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Shared Files</h4>
            <div className="flex items-center justify-center py-6 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">No shared files yet</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 w-full">
            <Button
              variant="secondary"
              size="small"
              className="flex-1 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="secondary"
              size="small"
              className="flex-1 text-xs"
              onClick={() => {
                toast.info("Notifications muted for this conversation.");
                onOpenChange(false);
              }}
            >
              <BellOff className="w-3.5 h-3.5" />
              Mute
            </Button>
            <Button
              variant="danger"
              size="small"
              className="flex-1 text-xs"
              onClick={() => {
                if (onBlock) onBlock();
                onOpenChange(false);
              }}
            >
              <UserX className="w-3.5 h-3.5" />
              Block
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// New Conversation Dialog
// ============================================================================

function NewConversationDialog({
  open,
  onOpenChange,
  currentUserId,
  onConversationCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
  onConversationCreated: (conversationId: string) => void;
}) {
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { createConversation } = useCreateConversation();
  const { sendMessage } = useMessages();

  // Mock users for recipient search
  // In production, this would use a user search API
  const MOCK_USERS = useMemo(
    () => [
      { id: "mock-user-1", name: "Sarah Johnson", businessName: "TechVentures Inc.", email: "sarah@techventures.com" },
      { id: "mock-user-2", name: "David Okafor", businessName: "AfriGrow Capital", email: "david@afrigrow.com" },
      { id: "mock-user-3", name: "Maria Santos", businessName: "Green Energy Solutions", email: "maria@greenenergy.co" },
      { id: "mock-user-4", name: "James Mwangi", businessName: "AgriTech Kenya", email: "james@agritech.ke" },
      { id: "mock-user-5", name: "Fatima Al-Rashid", businessName: "MENA Fund Partners", email: "fatima@menafund.com" },
    ],
    [],
  );

  const filteredUsers = recipientSearch
    ? MOCK_USERS.filter(
        (u) =>
          u.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
          u.businessName.toLowerCase().includes(recipientSearch.toLowerCase()),
      )
    : [];

  const handleCreate = async () => {
    if (!recipientId || !message.trim()) {
      toast.error("Please select a recipient and enter a message.");
      return;
    }

    setIsSending(true);
    try {
      const conversation = await createConversation([currentUserId, recipientId]);
      const conversationId = conversation?.data?.id ?? (conversation?.data as any)?._id;

      if (conversationId && message.trim()) {
        sendMessage.mutate(
          createSendMessageRequest(conversationId, message.trim()),
          {
            onSuccess: () => {
              toast.success(`Conversation started with ${recipientName}!`);
              setRecipientSearch("");
              setRecipientId("");
              setRecipientName("");
              setMessage("");
              onOpenChange(false);
              onConversationCreated(conversationId);
            },
          },
        );
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to create conversation.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" hideIcon>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Search for a user and start a new conversation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Recipient search */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Recipient
            </label>
            {recipientName ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#F4FFFC] border border-[#008060]/20 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-[#008060]/10 flex items-center justify-center text-[#008060] text-xs font-bold">
                  {getInitials(recipientName)}
                </div>
                <span className="text-sm font-medium text-gray-700 flex-1">{recipientName}</span>
                <button
                  onClick={() => {
                    setRecipientId("");
                    setRecipientName("");
                    setRecipientSearch("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  placeholder="Search by name or organization..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#008060]/30 focus:border-[#008060]"
                />
                {/* Search results dropdown */}
                {recipientSearch && filteredUsers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-40 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setRecipientId(user.id);
                          setRecipientName(user.name);
                          setRecipientSearch("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#F4FFFC] text-[#008060] flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.businessName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {recipientSearch && filteredUsers.length === 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-4 text-center">
                    <p className="text-xs text-gray-400">No users found. Try a different search.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#008060]/30 focus:border-[#008060]"
              placeholder="Type your first message..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              state={isSending ? "loading" : !recipientId || !message.trim() ? "disabled" : "default"}
            >
              <Send className="w-4 h-4" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Empty State (No conversation selected)
// ============================================================================

function EmptyConversationState({ onNewMessage }: { onNewMessage: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50/30 px-8 text-center">
      <div className="w-24 h-24 rounded-full bg-[#F4FFFC] flex items-center justify-center mb-6">
        <MessageSquarePlus className="w-10 h-10 text-[#008060]" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Select a conversation
      </h3>
      <p className="text-sm text-gray-500 max-w-[320px] mb-6">
        Choose a conversation from the list to start messaging, or start a new conversation.
      </p>
      <Button variant="primary" onClick={onNewMessage}>
        <MessageSquarePlus className="w-4 h-4" />
        Start New Conversation
      </Button>
    </div>
  );
}

// ============================================================================
// No Conversations State
// ============================================================================

function NoConversationsState({ onNewMessage }: { onNewMessage: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center col-span-full">
      <div className="w-24 h-24 rounded-full bg-[#F4FFFC] flex items-center justify-center mb-6">
        <UsersIcon className="w-10 h-10 text-[#008060]" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        Start your first conversation
      </h3>
      <p className="text-sm text-gray-500 max-w-[380px] mb-6">
        Connect with investors, SMEs, and development organizations on Capalyse. Start a conversation from the networking or SME directory pages, or create one directly.
      </p>
      <Button variant="primary" onClick={onNewMessage}>
        <MessageSquarePlus className="w-4 h-4" />
        New Conversation
      </Button>
    </div>
  );
}

// ============================================================================
// Main Page Component
// ============================================================================

const ConnectionsPage = () => {
  const params = useParams();
  const accessType = params?.accessType as string;
  const { data: session } = useSession();
  const currentUserId = (session?.user?.id as string) || "";

  // State
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch conversations
  const { conversations: rawConversations, isLoading, pagination } = useGetConversations({
    page,
    limit: 50,
  });

  // Process conversations into display format
  const conversations: ConversationItem[] = useMemo(() => {
    return rawConversations.map((conv) => {
      const chatHeader = getChatHeader(
        currentUserId,
        conv.participantsDetails as ChatParticipant[],
      );
      const otherParticipant =
        conv.participantsDetails?.find((p) => p.id !== currentUserId) ||
        conv.participantsDetails?.[0];
      const unreadCount = conv.unreadCount?.[currentUserId] || 0;

      // Populate MOCK_ONLINE_IDS for roughly 30% of users
      if (otherParticipant) {
        const charSum = otherParticipant.id
          .split("")
          .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
        if (charSum % 3 === 0) {
          MOCK_ONLINE_IDS.add(otherParticipant.id);
        }
      }

      return {
        id: conv.id,
        name: chatHeader?.name ?? otherParticipant?.name ?? "Unknown",
        avatar: chatHeader?.img ?? "",
        businessName: otherParticipant?.businessName || "Member",
        lastMessageAt: conv.lastMessageAt || conv.updatedAt,
        lastMessagePreview: getMockPreview(conv.id),
        unreadCount,
        isGroup: conv.isGroup,
        participantCount: conv.participantsDetails?.length || 0,
        isOnline: otherParticipant ? isMockOnline(otherParticipant.id) : false,
        participantsDetails: conv.participantsDetails as ChatParticipant[],
      };
    });
  }, [rawConversations, currentUserId]);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    // Text search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.businessName.toLowerCase().includes(q) ||
          c.lastMessagePreview.toLowerCase().includes(q),
      );
    }

    // Tab filter
    if (filterTab === "unread") {
      result = result.filter((c) => c.unreadCount > 0);
    }
    // "archived" tab currently shows empty (no archived API support yet)
    if (filterTab === "archived") {
      result = [];
    }

    // Sort
    switch (sortMode) {
      case "recent":
        result.sort((a, b) => {
          const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "unread":
        result.sort((a, b) => b.unreadCount - a.unreadCount);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [conversations, debouncedSearch, filterTab, sortMode]);

  // Active conversation data
  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Active conversation other participant (for contact info)
  const activeParticipant = useMemo(() => {
    if (!activeConversation) return null;
    return (
      activeConversation.participantsDetails?.find((p) => p.id !== currentUserId) ||
      activeConversation.participantsDetails?.[0] ||
      null
    );
  }, [activeConversation, currentUserId]);

  // Handlers
  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setShowMobileChat(true);
  }, []);

  const handleBackToList = useCallback(() => {
    setShowMobileChat(false);
  }, []);

  const handleNewMessage = useCallback(() => {
    setNewMessageOpen(true);
  }, []);

  const handleConversationCreated = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setShowMobileChat(true);
  }, []);

  const handleOpenContactInfo = useCallback(() => {
    setContactInfoOpen(true);
  }, []);

  const { blockConversation } = useMessages();

  const handleBlockConversation = useCallback(() => {
    if (activeConversationId) {
      blockConversation.mutate(activeConversationId, {
        onSuccess: () => {
          toast.success("Contact blocked.");
          setActiveConversationId(null);
          setShowMobileChat(false);
        },
        onError: () => {
          toast.error("Failed to block contact.");
        },
      });
    }
  }, [activeConversationId, blockConversation]);

  // Role-aware placeholder text
  const roleConnectionHint = useMemo(() => {
    switch (accessType) {
      case "sme":
        return "Connect with investors, development organizations, and mentors.";
      case "investor":
        return "Connect with SMEs, other investors, and development organizations.";
      case "development":
      case "dev-org":
        return "Connect with SMEs in your programs, investors, and partner organizations.";
      default:
        return "Connect with other members on Capalyse.";
    }
  }, [accessType]);

  const totalCount = pagination?.total || conversations.length;

  // If no conversations at all and not loading
  const hasNoConversations = !isLoading && rawConversations.length === 0;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Page header (visible on all screens) */}
      <div className="px-4 lg:px-0 py-3 lg:py-0 lg:mb-0 flex-shrink-0">
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-gray-900">Connections</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#F4FFFC] text-[#008060]">
              {totalCount}
            </span>
          </div>
          <Button
            variant="primary"
            size="small"
            className="!px-3 !py-1.5 text-xs"
            onClick={handleNewMessage}
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New
          </Button>
        </div>
      </div>

      {hasNoConversations ? (
        <div className="flex-1 flex">
          <NoConversationsState onNewMessage={handleNewMessage} />
        </div>
      ) : (
        /* Split pane layout */
        <div className="flex-1 flex overflow-hidden rounded-lg border border-gray-200 lg:mx-0">
          {/* Left pane: conversation list */}
          <div
            className={cn(
              "w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 h-full",
              showMobileChat ? "hidden lg:flex lg:flex-col" : "flex flex-col",
            )}
          >
            <ConversationList
              conversations={filteredConversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              isLoading={isLoading}
              search={search}
              onSearchChange={setSearch}
              filterTab={filterTab}
              onFilterTabChange={setFilterTab}
              sortMode={sortMode}
              onSortModeChange={setSortMode}
              onNewMessage={handleNewMessage}
              totalCount={totalCount}
            />
          </div>

          {/* Right pane: message thread or empty state */}
          <div
            className={cn(
              "flex-1 h-full",
              showMobileChat ? "flex flex-col" : "hidden lg:flex lg:flex-col",
            )}
          >
            {activeConversation ? (
              <MessageThread
                conversationId={activeConversation.id}
                conversationName={activeConversation.name}
                conversationAvatar={activeConversation.avatar}
                conversationBusinessName={activeConversation.businessName}
                conversationIsOnline={activeConversation.isOnline}
                conversationParticipants={activeConversation.participantsDetails}
                currentUserId={currentUserId}
                onBack={handleBackToList}
                onOpenContactInfo={handleOpenContactInfo}
              />
            ) : (
              <EmptyConversationState onNewMessage={handleNewMessage} />
            )}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <NewConversationDialog
        open={newMessageOpen}
        onOpenChange={setNewMessageOpen}
        currentUserId={currentUserId}
        onConversationCreated={handleConversationCreated}
      />

      <ContactInfoDialog
        open={contactInfoOpen}
        onOpenChange={setContactInfoOpen}
        participant={activeParticipant}
        conversationId={activeConversationId || ""}
        onBlock={handleBlockConversation}
      />
    </div>
  );
};

export default ConnectionsPage;
