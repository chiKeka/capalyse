import api from "@/api/axios";
import { adminRoutes, apiRoutes } from "@/api/endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetAllTickets = () => {
  return useQuery({
    queryKey: ["admin_all_tickets"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.admin.getAllTickets);
      return resp.data.data;
    },
  });
};

export const useGetAdminAnalytics = (currency: string) => {
  return useQuery({
    queryKey: ["admin_analytics"],
    queryFn: async () => {
      const resp = await api.get(adminRoutes.adminAnalytics, {
        params: {
          currency: currency as string,
        },
      });
      return resp;
    },
  });
};
export const useGetAdminDashboardStats = () => {
  return useQuery({
    queryKey: ["admin_dashboard_stats"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.admin.adminDashSats);
      return resp.data.data;
    },
  });
};

export const useGetInvestorById = (id: string) => {
  return useQuery({
    queryKey: ["get_investor_by_id"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investors.getProfileById(id));
      return resp.data.data;
    },
    enabled: !!id,
  });
};

export const useGetSmeById = (id: string) => {
  return useQuery({
    queryKey: ["get_sme_by_id"],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.smes.getProfileById(id));
      return resp.data.data;
    },
    enabled: !!id,
  });
};

export const useAdminMutations = () => {
  const assignTickets = useMutation({
    mutationFn: async ({
      id,
      assignedTo,
    }: {
      id: string;
      assignedTo: string;
    }) => {
      const resp = await api.put(apiRoutes.admin.assignTicket(id), {
        assignedTo,
      });
      return resp.data.data;
    },
  });
  return {
    assignTickets,
  };
};
