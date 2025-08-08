import api, { unauthenticatedAxios } from "@/api/axios";
import { ApiEndPoints } from "@/api/endpoints";
import { authAtom } from "@/lib/atoms/atoms";
import {
  PersonalInfoInputs,
  RegisterCredentials,
  SMEsBusinessInfo,
} from "@/lib/uitils/types";
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

  const refresh_token = useMutation({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("refresh"),
        cred
      );
    },
  });
  const verify_email = useMutation<
    VerifyResponse,
    Error,
    { email: string; otp: string }
  >({
    mutationFn: async (cred): Promise<VerifyResponse> => {
      return unauthenticatedAxios.post(
        ApiEndPoints.Auth_Activity("verify-email"),
        cred
      );
    },
  });
   const resend_otp = useMutation<
     VerifyResponse,
     Error,
     { email: string}
   >({
     mutationFn: async (cred): Promise<VerifyResponse> => {
       return unauthenticatedAxios.post(
         ApiEndPoints.Auth_Activity("resend-otp"),
         cred
       );
     },
   });
  const forgot_password = useMutation<VerifyResponse, Error, { email: string }>(
    {
      mutationFn: async (cred): Promise<VerifyResponse> => {
        return unauthenticatedAxios.post(
          ApiEndPoints.Auth_Activity("forgot-password"),
          cred
        );
      },
    }
  );
  const reset_password = useMutation<
    VerifyResponse,
    Error,
    { new_password: string; confirm_password: string }
  >({
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
      return api.post(ApiEndPoints.Register_Activity("personal-info"), cred);
    },
  });

  const dev_org = useMutation({
    mutationFn: (cred: any) => {
      return api.post(ApiEndPoints.Register_Activity("dev-org-info"), cred);
    },
  });
  const smes_bussiness_info = useMutation({
    mutationFn: (cred: SMEsBusinessInfo): Promise<any> => {
      return api.post(
        ApiEndPoints.Register_Activity("sme-business-info"),
        cred
      );
    },
  });
  const investor_investment_info = useMutation({
    mutationFn: (cred): Promise<any> => {
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
  const next_step_reg = useMutation({
    mutationFn: () => api.get(ApiEndPoints.Register_Activity("next-step")),
  });


  return {
    logninMutation,
    registerMutation,
    refresh_token,
    googleSigninMutation,
    forgot_password,
    reset_password,
    signOutMutation,
    verify_email,
    resend_otp,
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
