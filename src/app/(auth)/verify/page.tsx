"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import { Verify } from "@/components/ui/inputOtp";
import { useAuth } from "@/hooks/useAuth";
import { authAtom } from "@/lib/atoms/atoms";
import { routes } from "@/lib/routes";
import { getKeyByValue } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface OTPForm {
  otp: string;
}

const VerifyPageContent = () => {
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(59 * 60); // 59 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const { verify_email } = useAuth();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const setAuth = useSetAtom(authAtom);
  const router = useRouter();

  // Start countdown when component mounts
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
  const userAuthDetails: any = useAtomValue(authAtom);
  const [otpValue, setOtpValue] = useState("");
  const rootRoute = getKeyByValue(UserType, userAuthDetails?.role);
  const onSubmit = (data: OTPForm) => {
    console.log({ data });
    verify_email
      .mutateAsync({ email, otp: data.otp })
      .then((res) => {
        if (userAuthDetails?.profileCompletionStep === 1) {
          router.push(`/${rootRoute}/onboarding`);
        } else {
          router.push(
            routes?.[rootRoute?.toLowerCase() as keyof typeof routes]?.root
          );
        }
      })
      .catch((err) => {
        console.log({ err });
        toast.error(err.error || "Invalid OTP and email");
      });
  };
  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      // Add your resend OTP logic here
      console.log("Resending OTP...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset countdown to 59 minutes
      setCountdown(59 * 60);
      setCanResend(false);

      // Start countdown
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
      console.error("Resend error:", error);
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <AuthLayout
      google_signtures={false}
      title={`Enter the 6-digit code sent to your mail ${email}`}
    >
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
            <div className="text-red-500 text-sm mt-2 text-center">
              {errors.otp.message}
            </div>
          )}

          {errors.root && (
            <div className="text-red-500 text-sm mt-2 text-center">
              {errors.root.message}
            </div>
          )}
        </div>

        <div className="mt-10 w-full">
          <Button
            className="w-full"
            variant="primary"
            type="submit"
            disabled={verify_email.isPending || otpValue.length !== 6}
          >
            {verify_email.isPending ? "Verifying..." : "Next"}
          </Button>
        </div>

        <div className="w-full text-sm mx-auto mt-10 text-center">
          Didn't receive a mail?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || isResending}
            className={`font-bold ${
              canResend && !isResending
                ? "text-green cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {isResending ? "Sending..." : "Resend"}
          </button>{" "}
          in{" "}
          <span className="text-[#DC2626] font-bold">
            {formatTime(countdown)}
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

const VerifyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPageContent />
    </Suspense>
  );
};

export default VerifyPage;
