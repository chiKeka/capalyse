"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>();
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = async (data: ForgotPasswordForm) => {
    authClient.emailOtp.sendVerificationOtp(
      { ...data, type: "forget-password" },
      {
        onRequest: (ctx) => {
          console.log({ ctx });
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          console.log({ ctx });
          setIsLoading(false);
          toast.success("Reset token sent to your email");
          router.push(`/verify?reset_email=${data.email}`);
        },
        onError: (error) => {
          setIsLoading(false);
          toast.error("Failed to send reset link. Please try again.");
        },
      }
    );
  };
  const router = useRouter();

  return (
    <AuthLayout
      sub_caption="No Worries! Input the email associated with your password to reset your password"
      google_signtures={false}
      title="Forgot Password"
    >
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
          label="Email"
          className="h-[43px]"
          placeholder="janeearnest@gmail.com"
        />
        {errors.email && (
          <div className="text-red-500 text-sm mt-2">
            {errors.email.message}
          </div>
        )}

        {errors.root && (
          <div className="text-red-500 text-sm mt-2">{errors.root.message}</div>
        )}

        <Button
          size="medium"
          variant="primary"
          className="font-bold w-full"
          type="submit"
          disabled={isLoading}
          state={isLoading ? "loading" : "default"}
        >
          {isLoading ? "Sending Link..." : "Get link"}
        </Button>

        <div className="flex flex-col items-center justify-center my-6">
          <Link
            href={"/signin"}
            className="flex font-bold text-green text-sm text-center items-center"
          >
            Return to login page
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
