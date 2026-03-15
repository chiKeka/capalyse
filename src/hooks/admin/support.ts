import api from "@/api/axios";
import { apiRoutes, adminRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Types ────────────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "critical" | "high" | "medium" | "low";

export interface AdminTicketFilters {
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  assignedTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all tickets for admin triage (uses admin endpoint).
 */
export const useAdminTickets = (filters?: AdminTicketFilters) => {
  return useQuery({
    queryKey: ["admin-tickets", filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filters?.status) params.status = filters.status;
      if (filters?.priority) params.priority = filters.priority;
      if (filters?.assignedTo) params.assignedTo = filters.assignedTo;
      if (filters?.search) params.search = filters.search;
      if (filters?.page) params.page = filters.page;
      if (filters?.pageSize) params.pageSize = filters.pageSize;

      const res = await api.get(apiRoutes.admin.getAllTickets, { params });
      return res.data;
    },
  });
};

/**
 * Fetch a single ticket by id.
 */
export const useAdminTicket = (ticketId: string) => {
  return useQuery({
    queryKey: ["admin-ticket", ticketId],
    queryFn: async () => {
      const res = await api.get(apiRoutes.support.getTicketById(ticketId));
      return res.data;
    },
    enabled: !!ticketId,
  });
};

/**
 * Fetch messages for a specific ticket.
 */
export const useAdminTicketMessages = (ticketId: string) => {
  return useQuery({
    queryKey: ["admin-ticket-messages", ticketId],
    queryFn: async () => {
      const res = await api.get(apiRoutes.support.getMessages(ticketId));
      return res.data;
    },
    enabled: !!ticketId,
  });
};

/**
 * Fetch admin users for the assignment dropdown.
 */
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getUsers, {
        params: { role: "admin" },
      });
      return res.data;
    },
  });
};

// ── Mutations ────────────────────────────────────────────────────────────────

/**
 * Assign a ticket to an admin user.
 */
export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      userId,
    }: {
      ticketId: string;
      userId: string;
    }) => {
      const res = await api.post(apiRoutes.admin.assignTicket(ticketId), {
        userId,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ticket"] });
    },
  });
};

/**
 * Update ticket status (and optionally priority).
 */
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      status,
      priority,
    }: {
      ticketId: string;
      status?: TicketStatus;
      priority?: TicketPriority;
    }) => {
      const body: Record<string, string> = {};
      if (status) body.status = status;
      if (priority) body.priority = priority;

      const res = await api.patch(
        apiRoutes.support.updateTicket(ticketId),
        body,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ticket"] });
    },
  });
};

/**
 * Send an admin reply to a ticket.
 */
export const useSendTicketReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketId,
      message,
    }: {
      ticketId: string;
      message: string;
    }) => {
      const res = await api.post(apiRoutes.support.addMessage(ticketId), {
        message,
      });
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-ticket-messages", variables.ticketId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
  });
};

/**
 * Bulk assign tickets to an admin user.
 */
export const useBulkAssignTickets = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketIds,
      userId,
    }: {
      ticketIds: string[];
      userId: string;
    }) => {
      const results = await Promise.allSettled(
        ticketIds.map((ticketId) =>
          api.post(apiRoutes.admin.assignTicket(ticketId), { userId }),
        ),
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
  });
};

/**
 * Bulk update ticket status.
 */
export const useBulkUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ticketIds,
      status,
    }: {
      ticketIds: string[];
      status: TicketStatus;
    }) => {
      const results = await Promise.allSettled(
        ticketIds.map((ticketId) =>
          api.patch(apiRoutes.support.updateTicket(ticketId), { status }),
        ),
      );
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
  });
};
