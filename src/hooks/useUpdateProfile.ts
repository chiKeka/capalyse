import api from '@/api/axios';
import { profileRoutes } from '@/api/endpoints';
import { PersonalInfoInputs, SMEsBusinessInfo } from '@/lib/uitils/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface VerifyResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    message?: string;
    data?: any;
  };
}

// export const useGetCurrentUser = () => {
//   return useQuery({
//     queryKey: ["current_user"],
//     queryFn: () => api.get(ApiEndPoints.Auth_Activity("me")),
//   });
// };

export const getCurrentProfile = () => {
  return useQuery({
    queryKey: ['current_profile'],
    queryFn: async () => {
      const response = await api.get(profileRoutes.get);

      const user = response?.data;
      return user;
    },
  });
};

export const updateProfile = () => {
  const queryClient = useQueryClient();

  const personal_information = useMutation({
    mutationFn: async (cred: Partial<PersonalInfoInputs>): Promise<any> => {
      return api.put(profileRoutes.updatePersonalInfo, cred);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current_profile'] });
    },
  });

  const dev_org = useMutation({
    mutationFn: (cred: any) => {
      return api.put(profileRoutes.updateDevOrgInfo, cred);
    },
  });
  const smes_bussiness_info = useMutation({
    mutationFn: (cred: SMEsBusinessInfo): Promise<any> => {
      return api.put(profileRoutes.updateSmeBusinessInfo, cred);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current_profile'] });
    },
  });
  const investor_investment_info = useMutation({
    mutationFn: (cred): Promise<any> => {
      return api.put(profileRoutes.updateInvestorInvestmentInfo, cred);
    },
  });
  const investor_org_info = useMutation({
    mutationFn: (cred) => {
      return api.put(profileRoutes.updateInvestorOrganizationInfo, cred);
    },
  });

  const update_business_summary = useMutation({
    mutationFn: (cred) => {
      return api.put(profileRoutes.updateBusinessSummary, cred);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current_profile'] });
    },
  });

  const next_step_reg = useMutation({
    mutationFn: () => api.get(profileRoutes.getRegisterNextStep),
  });

  const updateTeamMemeber = useMutation({
    mutationFn: async (cred): Promise<any> => {
      return api.put(profileRoutes.addTeamMember, cred);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current_profile'] });
    },
  });

  return {
    personal_information,
    smes_bussiness_info,
    dev_org,
    investor_investment_info,
    next_step_reg,
    investor_org_info,
    updateTeamMemeber,
    update_business_summary,
  };
};
