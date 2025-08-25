import {
  emailOTPClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  fetchOptions: {
    credentials: "include",
  },
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  basePath: "/api/v1/auth",
  plugins: [
    organizationClient(),
    inferAdditionalFields({
      user: {
        roles: {
          type: "string",
        },
        profileCompletionStep: {
          type: "number",
        },
      },
    }),
    emailOTPClient(),
    nextCookies(),
  ],
});

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  getSession,
  forgetPassword,
  resetPassword,
  getAccessToken,
  verifyEmail,
  sendVerificationEmail,
  emailOtp,
} = authClient;
// export type Session = typeof authClient.$Infer.Session;
// export type Session = typeof authClient.$Infer.Session;
