import api from "@/api/axios";
import { directoryRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const useSmeDirectory = (enabled?: boolean) => {
  return useQuery({
    queryKey: ["smeDirectory"],
    queryFn: async () => {
      const resp = await api.get(directoryRoutes.smes);
      return resp.data;
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};

export const useInvestorDirectory = (enabled?: boolean) => {
  return useQuery({
    queryKey: ["investorDirectory"],
    queryFn: async () => {
      const resp = await api.get(directoryRoutes.smes);
      return resp.data;
    },
    enabled: enabled !== undefined ? enabled : true,
  });
};
