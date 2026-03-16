"use client";

import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import PasswordChecker from "@/components/ui/passwordChecker";
import StatusChangeModal from "@/components/useManagementComponents.tsx/modals";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  Shield,
  AlertTriangle,
  LogOut,
} from "lucide-react";

interface ResetPasswordForm {
  confirm_password?: string;
  new_password: string;
  email: string;
  otp: string;
}

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

const ResetPassword = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [tokenValid, setTokenValid] = useState(true);
  const newPassword = watch("new_password");

  const passwordStrength = useMemo(() => {
    if (!newPassword) return null;
    return getPasswordStrength(newPassword);
  }, [newPassword]);

  // Check token exists on mount
  useEffect(() => {
    const resetPassword = localStorage.getItem("reset_password");
    if (!resetPassword) {
      setTokenValid(false);
    } else {
      try {
        const parsed = JSON.parse(resetPassword);
        if (!parsed.email || !parsed.otp) {
          setTokenValid(false);
        }
      } catch {
        setTokenValid(false);
      }
    }
  }, []);

  // Auto-redirect countdown after success
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/signin");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showSuccess, router]);

  const onSubmit = async (data: ResetPasswordForm) => {
    const resetPassword = localStorage.getItem("reset_password");
    const { email, otp } = JSON.parse(resetPassword || "{}");
    if (data?.confirm_password !== data?.new_password) {
      toast.error("Passwords do not match");
      return;
    }
    authClient.emailOtp.resetPassword(
      { email, otp, password: data.new_password },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          localStorage.removeItem("reset_password");
          setShowSuccess(true);
          setIsLoading(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to reset password");
          setIsLoading(false);
        },
      },
    );
  };

  // Token invalid state
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4] px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/">
              <img src="/logo.png" className="w-[160px]" alt="Capalyse" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Link Expired</h2>
            <p className="text-gray-600 text-sm mb-6">
              This password reset link has expired or is invalid. Please request a new one to
              continue.
            </p>

            <Button
              variant="primary"
              size="medium"
              className="w-full font-bold mb-4"
              onClick={() => router.push("/forgot_password")}
            >
              Request New Reset Link
            </Button>

            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008060] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4] px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/">
              <img src="/logo.png" className="w-[160px]" alt="Capalyse" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#008060]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#008060]" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 text-sm mb-6">
              Your password has been updated. You can now sign in with your new password.
            </p>

            <Button
              variant="primary"
              size="medium"
              className="w-full font-bold mb-4"
              onClick={() => router.push("/signin")}
            >
              Sign In Now
            </Button>

            <p className="text-sm text-gray-400">
              Redirecting to sign in in {redirectCountdown}s...
            </p>

            {/* Security info */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-left mt-6">
              <LogOut className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                For security, you have been signed out of all other devices. Please sign in again
                with your new password.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <img src="/logo.png" className="w-[160px]" alt="Capalyse" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-[#008060]/10 flex items-center justify-center mx-auto mb-6">
            <KeyRound className="w-7 h-7 text-[#008060]" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="text-gray-500 text-sm mt-2">
              Enter your new password below. Make sure it&apos;s strong and memorable.
            </p>
          </div>

          <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("new_password", {
                required: "New password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                },
              })}
              name="new_password"
              type="password"
              label="New Password"
              className="h-[43px]"
              placeholder="Enter new password"
            />

            {/* Password Strength Meter */}
            {newPassword && passwordStrength && (
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

            {newPassword && <PasswordChecker password={newPassword} />}
            {errors.new_password && (
              <div className="text-red-500 text-sm -mt-1 mb-3">{errors.new_password.message}</div>
            )}

            <Input
              {...register("confirm_password", {
                required: "Please confirm your password",
                validate: (value) => {
                  if (value !== newPassword) {
                    return "Passwords do not match";
                  }
                  return true;
                },
              })}
              name="confirm_password"
              className="h-[43px]"
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
            />
            {errors.confirm_password && (
              <div className="text-red-500 text-sm -mt-2 mb-3">
                {errors.confirm_password.message}
              </div>
            )}

            {errors.root && (
              <div className="text-red-500 text-sm mt-2 mb-3">{errors.root.message}</div>
            )}

            <Button
              size="medium"
              variant="primary"
              className="font-bold w-full"
              type="submit"
              disabled={isLoading || isSubmitting}
              state={isLoading ? "loading" : "default"}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <div className="flex flex-col items-center justify-center mt-6">
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#008060] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Your new password is encrypted and securely stored</span>
        </div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008060]" />
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;
