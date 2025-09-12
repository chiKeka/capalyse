import api from "@/api/axios";
import { directoryRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const InvestorDirectory = () => {
  return useQuery({
    queryKey: ["investorDirectory"],
    queryFn: async () => {
      const resp = await api.get(directoryRoutes.getInvestorMatches);
      return resp.data;
    },
  });
};
