"use client";

import { useState, useMemo, useCallback } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Loader2Icon,
  TicketIcon,
  CircleDotIcon,
  ClockIcon,
  CheckCircle2Icon,
  SendIcon,
  UserPlusIcon,
  ChevronDownIcon,
  XIcon,
  AlertTriangleIcon,
} from "lucide-react";
import { toast } from "sonner";

import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { ReusableTable } from "@/components/ui/table";
import { SearchForm } from "@/components/search-form";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  useAdminTickets,
  useAdminTicket,
  useAdminTicketMessages,
  useAdminUsers,
  useAssignTicket,
  useUpdateTicketStatus,
  useSendTicketReply,
  useBulkAssignTickets,
  useBulkUpdateTicketStatus,
  type TicketStatus,
  type TicketPriority,
} from "@/hooks/admin/support";

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: TicketStatus | "" }[] = [
  { label: "All Statuses", value: "" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

const PRIORITY_OPTIONS: { label: string; value: TicketPriority | "" }[] = [
  { label: "All Priorities", value: "" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const getPriorityBadgeClass = (priority: string) => {
  switch (priority) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "resolved":
      return "bg-green-100 text-green-800";
    case "closed":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatStatus = (status: string) =>
  status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "--";

const formatPriority = (priority: string) =>
  priority?.charAt(0).toUpperCase() + priority?.slice(1) || "--";

// ── Main Component ──────────────────────────────────────────────────────────

export default function AdminSupportPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "">("");
  const [assignedFilter, setAssignedFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Selection state for bulk actions
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);

  // Detail panel state
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Bulk action dialog state
  const [bulkActionDialog, setBulkActionDialog] = useState<
    "assign" | "status" | null
  >(null);
  const [bulkAssignUserId, setBulkAssignUserId] = useState("");
  const [bulkStatus, setBulkStatus] = useState<TicketStatus | "">("");

  // Data hooks
  const { data: ticketsData, isLoading } = useAdminTickets({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    assignedTo: assignedFilter || undefined,
    search: search || undefined,
    page,
    pageSize: 20,
  });

  const { data: ticketDetail, isLoading: detailLoading } = useAdminTicket(
    selectedTicketId || "",
  );

  const { data: ticketMessages, isLoading: messagesLoading } =
    useAdminTicketMessages(selectedTicketId || "");

  const { data: adminUsersData } = useAdminUsers();

  // Mutation hooks
  const assignTicketMutation = useAssignTicket();
  const updateStatusMutation = useUpdateTicketStatus();
  const sendReplyMutation = useSendTicketReply();
  const bulkAssignMutation = useBulkAssignTickets();
  const bulkStatusMutation = useBulkUpdateTicketStatus();

  // Derive data
  const tickets: any[] = ticketsData?.data || ticketsData?.tickets || ticketsData || [];
  const totalPages = ticketsData?.totalPages || ticketsData?.pagination?.pages || ticketsData?.meta?.totalPages || 1;
  const adminUsers: any[] = adminUsersData?.data || adminUsersData?.users || adminUsersData || [];

  const ticket = ticketDetail?.ticket || ticketDetail?.data || ticketDetail;
  const messages: any[] =
    ticketMessages?.data ||
    ticketMessages?.messages ||
    ticketDetail?.messages ||
    [];

  // Client-side search filtering (fallback if API doesn't support search)
  const filteredTickets = useMemo(() => {
    if (!search) return tickets;
    const q = search.toLowerCase();
    return tickets.filter(
      (t: any) =>
        t?.subject?.toLowerCase().includes(q) ||
        t?.ticketNumber?.toLowerCase().includes(q) ||
        t?.user?.name?.toLowerCase().includes(q) ||
        t?.user?.email?.toLowerCase().includes(q) ||
        t?.reporter?.name?.toLowerCase().includes(q),
    );
  }, [tickets, search]);

  // Overview stats
  const stats = useMemo(() => {
    const all = tickets;
    return {
      total: ticketsData?.pagination?.total || all.length,
      open: all.filter((t: any) => t.status === "open").length,
      inProgress: all.filter((t: any) => t.status === "in_progress").length,
      resolved: all.filter((t: any) => t.status === "resolved").length,
    };
  }, [tickets, ticketsData]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSelectTicket = useCallback(
    (ticketId: string) => {
      setSelectedTickets((prev) =>
        prev.includes(ticketId)
          ? prev.filter((id) => id !== ticketId)
          : [...prev, ticketId],
      );
    },
    [],
  );

  const handleSelectAll = useCallback(() => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(
        filteredTickets.map((t: any) => t._id || t.id),
      );
    }
  }, [selectedTickets, filteredTickets]);

  const handleAssignTicket = (ticketId: string, userId: string) => {
    assignTicketMutation.mutate(
      { ticketId, userId },
      {
        onSuccess: () => toast.success("Ticket assigned successfully"),
        onError: () => toast.error("Failed to assign ticket"),
      },
    );
  };

  const handleUpdateStatus = (ticketId: string, status: TicketStatus) => {
    updateStatusMutation.mutate(
      { ticketId, status },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Failed to update status"),
      },
    );
  };

  const handleUpdatePriority = (ticketId: string, priority: TicketPriority) => {
    updateStatusMutation.mutate(
      { ticketId, priority },
      {
        onSuccess: () => toast.success("Priority updated"),
        onError: () => toast.error("Failed to update priority"),
      },
    );
  };

  const handleSendReply = () => {
    if (!selectedTicketId || !replyMessage.trim()) return;
    sendReplyMutation.mutate(
      { ticketId: selectedTicketId, message: replyMessage.trim() },
      {
        onSuccess: () => {
          toast.success("Reply sent");
          setReplyMessage("");
        },
        onError: () => toast.error("Failed to send reply"),
      },
    );
  };

  const handleBulkAssign = () => {
    if (!bulkAssignUserId || selectedTickets.length === 0) return;
    bulkAssignMutation.mutate(
      { ticketIds: selectedTickets, userId: bulkAssignUserId },
      {
        onSuccess: () => {
          toast.success(
            `${selectedTickets.length} ticket(s) assigned successfully`,
          );
          setSelectedTickets([]);
          setBulkActionDialog(null);
          setBulkAssignUserId("");
        },
        onError: () => toast.error("Failed to assign some tickets"),
      },
    );
  };

  const handleBulkStatusChange = () => {
    if (!bulkStatus || selectedTickets.length === 0) return;
    bulkStatusMutation.mutate(
      { ticketIds: selectedTickets, status: bulkStatus as TicketStatus },
      {
        onSuccess: () => {
          toast.success(
            `${selectedTickets.length} ticket(s) status updated`,
          );
          setSelectedTickets([]);
          setBulkActionDialog(null);
          setBulkStatus("");
        },
        onError: () => toast.error("Failed to update some tickets"),
      },
    );
  };

  // ── Overview cards ───────────────────────────────────────────────────────

  const overviewCards = [
    {
      id: 1,
      icon: CIcons.support,
      label: "Total Tickets",
      amount: stats.total,
    },
    {
      id: 2,
      icon: CIcons.messageBadge,
      label: "Open",
      amount: stats.open,
    },
    {
      id: 3,
      icon: CIcons.stickyNote,
      label: "In Progress",
      amount: stats.inProgress,
    },
    {
      id: 4,
      icon: CIcons.badgeCheck,
      label: "Resolved",
      amount: stats.resolved,
    },
  ];

  // ── Table columns ────────────────────────────────────────────────────────

  const columns = [
    {
      header: (
        <input
          type="checkbox"
          checked={
            filteredTickets.length > 0 &&
            selectedTickets.length === filteredTickets.length
          }
          onChange={handleSelectAll}
          className="w-4 h-4 accent-green-600 cursor-pointer"
        />
      ),
      accessor: (row: any) => {
        const id = row._id || row.id;
        return (
          <input
            type="checkbox"
            checked={selectedTickets.includes(id)}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectTicket(id);
            }}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
        );
      },
    },
    {
      header: "ID",
      accessor: (row: any) => (
        <span className="text-sm font-mono text-muted-foreground">
          {row.ticketNumber || (row._id || row.id || "").slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Subject",
      accessor: (row: any) => (
        <button
          onClick={() => setSelectedTicketId(row._id || row.id)}
          className="text-sm font-medium text-left hover:text-green-700 hover:underline transition-colors max-w-[200px] truncate block"
        >
          {row.subject || "--"}
        </button>
      ),
    },
    {
      header: "User",
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.user?.name || row.reporter?.name || "--"}
          </span>
          {(row.user?.email || row.reporter?.email) && (
            <span className="text-xs text-muted-foreground">
              {row.user?.email || row.reporter?.email}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Priority",
      accessor: (row: any) => (
        <Badge
          variant="status"
          className={cn(
            "capitalize text-xs",
            getPriorityBadgeClass(row.priority),
          )}
        >
          {formatPriority(row.priority)}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: (row: any) => (
        <Badge
          variant="status"
          className={cn("capitalize", getStatusBadgeClass(row.status))}
        >
          {formatStatus(row.status)}
        </Badge>
      ),
    },
    {
      header: "Assigned To",
      accessor: (row: any) => (
        <span className="text-sm text-muted-foreground">
          {row.assignedTo?.name || row.assignee?.name || "Unassigned"}
        </span>
      ),
    },
    {
      header: "Created",
      accessor: (row: any) =>
        row.createdAt
          ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
          : "--",
    },
    {
      header: "Actions",
      accessor: (row: any) => {
        const id = row._id || row.id;
        return (
          <div className="flex gap-1.5">
            <Button
              variant="secondary"
              size="small"
              onClick={() => setSelectedTicketId(id)}
            >
              View
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="small">
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg"
              >
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdateStatus(id, "in_progress")}
                >
                  <ClockIcon className="w-4 h-4 mr-2" />
                  Mark In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdateStatus(id, "resolved")}
                >
                  <CheckCircle2Icon className="w-4 h-4 mr-2" />
                  Mark Resolved
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdateStatus(id, "closed")}
                >
                  <XIcon className="w-4 h-4 mr-2" />
                  Close Ticket
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdatePriority(id, "critical")}
                >
                  <AlertTriangleIcon className="w-4 h-4 mr-2 text-red-500" />
                  Set Critical
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdatePriority(id, "high")}
                >
                  <AlertTriangleIcon className="w-4 h-4 mr-2 text-orange-500" />
                  Set High
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdatePriority(id, "medium")}
                >
                  <AlertTriangleIcon className="w-4 h-4 mr-2 text-yellow-500" />
                  Set Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleUpdatePriority(id, "low")}
                >
                  <AlertTriangleIcon className="w-4 h-4 mr-2 text-gray-400" />
                  Set Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
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

      {/* Filter Bar */}
      <div className="flex items-center my-6 justify-between max-lg:flex-wrap gap-4">
        <div className="flex items-center gap-2 mb-4 lg:mb-0">
          <p className="font-bold whitespace-nowrap text-base flex gap-2 items-center text-[#18181B]">
            Support Tickets
            <span className="px-2 py-0.5 block text-xs font-normal rounded-[16px] bg-[#F4FFFC] text-green">
              {stats.total}
            </span>
          </p>
        </div>

        <div className="flex gap-2 items-center flex-wrap w-full lg:w-auto justify-end">
          {/* Bulk actions (visible when tickets selected) */}
          {selectedTickets.length > 0 && (
            <div className="flex gap-2 items-center mr-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {selectedTickets.length} selected
              </span>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setBulkActionDialog("assign")}
              >
                <UserPlusIcon className="w-3.5 h-3.5 mr-1" />
                Bulk Assign
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setBulkActionDialog("status")}
              >
                <CircleDotIcon className="w-3.5 h-3.5 mr-1" />
                Bulk Status
              </Button>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setSelectedTickets([])}
              >
                Clear
              </Button>
            </div>
          )}

          <Select
            value={statusFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setStatusFilter(
                v === "__all__" ? "" : (v as TicketStatus),
              );
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem
                  key={String(opt.value)}
                  value={opt.value || "__all__"}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={priorityFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setPriorityFilter(
                v === "__all__" ? "" : (v as TicketPriority),
              );
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem
                  key={String(opt.value)}
                  value={opt.value || "__all__"}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={assignedFilter || "__all__"}
            onValueChange={(v) => {
              setPage(1);
              setAssignedFilter(v === "__all__" ? "" : v);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assigned To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Agents</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {adminUsers.map((user: any) => (
                <SelectItem key={user._id || user.id} value={user._id || user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <SearchForm
            className="w-full sm:w-auto md:min-w-[220px]"
            inputClassName="h-10 pl-9"
            iconWrapperClassName="bg-[#F9F9FA] border border-black-50 w-8"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Tickets Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2Icon className="w-8 h-8 animate-spin text-green" />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TicketIcon className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="font-semibold text-lg mb-1">No support tickets</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            No tickets match the current filters. Try adjusting your search or
            filter criteria.
          </p>
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={filteredTickets}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
        />
      )}

      {/* ── Ticket Detail Dialog ──────────────────────────────────────────── */}
      <Dialog
        open={!!selectedTicketId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTicketId(null);
            setReplyMessage("");
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <TicketIcon className="w-5 h-5 text-green" />
              {ticket?.subject || "Ticket Details"}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2Icon className="w-8 h-8 animate-spin text-green" />
            </div>
          ) : ticket ? (
            <div className="space-y-6 pt-2">
              {/* Ticket info header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border border-[#ABD2C7] bg-[#F4FFFC]">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ticket ID</p>
                  <p className="font-semibold text-sm text-[#2E3034]">
                    {ticket.ticketNumber ||
                      (ticket._id || ticket.id || "").slice(-8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <Badge
                    variant="status"
                    className={cn(
                      "capitalize",
                      getStatusBadgeClass(ticket.status),
                    )}
                  >
                    {formatStatus(ticket.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Priority</p>
                  <Badge
                    variant="status"
                    className={cn(
                      "capitalize",
                      getPriorityBadgeClass(ticket.priority),
                    )}
                  >
                    {formatPriority(ticket.priority)}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm font-medium text-[#2E3034]">
                    {ticket.createdAt
                      ? format(
                          new Date(ticket.createdAt),
                          "MMM d, yyyy",
                        )
                      : "--"}
                  </p>
                </div>
              </div>

              {/* Reporter + Assignee */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg border-[#E8E8E8] px-4 py-3">
                  <p className="text-xs text-gray-500 mb-1">Reported By</p>
                  <p className="font-medium text-sm">
                    {ticket.user?.name ||
                      ticket.reporter?.name ||
                      "--"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.user?.email ||
                      ticket.reporter?.email ||
                      ""}
                  </p>
                </div>

                <div className="border rounded-lg border-[#E8E8E8] px-4 py-3">
                  <p className="text-xs text-gray-500 mb-2">Assigned To</p>
                  <Select
                    value={
                      ticket.assignedTo?._id ||
                      ticket.assignedTo?.id ||
                      ticket.assignee?._id ||
                      ticket.assignee?.id ||
                      "__unassigned__"
                    }
                    onValueChange={(v) => {
                      if (v !== "__unassigned__") {
                        handleAssignTicket(
                          ticket._id || ticket.id,
                          v,
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unassigned__">
                        Unassigned
                      </SelectItem>
                      {adminUsers.map((user: any) => (
                        <SelectItem
                          key={user._id || user.id}
                          value={user._id || user.id}
                        >
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-gray-500 w-full mb-1">
                  Quick Actions
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="small">
                      <CircleDotIcon className="w-3.5 h-3.5 mr-1" />
                      Change Status
                      <ChevronDownIcon className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    {(
                      ["open", "in_progress", "resolved", "closed"] as TicketStatus[]
                    ).map((s) => (
                      <DropdownMenuItem
                        key={s}
                        disabled={ticket.status === s}
                        className="cursor-pointer"
                        onClick={() =>
                          handleUpdateStatus(
                            ticket._id || ticket.id,
                            s,
                          )
                        }
                      >
                        {formatStatus(s)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="small">
                      <AlertTriangleIcon className="w-3.5 h-3.5 mr-1" />
                      Change Priority
                      <ChevronDownIcon className="w-3 h-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg">
                    {(
                      ["critical", "high", "medium", "low"] as TicketPriority[]
                    ).map((p) => (
                      <DropdownMenuItem
                        key={p}
                        disabled={ticket.priority === p}
                        className="cursor-pointer"
                        onClick={() =>
                          handleUpdatePriority(
                            ticket._id || ticket.id,
                            p,
                          )
                        }
                      >
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full mr-2 inline-block",
                            p === "critical" && "bg-red-500",
                            p === "high" && "bg-orange-500",
                            p === "medium" && "bg-yellow-500",
                            p === "low" && "bg-gray-400",
                          )}
                        />
                        {formatPriority(p)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              <div className="border rounded-lg border-[#E8E8E8] px-4 py-3">
                <h3 className="font-bold text-[#2E3034] text-sm mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {ticket.description || "No description provided."}
                </p>
              </div>

              {/* Attachments */}
              {ticket.images?.length > 0 && (
                <div className="border rounded-lg border-[#E8E8E8] px-4 py-3">
                  <h3 className="font-bold text-[#2E3034] text-sm mb-2">
                    Attachments
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {ticket.images.map((img: string, idx: number) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-16 h-16 rounded-md overflow-hidden border border-[#E8E8E8] block"
                      >
                        <img
                          src={img}
                          alt={`Attachment ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Thread */}
              <div className="border rounded-lg border-[#E8E8E8] px-4 py-3">
                <h3 className="font-bold text-[#2E3034] text-sm mb-3">
                  Messages
                </h3>

                {messagesLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2Icon className="w-5 h-5 animate-spin text-green" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No messages yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                    {messages.map((msg: any, idx: number) => (
                      <div
                        key={msg._id || msg.id || idx}
                        className={cn(
                          "p-3 rounded-lg text-sm",
                          msg.sender?.role === "admin" ||
                            msg.senderType === "admin"
                            ? "bg-[#F4FFFC] border border-[#ABD2C7] ml-6"
                            : "bg-gray-50 border border-gray-200 mr-6",
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">
                            {msg.sender?.name || "User"}
                            {(msg.sender?.role === "admin" ||
                              msg.senderType === "admin") && (
                              <Badge
                                variant="status"
                                className="ml-2 bg-green-100 text-green-800 text-[10px] px-1.5"
                              >
                                Admin
                              </Badge>
                            )}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {msg.createdAt
                              ? format(
                                  new Date(msg.createdAt),
                                  "MMM d, yyyy h:mm a",
                                )
                              : ""}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {msg.message || msg.content || msg.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply input */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green resize-none"
                  />
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleSendReply}
                    state={sendReplyMutation.isPending ? "loading" : "default"}
                    disabled={!replyMessage.trim()}
                    className="self-end"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Ticket not found.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Bulk Assign Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={bulkActionDialog === "assign"}
        onOpenChange={(open) => {
          if (!open) {
            setBulkActionDialog(null);
            setBulkAssignUserId("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Bulk Assign {selectedTickets.length} Ticket(s)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Assign to
              </label>
              <Select
                value={bulkAssignUserId || "__none__"}
                onValueChange={(v) =>
                  setBulkAssignUserId(v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select admin user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select an agent</SelectItem>
                  {adminUsers.map((user: any) => (
                    <SelectItem
                      key={user._id || user.id}
                      value={user._id || user.id}
                    >
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setBulkActionDialog(null);
                  setBulkAssignUserId("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleBulkAssign}
                state={bulkAssignMutation.isPending ? "loading" : "default"}
                disabled={!bulkAssignUserId}
              >
                Assign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Status Dialog ────────────────────────────────────────────── */}
      <Dialog
        open={bulkActionDialog === "status"}
        onOpenChange={(open) => {
          if (!open) {
            setBulkActionDialog(null);
            setBulkStatus("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Bulk Status Update - {selectedTickets.length} Ticket(s)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-2 block">
                New Status
              </label>
              <Select
                value={bulkStatus || "__none__"}
                onValueChange={(v) =>
                  setBulkStatus(
                    v === "__none__" ? "" : (v as TicketStatus),
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select a status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setBulkActionDialog(null);
                  setBulkStatus("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleBulkStatusChange}
                state={
                  bulkStatusMutation.isPending ? "loading" : "default"
                }
                disabled={!bulkStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
