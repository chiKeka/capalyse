"use client";

import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetNotifications,
  useGetSettings,
  useNotifications,
} from "@/hooks/useNotification";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import {
  ArchiveIcon,
  BellIcon,
  BellOffIcon,
  CheckCheckIcon,
  ClipboardCheckIcon,
  DollarSignIcon,
  InfoIcon,
  Loader2Icon,
  MailIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldIcon,
  SmartphoneIcon,
  TrashIcon,
  TrendingUpIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

type FilterTab = "all" | "unread" | "mentions" | "system";

type Notification = {
  id?: string;
  _id?: string;
  title?: string;
  message?: string;
  body?: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
  actionUrl?: string;
  mentionedUser?: boolean;
};

interface DateGroup {
  label: string;
  notifications: Notification[];
}

// ============================================================================
// Helpers
// ============================================================================

const getNotificationIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "investment":
    case "interest":
    case "funding":
      return <TrendingUpIcon className="w-5 h-5 text-[#008060]" />;
    case "message":
      return <MessageSquareIcon className="w-5 h-5 text-blue-500" />;
    case "system":
    case "alert":
      return <InfoIcon className="w-5 h-5 text-yellow-500" />;
    case "user":
    case "profile":
      return <UserIcon className="w-5 h-5 text-purple-500" />;
    case "program":
    case "compliance":
      return <ClipboardCheckIcon className="w-5 h-5 text-orange-500" />;
    case "security":
      return <ShieldIcon className="w-5 h-5 text-red-500" />;
    default:
      return <BellIcon className="w-5 h-5 text-gray-400" />;
  }
};

const getNotificationIconBg = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "investment":
    case "interest":
    case "funding":
      return "bg-[#F4FFFC] border-[#ABD2C7]";
    case "message":
      return "bg-blue-50 border-blue-200";
    case "system":
    case "alert":
      return "bg-yellow-50 border-yellow-200";
    case "user":
    case "profile":
      return "bg-purple-50 border-purple-200";
    case "program":
    case "compliance":
      return "bg-orange-50 border-orange-200";
    case "security":
      return "bg-red-50 border-red-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

function groupNotificationsByDate(notifications: Notification[]): DateGroup[] {
  const groups: DateGroup[] = [];
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const thisWeek: Notification[] = [];
  const earlier: Notification[] = [];

  notifications.forEach((n) => {
    if (!n.createdAt) {
      earlier.push(n);
      return;
    }
    const date = new Date(n.createdAt);
    if (isToday(date)) {
      today.push(n);
    } else if (isYesterday(date)) {
      yesterday.push(n);
    } else if (isThisWeek(date)) {
      thisWeek.push(n);
    } else {
      earlier.push(n);
    }
  });

  if (today.length > 0) groups.push({ label: "Today", notifications: today });
  if (yesterday.length > 0) groups.push({ label: "Yesterday", notifications: yesterday });
  if (thisWeek.length > 0) groups.push({ label: "This Week", notifications: thisWeek });
  if (earlier.length > 0) groups.push({ label: "Earlier", notifications: earlier });

  return groups;
}

