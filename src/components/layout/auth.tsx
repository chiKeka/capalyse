import { useGetProfileNextStep } from "@/hooks/useProfileManagement";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient, useSession } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { getKeyByValue } from "@/lib/uitils/fns";
import { onboardingSteps, UserType } from "@/lib/utils";
import { useSetAtom } from "jotai";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface AuthLayoutProps {
  title?: string;
  children: React.ReactNode;
  google_signtures?: boolean;
  sub_caption?: string;
  inputFieldSize?: string;
  layoutSize?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  children,
  google_signtures,
  sub_caption,
  inputFieldSize = "max-w-md ",
  layoutSize = "lg:max-w-2xl",
}) => {
  const setAuth = useSetAtom(authAtom);
  const router = useRouter();
  const { data: profileNextStep } = useGetProfileNextStep();
  const urlSearchParams = useSearchParams();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { data: isAuth, isPending: isAuthLoading } = authClient.useSession();

  const sessionData = useSession();
  const isIncompleteStep =
    profileNextStep?.completedSteps?.length! <
    onboardingSteps.find(
      (step) => step.role === sessionData?.data?.user?.roles!
    )?.steps?.length!;

  // Handle redirect logic in useEffect to avoid setState during render
  useEffect(() => {
    const shouldRedirect =
      isAuth &&
      !isRedirecting &&
      (pathname.includes("signin") || pathname.includes("signup"));

    if (shouldRedirect) {
      setIsRedirecting(true);
      if (isAuth?.user?.roles === "ADMIN") {
        router.push("/admin");
      } else {
        const rootRoute = getKeyByValue(UserType, isAuth?.user?.roles);
        if (rootRoute) {
          if (isIncompleteStep) {
            router?.push(`/${rootRoute}/onboarding`);
          } else {
            router.push(
              routes?.[rootRoute?.toLowerCase() as keyof typeof routes]?.root
            );
          }
        } else {
          router.push("/");
        }
      }
    }
  }, [isAuth, pathname, isIncompleteStep, router, isRedirecting]);

  // Show loading state while checking auth or redirecting
  const googleSignIn = async () => {
    setIsLoading(true);
    await authClient.signIn
      .social({
        provider: "google",
        callbackURL: "/signin",
      })
      .then((ctx) => {
        const { data } = ctx as any;
        setAuth(data?.user as any);
        setIsLoading(false);
        if (data?.user?.roles === "ADMIN") {
          router.push(`/admin`);
          return;
        }

        const rootRoute = getKeyByValue(UserType, data?.user?.roles);
        if (rootRoute) {
          if (data?.user?.profileCompletionStep) {
            router.push(`/${rootRoute}/onboarding`);
          } else {
            router.push(
              routes?.[rootRoute?.toLowerCase() as keyof typeof routes]?.root
            );
          }
        }
      })
      .catch((err) => {
        console.log({ err });
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center bg-[#EEF6F4]  px-4">
      <div
        className={`w-full px-4 h-auto ${layoutSize} bg-white flex-col flex gap-8 rounded-4xl border border-[#EEF6F4]  items-center  py-10  shadow-lg`}
      >
        <img src="/logo.png" className="w-[199px] h-[47px]" />
        <div>
          <h2 className="text-xl font-bold text-[#2E3034]  text-center">
            {title}
          </h2>
          {sub_caption && (
            <p className="text-[#8A8A8A] text-center text-sm mt-2 font-normal">
              {sub_caption}
            </p>
          )}
        </div>

        {google_signtures && (
          <>
            <button
              onClick={googleSignIn}
              disabled={isLoading}
              className="max-w-md w-full gap-3 rounded-lg  py-3 font-medium text-sm text-[#2E3034] items-center flex border-[0.5] border-[#829AD9] justify-center"
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

        <div
          className={`w-full ${inputFieldSize} flex-col items-center justify-center flex`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
