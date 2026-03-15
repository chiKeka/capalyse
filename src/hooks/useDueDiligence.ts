import api from "@/api/axios";
import { apiRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type DocStatus = "requested" | "uploaded" | "under_review" | "approved" | "rejected";

export type DueDiligenceDocument = {
  id: string;
  _id?: string;
  name: string;
  category: "financial" | "legal" | "operational" | "market";
  status: DocStatus;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy?: string;
  uploadedAt?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ChecklistItem = {
  id: string;
  _id?: string;
  label: string;
  category: string;
  required: boolean;
  completed: boolean;
  documentId?: string;
  createdAt?: string;
};

export type ActivityLogEntry = {
  id: string;
  _id?: string;
  action: string;
  description: string;
  performedBy?: {
    name: string;
    role: string;
  };
  createdAt: string;
};

export type DueDiligenceRoom = {
  id: string;
  _id?: string;
  dealId: string;
  sme?: {
    businessName?: string;
    name?: string;
    industry?: string;
    logo?: string;
  };
  investor?: {
    organizationName?: string;
    name?: string;
  };
  stage: string;
  amount?: number;
  currency?: string;
  startedAt?: string;
  status: string;
};

/**
 * Fetch due diligence room details for a given deal.
 */
export const useDueDiligenceRoom = (dealId: string) => {
  return useQuery({
    queryKey: ["due_diligence_room", dealId],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getDueDiligenceRoom(dealId));
      return resp.data.data;
    },
    enabled: !!dealId,
  });
};

/**
 * Fetch documents for a due diligence room.
 */
export const useDueDiligenceDocuments = (dealId: string) => {
  return useQuery({
    queryKey: ["due_diligence_documents", dealId],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getDueDiligenceDocuments(dealId));
      return resp.data.data;
    },
    enabled: !!dealId,
  });
};

/**
 * Upload a document to the due diligence room.
 */
export const useUploadDueDiligenceDoc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, data }: { dealId: string; data: FormData }) => {
      const resp = await api.post(apiRoutes.investments.uploadDueDiligenceDocument(dealId), data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return resp.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["due_diligence_documents", variables.dealId],
      });
      queryClient.invalidateQueries({
        queryKey: ["due_diligence_activity", variables.dealId],
      });
      queryClient.invalidateQueries({
        queryKey: ["due_diligence_checklist", variables.dealId],
      });
    },
  });
};

/**
 * Update document status (approve / reject / mark under review).
 */
export const useUpdateDocStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      docId,
      status,
      notes,
    }: {
      dealId: string;
      docId: string;
      status: DocStatus;
      notes?: string;
    }) => {
      const resp = await api.patch(
        apiRoutes.investments.updateDueDiligenceDocStatus(dealId, docId),
        { status, notes },
      );
      return resp.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["due_diligence_documents", variables.dealId],
      });
      queryClient.invalidateQueries({
        queryKey: ["due_diligence_activity", variables.dealId],
      });
    },
  });
};

/**
 * Fetch the due diligence checklist for a deal.
 */
export const useDueDiligenceChecklist = (dealId: string) => {
  return useQuery({
    queryKey: ["due_diligence_checklist", dealId],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getDueDiligenceChecklist(dealId));
      return resp.data.data;
    },
    enabled: !!dealId,
  });
};

/**
 * Fetch the activity log for a due diligence room.
 */
export const useDueDiligenceActivity = (dealId: string) => {
  return useQuery({
    queryKey: ["due_diligence_activity", dealId],
    queryFn: async () => {
      const resp = await api.get(apiRoutes.investments.getDueDiligenceActivity(dealId));
      return resp.data.data;
    },
    enabled: !!dealId,
  });
};
