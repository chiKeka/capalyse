import api from "@/api/axios";
import { investorsAnalytics, apiRoutes } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetch high-level investor analytics (match stats, activity, etc.)
 */
export const useGetInvestorAnalytics = () => {
  return useQuery({
    queryKey: ["investor-analytics"],
    queryFn: async () => {
      const response = await api.get(investorsAnalytics.getInvestorsAnalytics);
      return response.data;
    },
  });
};

/**
 * Fetch the investor's investment-level analytics (pipeline metrics, conversion, etc.)
 */
export const useGetInvestmentAnalytics = () => {
  return useQuery({
    queryKey: ["investment-analytics"],
    queryFn: async () => {
      const response = await api.get(apiRoutes.investments.getAnalytics);
      return response.data;
    },
  });
};

/**
 * Fetch investor portfolio summary (totals, allocation, performance)
 */
export const useGetInvestorPortfolioSummary = () => {
  return useQuery({
    queryKey: ["investor-portfolio-summary"],
    queryFn: async () => {
      const response = await api.get(apiRoutes.investments.getInvestorPortfolioSummary);
      return response.data;
    },
  });
};
