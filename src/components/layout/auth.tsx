import { useGetProfileNextStep } from "@/hooks/useProfileManagement";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient, useSession } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { getKeyByValue } from "@/lib/uitils/fns";
import { onboardingSteps, UserType } from "@/lib/utils";
import Cookies from "js-cookie";
import { useAtomValue, useSetAtom } from "jotai";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/api/axios";

interface AuthLayoutProps {
  title?: string;
  children: React.ReactNode;
  google_signtures?: boolean;
  sub_caption?: string;
  inputFieldSize?: string;
  layoutSize?: string;
  noRedirect?: boolean;
}

const LOGIN_OPTION_COOKIE_KEY = "capalyze_auth_login_option";
const USER_TYPE_COOKIE_KEY = "capalyze_auth_user_type";

const cookieOptions = {
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const resolveRoleValue = (raw?: string | null) => {
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  const fromKey = UserType[lower as keyof typeof UserType];
  if (fromKey) return fromKey.toUpperCase();
  const fromValue = Object.values(UserType).find((value) => value.toLowerCase() === lower);
  return fromValue ? fromValue.toUpperCase() : undefined;
};

const deriveRoleFromPathname = (pathname: string | null) => {
  if (!pathname) return undefined;
  const [segment] = pathname.split("/").filter(Boolean);
  if (!segment) return undefined;
  return resolveRoleValue(segment);
};

const removeCookie = (key: string) => Cookies.remove(key, { path: cookieOptions.path });

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  children,
  google_signtures,
  sub_caption,
  noRedirect = false,
  inputFieldSize = "max-w-md ",
  layoutSize = "lg:max-w-2xl",
}) => {
  const setAuth = useSetAtom(authAtom);
  const auth = useAtomValue(authAtom);
  const router = useRouter();
  const { data: profileNextStep } = useGetProfileNextStep();
  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: isAuth, isPending: isAuthLoading } = authClient.useSession();
  const roleUpdateInFlight = useRef(false);

  const rootRoute = getKeyByValue(UserType, isAuth?.user?.role!);
  const sessionData = useSession();
  const isIncompleteStep =
    profileNextStep?.completedSteps?.length! <
    onboardingSteps.find((step) => step.role === sessionData?.data?.user?.role!)?.steps?.length!;

  const computePreferredRole = useCallback(() => {
    const roleFromPath = deriveRoleFromPathname(pathname);
    if (roleFromPath) return roleFromPath;
    const paramRole = urlSearchParams?.get("type") ?? urlSearchParams?.get("accessType");
    const resolvedParamRole = resolveRoleValue(paramRole);
    if (resolvedParamRole) return resolvedParamRole;
    return resolveRoleValue(Cookies.get(USER_TYPE_COOKIE_KEY));
  }, [pathname, urlSearchParams]);

  const googleSignIn = async () => {
    setIsLoading(true);
    Cookies.set(LOGIN_OPTION_COOKIE_KEY, "google", cookieOptions);
    const preferredRole = computePreferredRole();
    if (preferredRole) {
      Cookies.set(USER_TYPE_COOKIE_KEY, preferredRole, cookieOptions);
    }
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window?.location?.origin}/signin`,
    });
  };

  useEffect(() => {
    const sessionUser = sessionData?.data?.user;
    if (!sessionUser) return;

    const loginOption = Cookies.get(LOGIN_OPTION_COOKIE_KEY);
    if (loginOption !== "google") return;

    if (sessionUser.role && sessionUser.role !== "user") {
      removeCookie(LOGIN_OPTION_COOKIE_KEY);
      return;
    }

    if (roleUpdateInFlight.current) return;
    const savedRole = computePreferredRole();
    if (!savedRole) return;

    roleUpdateInFlight.current = true;
    api
      .post("/profile/set-role", { role: savedRole.toLowerCase() })
      .then(() => {
        removeCookie(LOGIN_OPTION_COOKIE_KEY);
        removeCookie(USER_TYPE_COOKIE_KEY);
        authClient.getSession().then((session) => {
          setAuth(session?.data?.user);
        });
        const onboardRootRoute = getKeyByValue(UserType, savedRole);
        router.push(`/${onboardRootRoute}/onboarding`);
      })
      .catch(() => {
        roleUpdateInFlight.current = false;
      })
      .finally(() => {
        roleUpdateInFlight.current = false;
      });
  }, [computePreferredRole, sessionData?.data?.user, setAuth]);

  useEffect(() => {
    const getSession = async () => {
      const session = await authClient.getSession();
      setAuth(session?.data?.user);
    };
    if (!auth) {
      getSession();
    }

    if (!noRedirect && auth) {
      if (auth.role?.toUpperCase() === "ADMIN") {
        router?.push("/admin");
        return;
      }
      if (rootRoute) {
        if (isIncompleteStep) {
          router?.push(`/${rootRoute}/onboarding`);
        } else {
          router?.push(routes?.[rootRoute?.toLowerCase() as keyof typeof routes]?.root);
        }
      }
    }
  }, [isAuth, isIncompleteStep, rootRoute, routes, router, isAuthLoading, auth, noRedirect]);

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center bg-[#EEF6F4]  px-4">
      <div
        className={`w-full px-4 h-auto ${layoutSize} bg-white flex-col flex gap-8 rounded-4xl border border-[#EEF6F4]  items-center  py-10  shadow-lg`}
      >
        <Link href={"/"}>
          <img src="/logo.png" className="w-[199px] h-[47px]" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#2E3034]  text-center">{title}</h2>
          {sub_caption && (
            <p className="text-[#8A8A8A] text-center text-sm mt-2 font-normal">{sub_caption}</p>
          )}
        </div>

        {google_signtures && (
          <>
            <button
              onClick={googleSignIn}
              disabled={isLoading}
              className="max-w-md w-full cursor-pointer gap-3 rounded-lg  py-3 font-medium text-sm text-[#2E3034] items-center flex border-[0.5] border-[#829AD9] justify-center"
            >
              <img
                src={"/icons/google.svg"}
                className={`${isLoading ? "animate-spin" : ""} w-4 h-4`}
              />{" "}
              Sign up with Google
            </button>
            <div className="flex w-full max-w-md gap-2 items-center justify-center ">
              <hr className="h-[0.5px] w-full bg-[#1261AC]" /> or
              <hr className="h-[0.5px] w-full bg-[#1261AC]" />
            </div>
          </>
        )}

        <div className={`w-full ${inputFieldSize} flex-col items-center justify-center flex`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
