"use client";
import AuthLayout from "@/components/layout/auth";
import Link from "next/link";
import GetStarted from "@/components/layout/GetStarted";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import PasswordChecker from "@/components/ui/passwordChecker";
import { useGetProfileNextStep } from "@/hooks/useProfileManagement";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient, useSession } from "@/lib/auth-client";
import { getKeyByValue, validateAuthForm } from "@/lib/uitils/fns";
import { onboardingSteps, UserType } from "@/lib/utils";
import { useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import React, { Suspense, useState } from "react";
import { toast } from "sonner";
import { routes } from "@/lib/routes";
import {
  BarChart3,
  Shield,
  Users,
  TrendingUp,
  Lock,
  CheckCircle2,
} from "lucide-react";

type Props = {};

const features = [
  {
    icon: BarChart3,
    title: "Investment Readiness",
    description: "AI-powered assessments to measure and improve your funding potential",
  },
  {
    icon: Users,
    title: "Investor Matching",
    description: "Connect with verified investors aligned with your sector and stage",
  },
  {
    icon: TrendingUp,
    title: "Growth Analytics",
    description: "Track performance metrics and monitor your business trajectory",
  },
  {
    icon: Shield,
    title: "Compliance Tools",
    description: "Stay compliant across AfCFTA, ECOWAS, SADC, and EAC frameworks",
  },
];

function SignIn({}: Props) {
  const [form, setForm] = useState({ email: "", password: "", role: "sme" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [rememberMe, setRememberMe] = useState(false);
  const setAuth = useSetAtom(authAtom);
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const { data: profileNextStep } = useGetProfileNextStep();
  const sessionData = useSession();

  const isIncompleteStep =
    profileNextStep?.completedSteps?.length! <
    onboardingSteps.find((step) => step.role === sessionData?.data?.user?.role!)?.steps?.length!;

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
          console.log({ ctx });
          authClient.getSession().then((ctx) => {
            const { data } = ctx;
            console.log({ data });
            if (data) {
              setAuth(data?.user);
              if (!data?.user?.emailVerified) {
                authClient.emailOtp.sendVerificationOtp({
                  email: form?.email,
                  type: "email-verification",
                });
                router.push(`/verify?email=${data?.user?.email}`);
                return;
              }
              if (data?.user?.role?.toLowerCase() === "admin") {
                router.push(`/admin`);
                return;
              } else {
                const rootRoute = getKeyByValue(UserType, data?.user?.role);

                if (rootRoute && isIncompleteStep) {
                  router?.push(`/${rootRoute}/onboarding`);
                } else {
                  router.push(
                    // @ts-ignore
                    routes?.[rootRoute?.toLowerCase() as keyof typeof routes]?.root ?? "/dashboard",
                  );
                }
              }
            } else {
              throw new Error("Signin faled no session found");
            }
          });
          setIsLoading(false);
          toast.success("Sign in successful");
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-[#006a4e] to-[#008060] text-white flex-col justify-between p-10 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10">
          <Link href="/">
            <img src="/logo.png" className="h-10 brightness-0 invert mb-12" alt="Capalyse" />
          </Link>

          <h2 className="text-3xl font-bold mb-3">Welcome back</h2>
          <p className="text-white/80 text-base mb-10">
            Sign in to access your dashboard and continue building your investment-ready business.
          </p>

          <div className="space-y-5">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4.5 h-4.5 text-white/90" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white">{feature.title}</h4>
                  <p className="text-white/70 text-sm mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 mt-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/10">
            <p className="text-white/90 text-sm italic leading-relaxed">
              &ldquo;Capalyse helped us understand what investors were looking for and prepare
              accordingly. Within 3 months, we secured our first round of funding.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                AO
              </div>
              <div>
                <p className="text-white text-sm font-medium">Amara Osei</p>
                <p className="text-white/60 text-xs">CEO, GreenTech Solutions, Ghana</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-[#EEF6F4] px-4 sm:px-8 py-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/">
              <img src="/logo.png" className="w-[160px]" alt="Capalyse" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
              <p className="text-gray-500 text-sm mt-1">
                Enter your credentials to access the platform
              </p>
            </div>

            {/* Google Sign In */}
            <AuthLayout google_signtures={true} title="" layoutSize="max-w-md" inputFieldSize="max-w-md">
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  label="Email"
                  className="h-[43px]"
                  placeholder="you@company.com"
                  value={form.email}
                />
                {errors.email && (
                  <div className="text-red-500 text-xs mt-1 -mb-2">{errors.email}</div>
                )}

                <Input
                  name="password"
                  onChange={handleChange}
                  className="h-[43px]"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={form.password}
                />
                {form.password && <PasswordChecker password={form.password} />}
                {errors.password && (
                  <div className="text-red-500 text-xs -mt-1 mb-1">{errors.password}</div>
                )}

                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#008060] focus:ring-[#008060]"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Button
                    onClick={() => router.push("/forgot_password")}
                    variant="tertiary"
                    size="small"
                    className="text-[#008060] hover:bg-transparent text-sm px-0!"
                  >
                    Forgot password?
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

                <div className="text-xs text-gray-500 text-center mt-4">
                  By signing in, you agree to our{" "}
                  <Link href="/terms" className="text-[#008060] hover:underline">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#008060] hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </div>

                <div className="flex flex-col items-center justify-center mt-6">
                  <p className="flex font-normal text-sm text-center items-center text-gray-600">
                    Don&apos;t have an account?
                    <GetStarted
                      component={
                        <Button variant="ghost" className="text-[#008060] px-1! font-bold" size="medium">
                          Create account
                        </Button>
                      }
                    />
                  </p>
                </div>
              </form>
            </AuthLayout>
          </div>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>256-bit encryption</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>POPIA compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SignInPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#EEF6F4]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008060]" /></div>}>
      <SignIn />
    </Suspense>
  );
};

export default SignInPage;
