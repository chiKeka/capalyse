import api from "@/api/axios";
import { ApiEndPoints, apiRoutes } from "@/api/endpoints";
import { authAtom } from "@/lib/atoms/atoms";
import { PersonalInfoInputs, SMEsBusinessInfo } from "@/lib/uitils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export interface VerifyResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    message?: string;
    data?: any;
  };
}

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["current_user"],
    queryFn: () => api.get(ApiEndPoints.Auth_Activity("me")),
  });
};

export const useAuth = () => {
  const router = useRouter();
  const setAuth = useSetAtom(authAtom);
  const queryClient = useQueryClient();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      // Best effort call to backend, client logout should proceed regardless
      try {
        await api.post(ApiEndPoints.Auth_Activity("logout"));
      } catch (error) {
        console.error("Backend logout failed, proceeding with client logout.");
      }
    },
    onSuccess: () => {
      // 1. Remove all cookies
      Object.keys(Cookies.get()).forEach((cookieName) =>
        Cookies.remove(cookieName)
      );
      // 2. Reset Jotai auth state
      setAuth(null);
      // 3. Clear react-query cache and redirect
      queryClient.clear();
      router.push("/signin");
    },
  });

  /// Auth Register activity

  const personal_information = useMutation({
    mutationFn: async (cred: Partial<PersonalInfoInputs>): Promise<any> => {
      return api.put(apiRoutes?.auth.updatePersonalInfo, cred);
    },
  });

  const dev_org = useMutation({
    mutationFn: (cred: any) => {
      return api.put(apiRoutes?.auth?.updateDevOrgInfo, cred);
    },
  });
  const smes_bussiness_info = useMutation({
    mutationFn: (cred: SMEsBusinessInfo): Promise<any> => {
      return api.put(apiRoutes?.auth?.updateSmeBusinessInfo, cred);
    },
  });
  const investor_investment_info = useMutation({
    mutationFn: (cred): Promise<any> => {
      return api.put(apiRoutes?.auth?.updateInvestorInvestmentInfo, cred);
    },
  });
  const investor_org_info = useMutation({
    mutationFn: (cred) => {
      return api.put(apiRoutes?.auth?.updateInvestorOrganizationInfo, cred);
    },
  });
  const next_step_reg = useMutation({
    mutationFn: () => api.get(ApiEndPoints.Register_Activity("next-step")),
  });

  return {
    // logninMutation,
    // registerMutation,
    // refresh_token,
    // googleSigninMutation,
    // forgot_password,
    // reset_password,
    // signOutMutation,
    // verify_email,
    // resend_otp,
    personal_information,
    smes_bussiness_info,
    dev_org,
    investor_investment_info,
    next_step_reg,
    investor_org_info,
    // generate_token,
    // change_password,
  };
};
