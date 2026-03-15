import api from "@/api/axios";
import { apiRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  investmentAlerts: boolean;
  matchNotifications: boolean;
  messageNotifications: boolean;
  assessmentReminders: boolean;
  weeklyDigest: boolean;
}

export interface PrivacySettings {
  profileVisibility: "public" | "private" | "connections-only";
  searchVisibility: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

export interface CurrencyPreference {
  currency: string;
}

// ─── Notification Settings ───────────────────────────────────────────────────

export const useNotificationSettings = () => {
  return useQuery<NotificationSettings>({
    queryKey: ["notification_settings"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.notifications.getSettings);
      return resp.data?.data ?? resp.data;
    },
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<NotificationSettings>): Promise<any> => {
      return api.put(apiRoutes.notifications.updateSettings, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_settings"] });
    },
  });
};

// ─── Privacy Settings ────────────────────────────────────────────────────────

export const usePrivacySettings = () => {
  return useQuery<PrivacySettings>({
    queryKey: ["privacy_settings"],
    queryFn: async () => {
      // Try SME endpoint first, fallback handled by the component
      const resp = await api.get(apiRoutes.smes.updateProfileVisibility);
      return resp.data?.data ?? resp.data;
    },
    retry: false,
  });
};

export const useUpdatePrivacySettings = (accessType: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<PrivacySettings>): Promise<any> => {
      const endpoint =
        accessType === "investor"
          ? apiRoutes.investors.updateVisibility
          : apiRoutes.smes.updateProfileVisibility;
      return api.put(endpoint, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["privacy_settings"] });
    },
  });
};

// ─── Currency Preference ─────────────────────────────────────────────────────

export const useCurrencyPreference = () => {
  return useQuery<CurrencyPreference>({
    queryKey: ["currency_preference"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.profile.currency);
      return resp.data?.data ?? resp.data;
    },
  });
};

export const useUpdateCurrencyPreference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CurrencyPreference): Promise<any> => {
      return api.put(apiRoutes.profile.currency, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currency_preference"] });
    },
  });
};
