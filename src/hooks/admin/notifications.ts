import api from "@/api/axios";
import { apiRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface BulkNotificationPayload {
  title: string;
  message: string;
  type?: string;
  targetRoles?: string[];
  targetUserIds?: string[];
}

export const useAdminSendBulkNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BulkNotificationPayload) => {
      const res = await api.post(apiRoutes.admin.sendBulkNotifications, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    },
  });
};

export const useAdminNotificationStats = () => {
  return useQuery({
    queryKey: ["admin-notification-stats"],
    queryFn: async () => {
      const res = await api.get(apiRoutes.notifications.getStats);
      return res.data;
    },
  });
};

export const useAdminNotifications = () => {
  return useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const res = await api.get(apiRoutes.notifications.getAll);
      return res.data;
    },
  });
};
