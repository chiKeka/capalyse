import api from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { useMutation } from "@tanstack/react-query";

export const useSmeProfile = () => {


  const updateSmeBusinessInfo = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.put(ApiEndPoints.SMEs_Profile("business-info"), cred);
    },
  });

  

  const updateSmeBusinessDetails = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.put(ApiEndPoints.SMEs_Profile("business-details"), cred);
    },
  });

  const updateTeamMemeber = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.put(ApiEndPoints.SMEs_Profile("team"), cred);
    },
  });

  const delTeamMemeber = useMutation({
    mutationFn: async (): Promise<any> => {
      return api.delete(ApiEndPoints.Delete_SMEs_profile("memberId"));
    },
  });

  return {
    updateSmeBusinessInfo,
    updateTeamMemeber,
    updateSmeBusinessDetails,
    delTeamMemeber,
  };
};
