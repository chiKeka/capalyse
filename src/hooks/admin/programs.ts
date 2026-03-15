import api from "@/api/axios";
import { adminRoutes, programsRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminProgramFormData {
  name: string;
  description: string;
  objectives: string[];
  startDate: string;
  endDate?: string;
  smeStage: string[];
  eligibleCountries: string[];
  industryFocus: string[];
  maxParticipants: number;
  supportTypes: string[];
  applicationDeadline: string;
}

export interface AdminProgramFilters {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
  category?: string;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export const useAdminPrograms = (params?: AdminProgramFilters) => {
  return useQuery({
    queryKey: ["admin-programs", params],
    queryFn: async () => {
      const res = await api.get(programsRoutes.programs, { params });
      return res.data;
    },
  });
};

export const useAdminProgramById = (id: string) => {
  return useQuery({
    queryKey: ["admin-program", id],
    queryFn: async () => {
      const res = await api.get(programsRoutes.singleProgram(id));
      return res.data;
    },
    enabled: Boolean(id),
  });
};

export const useAdminProgramCategories = () => {
  return useQuery({
    queryKey: ["admin-program-categories"],
    queryFn: async () => {
      const res = await api.get(programsRoutes.programCategories);
      return res.data;
    },
  });
};

/**
 * Fetch applications for a specific program (admin view).
 */
export const useAdminProgramApplications = (programId: string) => {
  return useQuery({
    queryKey: ["admin-program-applications", programId],
    queryFn: async () => {
      const res = await api.get(adminRoutes.getAdminProgramApplications(programId));
      return res.data;
    },
    enabled: Boolean(programId),
  });
};

// ── Mutations ────────────────────────────────────────────────────────────────

export const useCreateAdminProgram = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: AdminProgramFormData) => {
      const res = await api.post(programsRoutes.programs, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
    },
  });
};

export const useUpdateAdminProgram = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminProgramFormData>) => {
      const res = await api.put(programsRoutes.singleProgram(id), data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-program", id] });
    },
  });
};

export const useUpdateProgramStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (status: string) => {
      const res = await api.post(programsRoutes.programAction(id, status));
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-program", id] });
    },
  });
};

/**
 * Review (approve/reject) a program application.
 */
export const useReviewApplication = (programId: string, applicationId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      action: "accept" | "reject" | "start" | "waitlist";
      rejectionReason?: string;
      reviewNotes?: string;
    }) => {
      const res = await api.post(
        programsRoutes.reviewApplication(programId, applicationId),
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-program-applications", programId],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-programs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-program", programId] });
    },
  });
};
