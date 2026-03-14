"use client";

import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useGetNotifications,
  useGetSettings,
  useNotifications,
} from "@/hooks/useNotification";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  BellIcon,
  BellOffIcon,
  CheckCheckIcon,
  InfoIcon,
  Loader2Icon,
  MailIcon,
  SettingsIcon,
  SmartphoneIcon,
  TrashIcon,
  TrendingUpIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FilterTab = "all" | "unread" | "read";

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
};

const getNotificationIcon = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "investment":
    case "interest":
      return <TrendingUpIcon className="w-5 h-5 text-green" />;
    case "message":
      return <MailIcon className="w-5 h-5 text-blue-500" />;
    case "system":
    case "alert":
      return <InfoIcon className="w-5 h-5 text-yellow-500" />;
    case "user":
    case "profile":
      return <UserIcon className="w-5 h-5 text-purple-500" />;
    default:
      return <BellIcon className="w-5 h-5 text-muted-foreground" />;
  }
};

const getNotificationIconBg = (type?: string) => {
  switch (type?.toLowerCase()) {
    case "investment":
    case "interest":
      return "bg-[#F4FFFC] border-[#ABD2C7]";
    case "message":
      return "bg-blue-50 border-blue-200";
    case "system":
    case "alert":
      return "bg-yellow-50 border-yellow-200";
    case "user":
    case "profile":
      return "bg-purple-50 border-purple-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  const { data: notifications = [], isLoading, refetch } = useGetNotifications();
  const { data: settings } = useGetSettings();
  const { useMarkSingle_Read, useMarkAll_read, delNotification } = useNotifications();

  const filtered = (notifications as Notification[]).filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = (notifications as Notification[]).filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    useMarkSingle_Read.mutate(id, {
      onSuccess: () => {
        toast.success("Marked as read");
        refetch();
      },
      onError: () => toast.error("Failed to mark as read"),
    });
  };

  const handleMarkAllRead = () => {
    useMarkAll_read.mutate(undefined, {
      onSuccess: () => {
        toast.success("All notifications marked as read");
        refetch();
      },
      onError: () => toast.error("Failed to mark all as read"),
    });
  };

  const handleDelete = (id: string) => {
    delNotification.mutate(id, {
      onSuccess: () => {
        toast.success("Notification deleted");
        refetch();
      },
      onError: () => toast.error("Failed to delete notification"),
    });
  };

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "read", label: "Read" },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
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
            onClick={() => setShowSettings((v) => !v)}
            className={cn(
              "p-2 rounded-md transition hover:bg-gray-100",
              showSettings ? "bg-[#F4FFFC] text-green border border-green" : "text-muted-foreground",
            )}
            aria-label="Notification settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-6 shadow-none border border-[#ABD2C7]">
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">Notification Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-gray-100 transition"
                aria-label="Close settings"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border border-[#ABD2C7] bg-[#F4FFFC] text-green">
                    <MailIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEmailEnabled((v) => !v)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    emailEnabled ? "bg-green" : "bg-gray-200",
                  )}
                  aria-label="Toggle email notifications"
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      emailEnabled ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border border-[#ABD2C7] bg-[#F4FFFC] text-green">
                    <SmartphoneIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive in-app push notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPushEnabled((v) => !v)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    pushEnabled ? "bg-green" : "bg-gray-200",
                  )}
                  aria-label="Toggle push notifications"
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      pushEnabled ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
              </div>

              {/* Notification Preferences */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md border border-[#ABD2C7] bg-[#F4FFFC] text-green">
                    <BellIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Notification Preferences</p>
                    <p className="text-xs text-muted-foreground">
                      Manage which activities trigger notifications
                    </p>
                  </div>
                </div>
                <Button variant="secondary" size="small">
                  Manage
                </Button>
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
                ? "bg-[#F4FFFC] text-green border border-green"
                : "text-muted-foreground hover:bg-gray-100",
            )}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-green text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-none">
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
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="p-4 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] mb-4">
            <BellOffIcon className="w-10 h-10 text-green" />
          </div>
          <p className="font-semibold text-lg mb-1">
            {filter === "unread"
              ? "No unread notifications"
              : filter === "read"
                ? "No read notifications"
                : "No notifications yet"}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">
            {filter === "all"
              ? "When you receive notifications about your activity, they will appear here."
              : filter === "unread"
                ? "You are all caught up! Check back later for new updates."
                : "Notifications you have already read will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification: Notification) => {
            const id = notification.id || notification._id || "";
            return (
              <Card
                key={id}
                className={cn(
                  "shadow-none transition-colors",
                  !notification.read && "border-l-4 border-l-green bg-[#F4FFFC]/40",
                )}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "p-2 rounded-md border shrink-0",
                        getNotificationIconBg(notification.type),
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
                            <span className="inline-block h-2 w-2 rounded-full bg-green shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                          {notification.createdAt
                            ? formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                        {notification.message || notification.body || ""}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkRead(id)}
                            disabled={useMarkSingle_Read.isPending}
                            className="flex items-center gap-1.5 text-xs text-green font-semibold hover:underline disabled:opacity-50 transition"
                          >
                            {useMarkSingle_Read.isPending ? (
                              <Loader2Icon className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCheckIcon className="w-3.5 h-3.5" />
                            )}
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={delNotification.isPending}
                          className="flex items-center gap-1.5 text-xs text-red-500 font-semibold hover:underline disabled:opacity-50 transition ml-auto"
                        >
                          {delNotification.isPending ? (
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
          })}
        </div>
      )}
    </div>
  );
}
