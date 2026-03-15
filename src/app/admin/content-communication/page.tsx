"use client";

import { useState } from "react";
import { SearchForm } from "@/components/search-form";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import {
  useAdminSendBulkNotifications,
  useAdminNotifications,
  useAdminNotificationStats,
  type BulkNotificationPayload,
} from "@/hooks/admin/notifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Loader2Icon,
  SendIcon,
  BellIcon,
  MegaphoneIcon,
  UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

const NOTIFICATION_TYPES = [
  { label: "General", value: "general" },
  { label: "System", value: "system" },
  { label: "Alert", value: "alert" },
  { label: "Investment", value: "investment" },
  { label: "Update", value: "update" },
];

const TARGET_ROLES = [
  { label: "All Users", value: "all" },
  { label: "SMEs", value: "sme" },
  { label: "Investors", value: "investor" },
  { label: "Dev Organizations", value: "dev_org" },
];

const getTypeClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case "system":
      return "bg-blue-100 text-blue-800";
    case "alert":
      return "bg-red-100 text-red-800";
    case "investment":
      return "bg-green-100 text-green-800";
    case "update":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const emptyForm: BulkNotificationPayload = {
  title: "",
  message: "",
  type: "general",
  targetRoles: [],
};

export default function ContentCommunicationPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [form, setForm] = useState<BulkNotificationPayload>(emptyForm);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data: notificationsData, isLoading } = useAdminNotifications();
  const { data: statsData, isLoading: statsLoading } = useAdminNotificationStats();
  const sendBulkMutation = useAdminSendBulkNotifications();

  const notifications: any[] = notificationsData?.data || notificationsData || [];
  const stats = statsData?.data || statsData;

  const filtered = notifications.filter((n: any) => {
    const matchesSearch =
      !search ||
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.message?.toLowerCase().includes(search.toLowerCase());
    const matchesType =
      typeFilter === "all" || n.type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const handleRoleToggle = (role: string) => {
    if (role === "all") {
      setSelectedRoles(
        selectedRoles.includes("all") ? [] : ["all"],
      );
      return;
    }
    const newRoles = selectedRoles.filter((r) => r !== "all");
    if (newRoles.includes(role)) {
      setSelectedRoles(newRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...newRoles, role]);
    }
  };

  const handleSend = () => {
    if (!form.title || !form.message) {
      toast.error("Title and message are required");
      return;
    }
    if (selectedRoles.length === 0) {
      toast.error("Please select at least one target audience");
      return;
    }

    const payload: BulkNotificationPayload = {
      ...form,
      targetRoles: selectedRoles.includes("all")
        ? ["sme", "investor", "dev_org"]
        : selectedRoles,
    };

    sendBulkMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Notification sent successfully");
        setComposeOpen(false);
        setForm(emptyForm);
        setSelectedRoles([]);
      },
      onError: () => toast.error("Failed to send notification"),
    });
  };

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.messageBadge,
      label: "Total Notifications",
      amount: stats?.total ?? notifications.length,
    },
    {
      id: 2,
      icon: CIcons.stickyNote,
      label: "Unread",
      amount: stats?.unread ?? notifications.filter((n: any) => !n.read).length,
    },
    {
      id: 3,
      icon: CIcons.walletMoney,
      label: "Sent Today",
      amount: stats?.sentToday ?? "—",
    },
  ];

  const columns = [
    {
      header: "Title",
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium max-w-[250px] truncate">
            {row.title || "Notification"}
          </span>
          <span className="text-xs text-muted-foreground max-w-[250px] truncate">
            {row.message || row.body || ""}
          </span>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: (row: any) => (
        <Badge variant="status" className={cn("capitalize", getTypeClass(row.type))}>
          {row.type || "general"}
        </Badge>
      ),
    },
    {
      header: "Audience",
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground capitalize">
          {row.targetRoles?.join(", ") || row.audience || "All"}
        </span>
      ),
    },
    {
      header: "Sent",
      accessor: (row: any) =>
        row.createdAt
          ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
          : "—",
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="status"
          className={
            row.read
              ? "bg-gray-100 text-gray-600"
              : "bg-green-100 text-green-800"
          }
        >
          {row.read ? "Read" : "Delivered"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {statsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
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

      {/* Filters + Actions */}
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Notifications
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {filtered.length}
            </span>
          </p>
        </div>
        <div className="flex gap-2 items-center w-full lg:w-auto justify-end flex-wrap">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {NOTIFICATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchForm
            className="w-full sm:w-auto md:min-w-sm"
            inputClassName="h-11 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={() => {
              setForm(emptyForm);
              setSelectedRoles([]);
              setComposeOpen(true);
            }}
          >
            <MegaphoneIcon className="w-4 h-4 mr-1" />
            Send Notification
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BellIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No notifications found</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Send your first bulk notification to platform users.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => {
              setForm(emptyForm);
              setSelectedRoles([]);
              setComposeOpen(true);
            }}
          >
            <MegaphoneIcon className="w-4 h-4 mr-1" />
            Send Notification
          </Button>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={filtered}
          totalPages={Math.ceil(filtered.length / 10)}
        />
      )}

      {/* Compose Notification Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Bulk Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Notification title"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Write your notification message..."
                rows={4}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notification Type</label>
              <Select
                value={form.type || "general"}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Target Audience *
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleToggle(role.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition",
                      selectedRoles.includes(role.value)
                        ? "bg-[#F4FFFC] text-green border-green"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <UsersIcon className="w-3.5 h-3.5" />
                    {role.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="small"
                onClick={() => setComposeOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleSend}
                state={sendBulkMutation.isPending ? "loading" : "default"}
              >
                <SendIcon className="w-3.5 h-3.5 mr-1" />
                Send Notification
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
