import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSmeProfile = () => {
  const queryClient = useQueryClient();
  const updateSmeBusinessInfo = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.put(ApiEndPoints.SMEs_Profile("business-info"), cred);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current_profile"] });
    },
  });

  const updateSmeBusinessDetails = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.put(ApiEndPoints.SMEs_Profile("business-details"), cred);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current_profile"] });
    },
  });

  const delTeamMemeber = useMutation({
    mutationFn: async (): Promise<any> => {
      return api.delete(ApiEndPoints.Delete_SMEs_profile("memberId"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current_profile"] });
    },
  });

  return {
    updateSmeBusinessInfo,
    updateSmeBusinessDetails,
    delTeamMemeber,
  };
};
