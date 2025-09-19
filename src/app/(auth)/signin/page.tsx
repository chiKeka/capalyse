"use client";
import AuthLayout from "@/components/layout/auth";
import GetStarted from "@/components/layout/GetStarted";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import PasswordChecker from "@/components/ui/passwordChecker";
import { useGetProfileNextStep } from "@/hooks/useProfileManagement";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient, useSession } from "@/lib/auth-client";
import { routes } from "@/lib/routes";
import { getKeyByValue, validateAuthForm } from "@/lib/uitils/fns";
import { onboardingSteps, UserType } from "@/lib/utils";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
type Props = {};

function page({}: Props) {
  const [form, setForm] = useState({ email: "", password: "", role: "SME" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const setAuth = useSetAtom(authAtom);
  const router = useRouter();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const [isLoading, setIsLoading] = useState(false);
  const { data: profileNextStep } = useGetProfileNextStep();
  const sessionData = useSession();
  const isIncompleteStep =
    profileNextStep?.completedSteps?.length! <
    onboardingSteps.find(
      (step) => step.role === sessionData?.data?.user?.roles!
    )?.steps?.length!;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAuthForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    await authClient.signIn.email(
      {
        email: form.email,
        password: form.password,
      },

      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          authClient.getSession().then((ctx) => {
            const { data } = ctx;
            setAuth(data?.user as any);
            if (!data?.user?.emailVerified) {
              authClient.emailOtp.sendVerificationOtp({
                email: form?.email,
                type: "email-verification",
              });
              router.push(`/verify?email=${data?.user?.email}`);
              return;
            }
            if (data?.user?.roles === "ADMIN") {
              router.push(`/admin`);
              return;
            } else {
              const rootRoute = getKeyByValue(UserType, data?.user?.roles);

              if (rootRoute && isIncompleteStep) {
                router?.push(`/${rootRoute}/onboarding`);
              }
              // else {
              //   router.push(
              //     routes?.[rootRoute?.toLowerCase() as keyof typeof routes]
              //       ?.root
              //   );
              // }
            }
          });
          setIsLoading(false);
          toast.success("Sign in successful");
        },
        onError: (ctx) => {
          console.log({ ctx });
          setIsLoading(false);
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <>
      <AuthLayout google_signtures={true} title="Sign in your account">
        <form onSubmit={handleSubmit} className="w-full">
          <Input
            name="email"
            onChange={handleChange}
            type="email"
            label="Email"
            className="h-[43px]"
            placeholder="janeearnest@gmail.com"
            value={form.email}
          />
          {errors.email && (
            <div className="text-red-500 text-xs mt-1">{errors.email}</div>
          )}

          <Input
            name="password"
            onChange={handleChange}
            className="h-[43px]"
            type="password"
            label="Password"
            placeholder="**********"
            value={form.password}
          />
          {form.password && <PasswordChecker password={form.password} />}
          {errors.password && (
            <div className="text-red-500 text-xs -mt-1 mb-1">
              {errors.password}
            </div>
          )}

          <div className="mb-12">
            Forgot password?{" "}
            <Button
              onClick={() => router.push("/forgot_password")}
              variant="tertiary"
              size="small"
              className="text-green hover:bg-transparent"
            >
              Reset password
            </Button>
          </div>
          <Button
            disabled={isLoading}
            type="submit"
            size="medium"
            variant="primary"
            className="font-bold w-full"
            state={isLoading ? "loading" : "default"}
          >
            Sign in
          </Button>
          <div className="flex flex-col items-center justify-center my-6">
            <p className="flex font-normal text-sm text-center items-center">
              Don't have an account ?.
              <GetStarted
                component={
                  <Button
                    variant="ghost"
                    className="text-green !px-0.5"
                    size="medium"
                  >
                    Create account
                  </Button>
                }
              />
            </p>
          </div>
        </form>
      </AuthLayout>
    </>
  );
}

export default page;
