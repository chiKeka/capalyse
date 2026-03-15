import api from "@/api/axios";
import { ApiEndPoints, directoryRoutes, matchingRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const useNetworking = () => {
  return useQuery({
    queryKey: ["networking"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.networking);
      return resp?.data;
    },
  });
};

export const useSingleNetworking = () => {
  return useQuery({
    queryKey: ["networking"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.networking);
      return resp?.data;
    },
  });
};

/**
 * Fetch AI-suggested matches based on user role.
 * For investors, uses investorMatches; for SMEs, uses smesMatches.
 */
export const useNetworkMatches = (type: "investor" | "sme") => {
  const endpoint =
    type === "investor" ? matchingRoutes.investorMatches : matchingRoutes.smesMatches;

  return useQuery({
    queryKey: ["networkMatches", type],
    queryFn: async () => {
      const resp = await api.get(endpoint);
      return resp?.data;
    },
  });
};

/**
 * Fetch investor directory profiles for discovery.
 */
export const useInvestorDirectorySearch = (params?: {
  page?: number;
  limit?: number;
  q?: string;
  industry?: string;
  stage?: string;
  location?: string;
}) => {
  return useQuery({
    queryKey: ["investorDirectory", params],
    queryFn: async () => {
      const resp = await api.get(directoryRoutes.getInvestorMatches, { params });
      return resp?.data;
    },
  });
};
