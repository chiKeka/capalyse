import api from "@/api/axios";
import { programsRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

/**
 * Core analytics overview for development organisations.
 * Returns programs count, total funded, active SMEs, etc.
 */
export const GetDevOrgAnalytics = () => {
  return useQuery({
    queryKey: ["dev-org-analytics"],
    queryFn: async () => {
      const response = await api.get(programsRoutes.devOrg_analytics);
      return response.data;
    },
  });
};

/**
 * Per-program statistics for the dev-org dashboard.
 * Returns enrollment counts, completion rates, disbursements per program.
 */
export const useDevOrgProgramStats = () => {
  return useQuery({
    queryKey: ["dev-org-program-stats"],
    queryFn: async () => {
      const response = await api.get(programsRoutes.devOrg_analytics, {
        params: { breakdown: "programs" },
      });
      return response.data;
    },
  });
};

/**
 * Impact tracking metrics aggregated across all programs.
 * Returns jobs created, revenue generated, certifications achieved, etc.
 */
export const useDevOrgImpactMetrics = (params?: {
  from?: string;
  to?: string;
  currency?: string;
}) => {
  return useQuery({
    queryKey: ["dev-org-impact-metrics", params],
    queryFn: async () => {
      const response = await api.get(programsRoutes.impactTracking, {
        params,
      });
      return response.data;
    },
  });
};
