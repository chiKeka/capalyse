import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const useGetReadinessScore = () => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(
        ApiEndPoints.Investment_Readiness("readiness-score")
      );

      const user = response?.data?.data?.user;
      return user;
    },
  });
};
export const useGetScoreHistory = () => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(
        ApiEndPoints.Investment_Readiness("history")
      );

      const user = response?.data?.data?.user;
      return user;
    },
  });
};
export const useGetScoreAnalytics = () => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(
        ApiEndPoints.Investment_Readiness("analytics")
      );

      const user = response?.data?.data?.user;
      return user;
    },
  });
};
export const useGetScoreInsight = () => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(
        ApiEndPoints.Investment_Readiness("insights")
      );

      const user = response?.data?.data?.user;
      return user;
    },
  });
};
