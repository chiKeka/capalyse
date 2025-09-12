import api from "@/api/axios";
import { ApiEndPoints, investorsAnalytics } from "@/api/endpoints";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetProfileNextStep = () => {
  return useQuery({
    queryKey: ["profile_next_step"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Profile_Next_Step);
      return response?.data;
    },
  });
};

export const ProfileData = () => {
  return useQuery({
    queryKey: ["current_profile"],
    queryFn: async () => {
      const response = await api.get(ApiEndPoints.Profile);
      return response?.data;
    },
  });
};
export const useGetProfileCompletionStatus = () => {
  return useQuery({
    queryKey: ["current_profile_status"],
    queryFn: () => api.get(ApiEndPoints.Profile_Completion),
  });
};

export const useUpdatePersonalInfo = () => {
  return useMutation({
    mutationFn: async (cred): Promise<any> => {
      api.put(ApiEndPoints.Profile_Info, cred);
    },
  });
};

export const useGetInvestorsAnalytics = () => {
  return useQuery({
    queryKey: ["investors_analytics"],
    queryFn: async () => {
      const response = await api.get(investorsAnalytics.getInvestorsAnalytics);
      return response?.data;
    },
  });
};
