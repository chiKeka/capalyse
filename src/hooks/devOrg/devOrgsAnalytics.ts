import api from "@/api/axios";
import { programsRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const GetDevOrgAnalytics = () => {
  return useQuery({
    queryKey: ["dev-org-analytics"],
    queryFn: async () => {
      const response = await api.get(programsRoutes.devOrg_analytics);
      return response.data;
    },
  });
};

