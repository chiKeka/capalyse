import api from "@/api/axios";
import { ApiEndPoints, matchingRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Fetch the investor's current watchlist / saved investments.
 */
export const useInvestmentWatchList = () => {
  return useQuery({
    queryKey: ["investment_watchlist"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.Watchlist);
      return resp.data?.data ?? resp.data;
    },
  });
};

/**
 * Add an SME / target to the investment watchlist.
 */
export const useAddToWatchList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { targetId: string; notes?: string }) => {
      const resp = await api.post(ApiEndPoints.Watchlist, data);
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["smeDirectory"] });
      queryClient.invalidateQueries({ queryKey: ["investorSavedSMEs"] });
    },
  });
};

/**
 * Remove an SME / target from the investment watchlist.
 */
export const useRemoveFromWatchList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (targetId: string) => {
      const resp = await api.delete(ApiEndPoints.Delete_Watchlist(targetId));
      return resp.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["investment_watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["smeDirectory"] });
      queryClient.invalidateQueries({ queryKey: ["investorSavedSMEs"] });
    },
  });
};
