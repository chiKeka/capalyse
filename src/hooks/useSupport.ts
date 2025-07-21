import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetSupport = () => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.SupportTicket);
      return resp.data.data;
    },
  });
};
export const useGetSingleTicket = (id: string) => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.TicketsActions(id));
      return resp.data.data;
    },
  });
};

export const useGetTicketMessage = (id: string) => {
  return useQuery({
    queryKey: ["sme_assessment"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.TicketMessage(id));
      return resp.data.data;
    },
  });
};

export const useSupports = () => {
  const useCreateSupport = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.SupportTicket, cred);
    },
  });

  const useCreateTicketMessage = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.TicketMessage(cred?.id), cred);
    },
  });

  const useUpdateTicket = useMutation({
    mutationFn: async (id: string): Promise<any> => {
      return api.put(ApiEndPoints.TicketsActions(id));
    },
  });

  const useUpdateTicketMessage = useMutation({
    mutationFn: async (cred: any): Promise<any> => {
      return api.put(
        ApiEndPoints.TicketMessagesAction(cred?.id, cred?.messageid),
        cred
      );
    },
  });

  const delTicket = useMutation({
    mutationFn: async (id: string): Promise<any> => {
      return api.delete(ApiEndPoints.TicketsActions(id));
    },
  });

  const useDeleteTicketMessaging = useMutation({
    mutationFn: async (cred: any): Promise<any> => {
      return api.delete(
        ApiEndPoints.TicketMessagesAction(cred?.id, cred?.messagei)
      );
    },
  });

  return {
    useDeleteTicketMessaging,
    delTicket,
    useUpdateTicket,
    useUpdateTicketMessage,
    useCreateTicketMessage,
    useCreateSupport,
  };
};
