import api from "@/api/axios";
import { programsRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useAdminPrograms = (params?: {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}) => {
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

export const useAdminProgramCategories = () => {
  return useQuery({
    queryKey: ["admin-program-categories"],
    queryFn: async () => {
      const res = await api.get(programsRoutes.programCategories);
      return res.data;
    },
  });
};
