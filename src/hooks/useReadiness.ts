import api from "@/api/axios";
import { ApiEndPoints, readinessRoutes } from "@/api/endpoints";
import { ReadinessScoreResponse } from "@/lib/uitils/types";
import { useQuery } from "@tanstack/react-query";

export const useGetReadinessScore = () => {
  return useQuery<ReadinessScoreResponse>({
    queryKey: ["readiness-score"],
    queryFn: async () => {
      const response = await api.get(readinessRoutes?.getMyReadinessScore);
      return response?.data;
    },
  });
};

export const useGetScoreHistory = () => {
  return useQuery({
    queryKey: ["score-history"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Investment_Readiness("history"));
      return response?.data;
    },
  });
};

export const useGetScoreAnalytics = () => {
  return useQuery({
    queryKey: ["score-analytics"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Investment_Readiness("analytics"));
      return response?.data;
    },
  });
};

export const useGetScoreInsight = () => {
  return useQuery({
    queryKey: ["score-insights"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Investment_Readiness("insights"));
      return response?.data;
    },
  });
};
