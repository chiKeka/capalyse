import api from "@/api/axios";
import { adminRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface AdminComplianceQuery {
  status?:
    | "awaiting_ai"
    | "awaiting_docs"
    | "ai_compliant"
    | "admin_review"
    | "admin_certified"
    | "admin_rejected";
  page?: number;
  pageSize?: number;
}

export const useAdminCompliances = (params: AdminComplianceQuery) => {
  return useQuery({
    queryKey: ["admin-compliances", params],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getAdminCompliance, { params });
      return res.data;
    },
  });
};

export const useApproveAdminCompliance = (
  caseId: string,
  docLinkId: string
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { notes: string }) => {
      const res = await api.post(
        adminRoutes.approveAdminCompliance(caseId, docLinkId),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-compliances"] });
    },
  });
};

export const useRejectAdminCompliance = (caseId: string, docLinkId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { notes: string }) => {
      const res = await api.post(
        adminRoutes.rejectAdminCompliance(caseId, docLinkId),
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-compliances"] });
    },
  });
};

export const useCertifyAdminCompliance = (caseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(adminRoutes.certifyAdminCompliance(caseId));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-compliances"] });
    },
  });
};

export const useRevokeAdminCompliance = (caseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post(adminRoutes.revokeAdminCompliance(caseId));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-compliances"] });
    },
  });
};
