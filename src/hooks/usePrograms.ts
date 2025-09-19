import api from "@/api/axios";
import { programsRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

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