// ============================================================================
// Sub-components
// ============================================================================

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  isMarkingRead,
  isDeleting,
  isSelected,
  onToggleSelect,
  showCheckbox,
  expanded,
  onToggleExpand,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  showCheckbox: boolean;
  expanded: boolean;
  onToggleExpand: (id: string) => void;
}) {
  const id = notification.id || notification._id || "";
  const message = notification.message || notification.body || "";

  return (
    <Card
      className={cn(
        "shadow-none transition-all cursor-pointer hover:shadow-sm",
        !notification.read && "border-l-4 border-l-[#008060] bg-[#F4FFFC]/40",
        isSelected && "ring-2 ring-[#008060]"
      )}
      onClick={() => onToggleExpand(id)}
    >
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          {showCheckbox && (
            <div className="pt-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(id)}
                className="w-4 h-4 rounded border-gray-300 accent-[#008060] cursor-pointer"
              />
            </div>
          )}

          {/* Icon */}
          <div
            className={cn(
              "p-2 rounded-md border shrink-0",
              getNotificationIconBg(notification.type)
            )}
          >
            {getNotificationIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold leading-tight">
                  {notification.title || "Notification"}
                </p>
                {!notification.read && (
                  <span className="inline-block h-2 w-2 rounded-full bg-[#008060] shrink-0" />
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                {notification.createdAt
                  ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                  : ""}
              </span>
            </div>

            <p
              className={cn(
                "text-sm text-gray-500 mt-0.5 leading-snug",
                !expanded && "line-clamp-2"
              )}
            >
              {message}
            </p>

            {/* Expanded Detail */}
            {expanded && message.length > 100 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{message}</p>
                {notification.actionUrl && (
                  <Link
                    href={notification.actionUrl}
                    className="inline-flex items-center gap-1 text-sm text-[#008060] font-medium mt-2 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              {!notification.read && (
                <button
                  onClick={() => onMarkRead(id)}
                  disabled={isMarkingRead}
                  className="flex items-center gap-1.5 text-xs text-[#008060] font-semibold hover:underline disabled:opacity-50 transition"
                >
                  {isMarkingRead ? (
                    <Loader2Icon className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheckIcon className="w-3.5 h-3.5" />
                  )}
                  Mark as read
                </button>
              )}
              {notification.actionUrl && (
                <Link
                  href={notification.actionUrl}
                  className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold hover:underline"
                >
                  View
                </Link>
              )}
              <button
                onClick={() => onDelete(id)}
                disabled={isDeleting}
                className="flex items-center gap-1.5 text-xs text-red-500 font-semibold hover:underline disabled:opacity-50 transition ml-auto"
              >
                {isDeleting ? (
                  <Loader2Icon className="w-3 h-3 animate-spin" />
                ) : (
                  <TrashIcon className="w-3.5 h-3.5" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonNotification() {
  return (
    <Card className="shadow-none">
      <CardContent className="py-4">
        <div className="flex items-start gap-4 animate-pulse">
          <div className="h-10 w-10 rounded-md bg-gray-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/5" />
            <div className="h-3 bg-gray-100 rounded w-4/5" />
            <div className="h-3 bg-gray-100 rounded w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function NotificationsPage() {
  const params = useParams();
  const accessType = params.accessType as string;

  const [filter, setFilter] = useState<FilterTab>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: notifications = [], isLoading, refetch } = useGetNotifications();
  const { data: settings } = useGetSettings();
  const { useMarkSingle_Read, useMarkAll_read, delNotification } = useNotifications();

  // Filtered
  const filtered = useMemo(() => {
    return (notifications as Notification[]).filter((n) => {
      if (filter === "unread") return !n.read;
      if (filter === "mentions") return n.mentionedUser || n.type?.toLowerCase() === "message";
      if (filter === "system") return n.type?.toLowerCase() === "system" || n.type?.toLowerCase() === "alert";
      return true;
    });
  }, [notifications, filter]);

  // Grouped by date
  const groups = useMemo(() => groupNotificationsByDate(filtered), [filtered]);

  const unreadCount = useMemo(
    () => (notifications as Notification[]).filter((n) => !n.read).length,
    [notifications]
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      useMarkSingle_Read.mutate(id, {
        onSuccess: () => {
          toast.success("Marked as read");
          refetch();
        },
        onError: () => toast.error("Failed to mark as read"),
      });
    },
    [useMarkSingle_Read, refetch]
  );

  const handleMarkAllRead = useCallback(() => {
    useMarkAll_read.mutate(undefined, {
      onSuccess: () => {
        toast.success("All notifications marked as read");
        refetch();
      },
      onError: () => toast.error("Failed to mark all as read"),
    });
  }, [useMarkAll_read, refetch]);

  const handleDelete = useCallback(
    (id: string) => {
      delNotification.mutate(id, {
        onSuccess: () => {
          toast.success("Notification deleted");
          setSelectedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
          refetch();
        },
        onError: () => toast.error("Failed to delete notification"),
      });
    },
    [delNotification, refetch]
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleBulkMarkRead = useCallback(() => {
    selectedIds.forEach((id) => handleMarkRead(id));
    setSelectedIds(new Set());
  }, [selectedIds, handleMarkRead]);

  const handleBulkDelete = useCallback(() => {
    selectedIds.forEach((id) => handleDelete(id));
    setSelectedIds(new Set());
  }, [selectedIds, handleDelete]);

  const filterTabs: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "mentions", label: "Messages" },
    { key: "system", label: "System" },
  ];

  const emptyMessages: Record<FilterTab, { title: string; description: string }> = {
    all: {
      title: "No notifications yet",
      description: "When you receive notifications about your activity, they will appear here.",
    },
    unread: {
      title: "No unread notifications",
      description: "You are all caught up! Check back later for new updates.",
    },
    mentions: {
      title: "No messages",
      description: "Message notifications will appear here when someone contacts you.",
    },
    system: {
      title: "No system notifications",
      description: "System announcements and alerts will appear here.",
    },
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#008060] text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button variant="secondary" size="small" onClick={handleBulkMarkRead}>
                <CheckCheckIcon className="w-4 h-4 mr-1" />
                Mark Read ({selectedIds.size})
              </Button>
              <Button variant="danger" size="small" onClick={handleBulkDelete}>
                <TrashIcon className="w-4 h-4 mr-1" />
                Delete ({selectedIds.size})
              </Button>
            </>
          )}
          {unreadCount > 0 && selectedIds.size === 0 && (
            <Button
              variant="secondary"
              size="small"
              onClick={handleMarkAllRead}
              state={useMarkAll_read.isPending ? "loading" : "default"}
            >
              <CheckCheckIcon className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            className={cn(
              "p-2 rounded-md transition hover:bg-gray-100",
              showBulkActions
                ? "bg-[#F4FFFC] text-[#008060] border border-[#008060]"
                : "text-gray-400"
            )}
            aria-label="Toggle selection"
          >
            <ArchiveIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={cn(
              "p-2 rounded-md transition hover:bg-gray-100",
              showSettings
                ? "bg-[#F4FFFC] text-[#008060] border border-[#008060]"
                : "text-gray-400"
            )}
            aria-label="Notification settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <Link
            href={`/${accessType}/settings?tab=notifications`}
            className="p-2 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            title="Notification Preferences"
          >
            <BellIcon className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-6 shadow-none border border-[#ABD2C7]">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">Quick Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100 transition"
                aria-label="Close settings"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border border-[#ABD2C7] bg-[#F4FFFC] text-[#008060]">
                    <MailIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Email Notifications</p>
                    <p className="text-xs text-gray-400">Receive notifications via email</p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailEnabled((v) => !v)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    emailEnabled ? "bg-[#008060]" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      emailEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Push */}
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border border-[#ABD2C7] bg-[#F4FFFC] text-[#008060]">
                    <SmartphoneIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Push Notifications</p>
                    <p className="text-xs text-gray-400">Receive in-app push notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => setPushEnabled((v) => !v)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    pushEnabled ? "bg-[#008060]" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      pushEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Manage Preferences */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border border-[#ABD2C7] bg-[#F4FFFC] text-[#008060]">
                    <BellIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Notification Preferences</p>
                    <p className="text-xs text-gray-400">Manage which activities trigger notifications</p>
                  </div>
                </div>
                <Link href={`/${accessType}/settings?tab=notifications`}>
                  <Button variant="secondary" size="small">
                    Manage
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition",
              filter === tab.key
                ? "bg-[#F4FFFC] text-[#008060] border border-[#008060]"
                : "text-gray-400 hover:bg-gray-100"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-[#008060] text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonNotification key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] mb-4">
            <BellOffIcon className="w-10 h-10 text-[#008060]" />
          </div>
          <p className="font-semibold text-lg mb-1">{emptyMessages[filter].title}</p>
          <p className="text-sm text-gray-400 max-w-sm">{emptyMessages[filter].description}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                {group.label}
              </h3>
              <div className="space-y-3">
                {group.notifications.map((notification) => {
                  const nId = notification.id || notification._id || "";
                  return (
                    <NotificationCard
                      key={nId}
                      notification={notification}
                      onMarkRead={handleMarkRead}
                      onDelete={handleDelete}
                      isMarkingRead={useMarkSingle_Read.isPending}
                      isDeleting={delNotification.isPending}
                      isSelected={selectedIds.has(nId)}
                      onToggleSelect={handleToggleSelect}
                      showCheckbox={showBulkActions}
                      expanded={expandedId === nId}
                      onToggleExpand={handleToggleExpand}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
