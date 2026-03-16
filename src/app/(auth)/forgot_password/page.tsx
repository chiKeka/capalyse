"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Clock, KeyRound, Mail, CheckCircle2, Shield } from "lucide-react";

interface ForgotPasswordForm {
  email: string;
}

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: ForgotPasswordForm) => {
    authClient.emailOtp.sendVerificationOtp(
      { ...data, type: "forget-password" },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          setSubmittedEmail(data.email);
          setIsSuccess(true);
          setResendCooldown(60);
          toast.success("Reset token sent to your email");
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error("Failed to send reset link. Please try again.");
        },
      },
    );
  };

  const handleResend = useCallback(() => {
    if (resendCooldown > 0 || !submittedEmail) return;
    authClient.emailOtp.sendVerificationOtp(
      { email: submittedEmail, type: "forget-password" },
      {
        onRequest: () => setIsLoading(true),
        onSuccess: () => {
          setIsLoading(false);
          setResendCooldown(60);
          toast.success("Reset token resent successfully");
        },
        onError: () => {
          setIsLoading(false);
          toast.error("Failed to resend. Please try again.");
        },
      },
    );
  }, [resendCooldown, submittedEmail]);

  const handleContinueToVerify = () => {
    router.push(`/verify?reset_email=${submittedEmail}`);
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4] px-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link href="/">
              <img src="/logo.png" className="w-[160px]" alt="Capalyse" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-[#008060]/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[#008060]" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
            <p className="text-gray-600 text-sm mb-2">
              We&apos;ve sent a password reset code to
            </p>
            <p className="font-medium text-gray-900 mb-6">{submittedEmail}</p>

            <Button
              variant="primary"
              size="medium"
              className="w-full font-bold mb-4"
              onClick={handleContinueToVerify}
            >
              Enter Reset Code
            </Button>

            {/* Resend */}
            <div className="text-sm text-gray-500 mb-6">
              Didn&apos;t receive the email?{" "}
              {resendCooldown > 0 ? (
                <span className="text-gray-400">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-[#008060] font-medium hover:underline cursor-pointer"
                >
                  Resend
                </button>
              )}
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                For security, the reset code expires in <strong>1 hour</strong>. If you don&apos;t
                see the email, check your spam or junk folder.
              </p>
            </div>

            <div className="mt-6">
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
      </div>
    );
  }

  // Form State
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
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
              No worries! Enter the email address associated with your account and we&apos;ll send
              you a reset code.
            </p>
          </div>

          <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              })}
              name="email"
              type="email"
              label="Email Address"
              className="h-[43px]"
              placeholder="you@company.com"
            />
            {errors.email && (
              <div className="text-red-500 text-sm -mt-2 mb-3">{errors.email.message}</div>
            )}

            {errors.root && (
              <div className="text-red-500 text-sm mt-2 mb-3">{errors.root.message}</div>
            )}

            <Button
              size="medium"
              variant="primary"
              className="font-bold w-full"
              type="submit"
              disabled={isLoading}
              state={isLoading ? "loading" : "default"}
            >
              {isLoading ? "Sending..." : "Send Reset Code"}
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
          <span>Your account security is our priority</span>
        </div>
      </div>
    </div>
  );
};

const ForgotPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008060]" />
        </div>
      }
    >
      <ForgotPassword />
    </Suspense>
  );
};

export default ForgotPasswordPage;
