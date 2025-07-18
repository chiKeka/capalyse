import api, { unauthenticatedAxios } from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { RegisterCredentials } from "@/lib/uitils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
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

export const useAuth = () => {
  const router = useRouter();
  const logninMutation = useMutation<
    VerifyResponse,
    Error,
    RegisterCredentials
  >({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("login"),
        cred
      );
    },
  });

  const registerMutation = useMutation<
    VerifyResponse,
    Error,
    RegisterCredentials
  >({
    mutationFn: async (cred) => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Register_Activity("initiate"),
        cred
      );
    },
  });
  const googleSigninMutation = useMutation({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("google"),
        cred
      );
    },
  });
  const current_user = useQuery({
    queryKey: ["current_user"],
    queryFn: () =>
      unauthenticatedAxios.get(ApiEndPoints.Auth_Activity("me")),
  });
  const refresh_token = useMutation({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("refresh"),
        cred
      );
    },
  });
  const verify_email = useMutation({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("verify-email"),
        cred
      );
    },
  });
  const forgot_password = useMutation({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("forgot-password"),
        cred
      );
    },
  });
  const reset_password = useMutation({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("reset-password"),
        cred
      );
    },
  });
  const change_password = useMutation({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("change-password"),
        cred
      );
    },
  });
  const generate_token = useMutation({
    mutationFn: async (): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(ApiEndPoints.Auth_Activity("token"));
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      return unauthenticatedAxios.post(ApiEndPoints.Auth_Activity("logout"));
    },
  });

  /// Auth Register activity

  const personal_information = useMutation({
    mutationFn: (cred) => {
      return api.post(ApiEndPoints.Register_Activity("personal-info"), cred);
    },
  });

  const dev_org = useMutation({
    mutationFn: (cred) => {
      return api.post(ApiEndPoints.Register_Activity("dev-org-info"), cred);
    },
  });
  const smes_bussiness_info = useMutation({
    mutationFn: (cred) => {
      return api.post(
        ApiEndPoints.Register_Activity("sme-business-info"),
        cred
      );
    },
  });
  const investor_investment_info = useMutation({
    mutationFn: (cred) => {
      return api.post(
        ApiEndPoints.Register_Activity("investor-investment-info"),
        cred
      );
    },
  });
  const investor_org_info = useMutation({
    mutationFn: (cred) => {
      return api.post(
        ApiEndPoints.Register_Activity("investor-organization-info"),
        cred
      );
    },
  });
  const next_step_reg = useQuery({
    queryKey: ["next-step-reg"],
    queryFn: () => api.get(ApiEndPoints.Register_Activity("next-step")),
  });
  return {
    logninMutation,
    registerMutation,
    refresh_token,
    current_user,
    googleSigninMutation,
    forgot_password,
    reset_password,
    logout,
    verify_email,
    personal_information,
    smes_bussiness_info,
    dev_org,
    investor_investment_info,
    next_step_reg,
    investor_org_info,
    generate_token,
    change_password,
  };
};
