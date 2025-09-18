import { useGetProfileNextStep } from "@/hooks/useProfileManagement";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient, useSession } from "@/lib/auth-client";
import { onboardingSteps } from "@/lib/utils";
import { useSetAtom } from "jotai";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

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

  const googleSignIn = async () => {
    setIsLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/signin`,
      fetchOptions: {
        onSuccess: (ctx) => {
          console.log({ ctx });
          window.open(ctx.data.url, "_blank");
        },
        onError: (ctx) => {
          console.log({ ctx });
        },
      },
    });
// https://accounts.google.com/signin/oauth/id?authuser=0&part=AJi8hANcebQQvjdZvJnbY_vguiv3k6K3wjzCbf6lLpdRbI3-nekCFIkBSOB_7qKUHuGN2b9PogpzSEGzDGWB4AQf-4evOeYtMuNgd3GfBEjeXY1PGeAB9wt2LJj9EUB8UrfjZMCtBNQYzyxzXqriRfyxatRiXjxW_V2B-dXJbO4bpPESK5O1E30EAo-_FoWG2CLa0tdfOUvW9PXgD6HztX4Rq4uRhFew7wdwHf-QkQXXnpEeJy2NadYE74VNrcBkYYxPAY_lpMQRP8s10dP9H7Wn0n9aeAMi0KhnFXhcvJAsxuO5XqYmWIkNSSyG0za74lF3-2X6cGAMDMXuq86MYlkNPsS-CcAaALf0Sfhc1_PvVlghNVAyF1U27sgctw6q_VBSz5yXykX-9-m1juzljuPJVKQhCI2Hvkgh8iAKL-jRkfe1K-FAldAgAsQPgAWFoMdAmrF18mBmKK3OhgouCkx7lSW9XTTEQtNVSFcAxpOVqJqwOk_Hb4_gVlwJ8mFV7cIltwYV6l0_hfNRQ98O5-W4JL4HOHXZvl9iKtuDL-UL3NccBNRlDAQBNZTvtjobr3FcLN8kB-lbM8fYsAiuhz9bXVIUHN7-TL2h7tvShi4QBy-yZJufaHh4bY73lXQmhnQSnLHMZPUIZ59EFClTf59Y56FHapjyQhrGicITNB3_I4Pjmsu6GC7xRxWr7zIrCERTvHIOhLpWni-VsoYr1-yubytpTk4WiXLUmyBoioHo5woebKK4mjHWciMLIUJIKOH-N3hD7nFvD5auS-TfAUa9kwKu8MwlSVAFEysUtaR6kRhs-o8STZMeZ_EHn6_U8IqsrxRQCyGX3mW6eNYnEM-Q3pcQLbq1rJxyNIzJGBAygXvQCb5gkY8&flowName=GeneralOAuthFlow&as=S370931207%3A1758192269412527&client_id=238892016831-58d1i8ahh6gke6d01d1d0duaeodd22ef.apps.googleusercontent.com&rapt=AEjHL4OT5E4th2Dw0WJCn3RthJWXc4BVIlyA7Q8eEXqpB-oRkQqQpNVT6UJunhc9glz3w2TA7IWAlPUfFEt4sT0vnfu5Ld51sQ#
    // .then(async (ctx) => {

    //   const { data } = ctx as any;
    //   await authClient.getSession().then((ctx) => {
    //     const { data } = ctx as any;
    //     setAuth(data?.user as any);
    //     console.log({ ctx });
    //   });
    //   setAuth(data?.user as any);
    //   setIsLoading(false);
    //   // if (data?.user?.roles === "ADMIN") {
    //   //   router.push(`/admin`);
    //   //   return;
    //   // }

    //   const rootRoute = getKeyByValue(UserType, data?.user?.roles);
    //   // if (rootRoute) {
    //   //   if (data?.user?.profileCompletionStep) {
    //   //     router.push(`/${rootRoute}/onboarding`);
    //   //   } else {
    //   //     router.push(
    //   //       routes?.[rootRoute?.toLowerCase() as keyof typeof routes]?.root
    //   //     );
    //   //   }
    //   // }
    // })
    // .catch((err) => {
    //   console.log({ err });
    //   setIsLoading(false);
    // });
  };

  // Handle redirect logic in useEffect to avoid setState during render
  // useEffect(() => {
  //   const shouldRedirect =
  //     isAuth &&
  //     !isRedirecting &&
  //     (pathname.includes("signin") || pathname.includes("signup"));

  //   if (shouldRedirect) {
  //     setIsRedirecting(true);
  //     if (isAuth?.user?.roles === "ADMIN") {
  //       router.push("/admin");
  //     } else {
  //       const rootRoute = getKeyByValue(UserType, isAuth?.user?.roles);
  //       if (rootRoute) {
  //         if (isIncompleteStep) {
  //           router?.push(`/${rootRoute}/onboarding`);
  //         } else {
  //           router.push(
  //             routes?.[rootRoute?.toLowerCase() as keyof typeof routes]?.root
  //           );
  //         }
  //       } else {
  //         router.push("/");
  //       }
  //     }
  //   }
  // }, [isAuth, pathname, isIncompleteStep, router, isRedirecting]);

  // Show loading state while checking auth or redirecting

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
