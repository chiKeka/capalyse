"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import PasswordChecker from "@/components/ui/passwordChecker";
import { authClient } from "@/lib/auth-client";
import { validateAuthForm } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  Building2,
  HandCoins,
  Shield,
  Users,
  TrendingUp,
  Lock,
  CheckCircle2,
  Briefcase,
  Globe2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Role-specific content                                              */
/* ------------------------------------------------------------------ */

const roleContent: Record<
  string,
  {
    label: string;
    tagline: string;
    description: string;
    benefits: { icon: React.ComponentType<{ className?: string }>; text: string }[];
    color: string;
  }
> = {
  sme: {
    label: "SME",
    tagline: "Get Investment-Ready",
    description:
      "Join hundreds of African SMEs using Capalyse to assess their readiness, connect with investors, and scale their business.",
    benefits: [
      { icon: BarChart3, text: "AI-powered investment readiness assessment" },
      { icon: Users, text: "Direct access to verified investors" },
      { icon: TrendingUp, text: "Growth analytics and performance tracking" },
      { icon: Shield, text: "Multi-framework compliance tools" },
    ],
    color: "#008060",
  },
  investor: {
    label: "Investor",
    tagline: "Discover High-Potential SMEs",
    description:
      "Access a curated pipeline of investment-ready African businesses with verified financials and readiness scores.",
    benefits: [
      { icon: Briefcase, text: "Curated deal flow from pre-vetted SMEs" },
      { icon: BarChart3, text: "Data-driven due diligence tools" },
      { icon: Globe2, text: "Pan-African market coverage across 15+ countries" },
      { icon: HandCoins, text: "Portfolio management and impact tracking" },
    ],
    color: "#008060",
  },
  development: {
    label: "Development Organisation",
    tagline: "Drive Ecosystem Impact",
    description:
      "Manage programs, track impact, and support SME development across the African continent with powerful tools.",
    benefits: [
      { icon: Building2, text: "Program management and reporting" },
      { icon: Users, text: "SME directory with readiness insights" },
      { icon: TrendingUp, text: "Real-time impact tracking dashboards" },
      { icon: Globe2, text: "Multi-country, multi-sector support" },
    ],
    color: "#008060",
  },
};

/* ------------------------------------------------------------------ */
/*  Password strength utility                                          */
/* ------------------------------------------------------------------ */

function getPasswordStrength(password: string): {
  level: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { level: 2, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { level: 3, label: "Strong", color: "bg-yellow-500" };
  return { level: 4, label: "Very Strong", color: "bg-[#008060]" };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SignupPage() {
  const param = useParams();
  const accessType = (param?.accessType as string) || "sme";
  const content = roleContent[accessType] || roleContent.sme;

  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    roles: UserType[param?.accessType as keyof typeof UserType],
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
    agreeToTerms?: string;
  }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    if (!form.password) return null;
    return getPasswordStrength(form.password);
  }, [form.password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAuthForm(form);

    // Additional validations
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match";
    }
    if (!form.agreeToTerms) {
      validationErrors.agreeToTerms = "You must agree to the Terms and Privacy Policy";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    authClient.signUp.email(
      {
        ...form,
        name: form.name || form.email.split("@")[0],
        role: form.roles?.toUpperCase(),
        profileCompletionStep: 0,
      },

      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          setShowSuccess(true);
          setTimeout(() => {
            router.push(`/verify?email=${form.email}`);
          }, 2000);
          toast.success("Account created! Check your email for verification.");
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message);
        },
      },
    );
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4] px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-[#008060]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-[#008060]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a verification code to{" "}
            <span className="font-medium text-gray-900">{form.email}</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Please check your inbox (and spam folder) for the verification email. You&apos;ll be
            redirected shortly.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#008060]" />
            <span>Redirecting to verification...</span>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Role badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-full text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            Signing up as {content.label}
          </div>

          <h2 className="text-3xl font-bold mb-3">{content.tagline}</h2>
          <p className="text-white/80 text-base mb-10">{content.description}</p>

          <div className="space-y-4">
            {content.benefits.map((benefit) => (
              <div key={benefit.text} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-4.5 h-4.5 text-white/90" />
                </div>
                <span className="text-white/90 text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-10">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
              <p className="text-xl font-bold">500+</p>
              <p className="text-white/60 text-xs mt-0.5">SMEs Onboarded</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
              <p className="text-xl font-bold">80+</p>
              <p className="text-white/60 text-xs mt-0.5">Active Investors</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center border border-white/10">
              <p className="text-xl font-bold">15+</p>
              <p className="text-white/60 text-xs mt-0.5">Countries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center bg-[#EEF6F4] px-4 sm:px-8 py-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <Link href="/">
              <img src="/logo.png" className="w-[160px]" alt="Capalyse" />
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#008060]/10 rounded-full text-sm font-medium text-[#008060] mt-4">
              <Users className="w-3.5 h-3.5" />
              Signing up as {content.label}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
              <p className="text-gray-500 text-sm mt-1">
                Get started with Capalyse in minutes
              </p>
            </div>

            <AuthLayout google_signtures={true} title="" layoutSize="max-w-md" inputFieldSize="max-w-md">
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  name="name"
                  onChange={handleChange}
                  type="text"
                  label="Full Name"
                  className="h-[43px]"
                  placeholder="Enter your full name"
                  value={form.name}
                />
                {errors.name && (
                  <div className="text-red-500 text-xs mt-1 -mb-2">{errors.name}</div>
                )}

                <Input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  label="Email Address"
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
                  placeholder="Create a strong password"
                  value={form.password}
                />

                {/* Password Strength Meter */}
                {form.password && passwordStrength && (
                  <div className="mb-3 -mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.level
                              ? passwordStrength.color
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        passwordStrength.level <= 1
                          ? "text-red-500"
                          : passwordStrength.level <= 2
                            ? "text-orange-500"
                            : passwordStrength.level <= 3
                              ? "text-yellow-600"
                              : "text-[#008060]"
                      }`}
                    >
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {form.password && <PasswordChecker password={form.password} />}
                {errors.password && (
                  <div className="text-red-500 text-xs -mt-1 mb-1">{errors.password}</div>
                )}

                <Input
                  name="confirmPassword"
                  onChange={handleChange}
                  className="h-[43px]"
                  type="password"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                />
                {errors.confirmPassword && (
                  <div className="text-red-500 text-xs -mt-2 mb-2">{errors.confirmPassword}</div>
                )}

                {/* Terms checkbox */}
                <div className="mb-5">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeToTerms}
                      onChange={(e) =>
                        setForm({ ...form, agreeToTerms: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-[#008060] focus:ring-[#008060] mt-0.5"
                    />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-[#008060] hover:underline font-medium">
                        Terms and Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-[#008060] hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <div className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</div>
                  )}
                </div>

                <Button
                  disabled={isLoading}
                  type="submit"
                  size="medium"
                  variant="primary"
                  className="font-bold w-full"
                  state={isLoading ? "loading" : "default"}
                >
                  Create Account
                </Button>

                <div className="flex flex-col items-center justify-center mt-6">
                  <p className="flex font-normal text-sm text-center items-center text-gray-600">
                    Already have an account?
                    <Link href="/signin" className="font-bold text-sm text-[#008060] ml-1">
                      Sign in
                    </Link>
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
