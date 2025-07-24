import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { CreateSupportForm } from "@/lib/uitils/types";
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

  const createSupport = useMutation({
    mutationFn: async (cred: CreateSupportForm): Promise<any> => {
      return api.post(ApiEndPoints.SupportTicket, cred);
    },
  });

  const createTicketMessage = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.post(ApiEndPoints.TicketMessage(cred?.id), cred);
    },
  });

  const updateTicket = useMutation({
    mutationFn: async (id: string): Promise<any> => {
      return api.put(ApiEndPoints.TicketsActions(id));
    },
  });

  const updateTicketMessage = useMutation({
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

  const deleteTicketMessaging = useMutation({
    mutationFn: async (cred: any): Promise<any> => {
      return api.delete(
        ApiEndPoints.TicketMessagesAction(cred?.id, cred?.messagei)
      );
    },
  });

  return {
    deleteTicketMessaging,
    delTicket,
    updateTicket,
    updateTicketMessage,
    createTicketMessage,
    createSupport,
  };
};
