import api from "@/api/axios";
import { programsRoutes } from "@/api/endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";
export const GetPrograms = (params: any) => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const response = await api.get(programsRoutes.programs, {
        params: params,
      });
      return response.data;
    },
  });
};

export const GetProgramCategories = () => {
  return useQuery({
    queryKey: ["program-categories"],
    queryFn: async () => {
      const response = await api.get(programsRoutes.programCategories);
      return response.data;
    },
  });
};

export const GetProgramById = (id: string) => {
  return useQuery({
    queryKey: ["program", id],
    queryFn: async () => {
      const response = await api.get(programsRoutes.singleProgram(id));
      return response.data;
    },
  });
};

export const GetProgramApplications = (id: string) => {
  return useQuery({
    queryKey: ["program-applications", id],
    queryFn: async () => {
      const response = await api.get(programsRoutes.programApplications(id));
      return response.data;
    },
  });
};

export const GetProgramApplicationById = (
  id: string,
  applicationId: string
) => {
  return useQuery({
    queryKey: ["program-application", id, applicationId],
    queryFn: async () => {
      const response = await api.get(
        programsRoutes.applicationStatus(id, applicationId)
      );
      return response.data;
    },
  });
};

/// Create Program

export interface Partner {
  name: string;
  role: string;
  description: string;
  contactInfo: string;
}

export interface Requirement {
  type: string;
  operator: string;
  value: string;
  description: string;
}

export interface ProgramFormData {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  smeStage: string[];
  eligibleCountries: string[];
  industryFocus: string[];
  maxParticipants: number;
  supportTypes: string[];
  partners?: Partner[];
  applicationDeadline: string;
  requirements?: Requirement[];
}

export const createProgram = () => {
  return useMutation({
    mutationFn: async (data: ProgramFormData) => {
      const response = await api.post(programsRoutes.programs, data);

      if (!response.status) {
        throw new Error("Failed to create program");
      }

      return response;
    },
  });
};
