import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { notificationAtom } from "@/lib/atoms/atoms";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

export const useGetNotifications = () => {
  const setNotification = useSetAtom(notificationAtom);
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Notification);
      setNotification(resp?.data.data.filter((n: any) => !n.read).length);
      return resp.data.data;
    },
  });
};
export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Notifications("unread-count"));
      return resp.data.data;
    },
  });
};

export const useGetStat = () => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Notifications("stats"));
      return resp.data.data;
    },
  });
};

export const useGetSettings = () => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Notifications("settings"));
      return resp.data.data;
    },
  });
};
export const useNotifications = () => {
  const useCreateNotification = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.Notifications("send"), cred);
    },
  });

  const useMarkSingle_Read = useMutation({
    mutationFn: async (id: string): Promise<any> => {
      return api.put(ApiEndPoints.Mark_as_Read(id));
    },
  });

  const useMarkAll_read = useMutation({
    mutationFn: async (): Promise<any> => {
      return api.put(ApiEndPoints.Notifications("read-all"));
    },
  });

  const delNotification = useMutation({
    mutationFn: async (id: string): Promise<any> => {
      return api.delete(ApiEndPoints.Notifications(id));
    },
  });

  const useUpdateSetting = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.get(ApiEndPoints.Notifications("settings"));
    },
  });

  return {
    useUpdateSetting,
    delNotification,
    useMarkAll_read,
    useMarkSingle_Read,
    useCreateNotification,
  };
};
