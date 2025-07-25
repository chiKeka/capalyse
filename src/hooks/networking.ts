import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { useQuery } from "@tanstack/react-query";

export const useNetworking = () => {
    return useQuery({
      queryKey: ["networking"],
      queryFn: async () => {
        const resp = await api.get(ApiEndPoints.networking);
        return resp?.data;
      },
    });
}

export const useSingleNetworking = () => {
  return useQuery({
    queryKey: ["networking"],
    queryFn: async () => {
      const resp = await api.get(ApiEndPoints.networking);
      return resp?.data;
    },
  });
};