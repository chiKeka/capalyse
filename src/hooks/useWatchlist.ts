import api from "@/api/axios";
import { ApiEndPoints, matchingRoutes } from "@/api/endpoints";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface WatchlistItem {
  id: string;
  targetId: string;
  targetType: "sme" | "investor";
  createdAt: string;
  updatedAt: string;
}

interface AddToWatchlistData {
  smeId: string;
  targetType: "sme" | "investor";
}

/**
 * Hook to fetch user's watchlist items
 */
export const useWatchlist = () => {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Watchlist);
      return response.data.data as WatchlistItem[];
    },
  });
};

/**
 * Hook to add an item to watchlist
 */
export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddToWatchlistData) => {
      const response = await api.post(matchingRoutes.watchList(data.smeId), data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch watchlist
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

/**
 * Hook to remove an item from watchlist
 */
export const useRemoveFromWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (smeId: string) => {
      const response = await api.delete(matchingRoutes.watchList(smeId));
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch watchlist
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

/**
 * Hook to check if a specific item is in watchlist
 */
export const useIsInWatchlist = (smeId: string) => {
  const { data: watchlist } = useWatchlist();

  return {
    isInWatchlist: watchlist?.some((item) => item.targetId === smeId) ?? false,
    watchlistItem: watchlist?.find((item) => item.targetId === smeId),
  };
};
