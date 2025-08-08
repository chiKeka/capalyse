"use client";

import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ResetPasswordForm {
  new_password: string;
  confirm_password: string;
}

const ResetPasswordPage = () => {
  const { reset_password } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ResetPasswordForm>();

  const newPassword = watch("new_password");

  const onSubmit = async (data: ResetPasswordForm) => {
    reset_password.mutate(data, {
      onSuccess: (res) => {
        router.push("/signin");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to reset password");
      },
    });
  };

  return (
    <AuthLayout
      title="Reset Password"
      sub_caption="Enter your new password below"
    >
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
          label="Enter new password"
          className="h-[43px]"
          placeholder="**********"
        />
        {errors.new_password && (
          <div className="text-red-500 text-sm mt-2">
            {errors.new_password.message}
          </div>
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
          label="Confirm password"
          placeholder="**********"
        />
        {errors.confirm_password && (
          <div className="text-red-500 text-sm mt-2">
            {errors.confirm_password.message}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Resetting Password..." : "Reset Password"}
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

export default ResetPasswordPage;
