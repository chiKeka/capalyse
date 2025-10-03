import api from '@/api/axios';
import { ApiEndPoints } from '@/api/endpoints';
import { CreateSupportForm } from '@/lib/uitils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetSupport = () => {
  return useQuery({
    queryKey: ['sme_Support'],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.SupportTicket);
      return resp?.data;
    },
  });
};
export const useGetSingleTicket = (id: string) => {
  return useQuery({
    queryKey: ['sme_single_support'],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.TicketsActions(id));
      console.log({ resp });
      return resp.data;
    },
  });
};

export const useGetTicketMessage = (id: string) => {
  return useQuery({
    queryKey: ['sme_ticket_messages'],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.TicketMessage(id));
      return resp.data.data;
    },
  });
};

export const useSupports = () => {
  const queryClient = useQueryClient();
  const createSupport = useMutation({
    mutationFn: async (cred: CreateSupportForm): Promise<any> => {
      return api.post(ApiEndPoints.SupportTicket, cred);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sme_Support'] });
      queryClient.invalidateQueries({ queryKey: ['sme_single_support'] });
      queryClient.invalidateQueries({ queryKey: ['sme_ticket_messages'] });
    },
  });

  const createTicketMessage = useMutation({
    mutationFn: async (cred: any): Promise<any> => {
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

export const useSupportTicketMutations = () => {
  const queryClient = useQueryClient();
  const updateTicket = useMutation({
    mutationFn: async ({
      id,
      rest,
    }: {
      id: string;
      rest: any;
    }): Promise<any> => {
      return api.patch(ApiEndPoints.TicketsActions(id), rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sme_single_support'] });
    },
  });
  const submitSupportMessage = useMutation({
    mutationFn: async ({
      id,
      rest,
    }: {
      id: string;
      rest: any;
    }): Promise<any> => {
      return api.post(ApiEndPoints.TicketMessage(id), rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sme_ticket_messages'] });
    },
  });
  return {
    updateTicket,
    submitSupportMessage,
  };
};
