"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import { Verify } from "@/components/ui/inputOtp";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient, useSession } from "@/lib/auth-client";
import { getKeyByValue } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import { useSetAtom } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Shield,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface OTPForm {
  otp: string;
}

const VerifyPageContent = () => {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(1 * 60);
  const [canResend, setCanResend] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const resetEmail = searchParams.get("reset_email");
  const setAuth = useSetAtom(authAtom);
  const router = useRouter();
  const sessionData = useSession();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<OTPForm>();
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");

  const onSubmit = (data: OTPForm) => {
    if (resetEmail) {
      localStorage.setItem("reset_password", JSON.stringify({ ...data, email: resetEmail }));
      router.push(`/reset_password`);
      return;
    }

    authClient.emailOtp.verifyEmail(
      {
        otp: data.otp,
        email: email,
      },
      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: async (ctx) => {
          setIsLoading(false);
          toast.success("Email verified successfully");
          const auth = await authClient.getSession();

          setAuth(auth?.data?.user);
          const rootRoute = getKeyByValue(UserType, auth?.data?.user?.role!);
          if (rootRoute) router.push(`/${rootRoute}/onboarding`);
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsResending(true);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: email || resetEmail || "",
        type: resetEmail ? "forget-password" : "email-verification",
        fetchOptions: {
          onSuccess: (ctx) => {
            setIsResending(false);
            toast.success("Code sent successfully");
          },
          onError: (ctx) => {
            setIsResending(false);
            toast.error(ctx.error.message);
          },
        },
      });
      setCountdown(60);
      setCanResend(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      // silent
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const displayEmail = email || resetEmail || "";
  const maskedEmail = displayEmail
    ? displayEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "";

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
            <Mail className="w-7 h-7 text-[#008060]" />
          </div>

          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {resetEmail ? "Enter Reset Code" : "Verify Your Email"}
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              {resetEmail
                ? "Enter the 6-digit code we sent to"
                : "Enter the 6-digit verification code sent to"}
            </p>
            <p className="text-gray-900 font-medium text-sm mt-1">{maskedEmail}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="w-full">
              <Verify
                validCode="123456"
                onValueChange={(value) => {
                  setOtpValue(value);
                  setValue("otp", value);
                }}
              />

              {errors.otp && (
                <div className="text-red-500 text-sm mt-3 text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.otp.message}
                </div>
              )}

              {errors.root && (
                <div className="text-red-500 text-sm mt-2 text-center flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.root.message}
                </div>
              )}
            </div>

            <div className="mt-8 w-full">
              <Button
                className="w-full font-bold"
                variant="primary"
                size="medium"
                state={isLoading ? "loading" : "default"}
                type="submit"
                disabled={isLoading || otpValue.length !== 6}
              >
                {isLoading
                  ? "Verifying..."
                  : resetEmail
                    ? "Continue"
                    : "Verify Email"}
              </Button>
            </div>

            {/* Resend Section */}
            <div className="w-full text-center mt-6">
              <p className="text-sm text-gray-500">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || isResending}
                  className={`font-medium inline-flex items-center gap-1 ${
                    canResend && !isResending
                      ? "text-[#008060] cursor-pointer hover:underline"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Resend Code"
                  )}
                </button>
              </p>
              {!canResend && countdown > 0 && (
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  Resend available in{" "}
                  <span className="text-red-500 font-semibold">{formatTime(countdown)}</span>
                </p>
              )}
            </div>

            {/* Help text */}
            <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                Can&apos;t find the email? Check your <strong>spam</strong> or{" "}
                <strong>junk</strong> folder. The code is valid for 10 minutes.
              </p>
            </div>

            <div className="flex flex-col items-center mt-6">
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

        {/* Trust signal */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Secure email verification</span>
        </div>
      </div>
    </div>
  );
};

const VerifyPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#EEF6F4]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#008060] mx-auto mb-4" />
            <p className="text-sm text-gray-500">Loading verification...</p>
          </div>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
};

export default VerifyPage;
