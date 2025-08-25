"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ChangePasswordForm {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  clearOtherSessions: boolean;
}

function Security() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      clearOtherSessions: false,
    },
  });

  const newPassword = watch("newPassword");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = async (data: ChangePasswordForm) => {
    // Check if new password matches confirm password
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    // Check if new password is different from old password
    if (data.oldPassword === data.newPassword) {
      toast.error("New password must be different from the old password");
      return;
    }

    await authClient.changePassword(
      {
        currentPassword: data.oldPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: data.clearOtherSessions,
      },
      {
        onRequest: () => {
          setIsLoading(true);
        },
        onSuccess: () => {
          toast.success("Password changed successfully");
          setIsLoading(false);
          reset();
        },
        onError: (error) => {
          toast.error(error?.error?.message || "Failed to change password");
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <div className="border-1 rounded-md p-3 md:p-12 lg:flex-row flex gap-y-8 gap-x-14 flex-col">
      <div>
        <p className="text-[#25282B] font-bold text-base">Change Password</p>
        <p className="text-[#6D7175] font-normal text-base md:max-w-60">
          New password must be different from previously used passwords.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="lg:px-6 pb-12 w-full max-w-150"
      >
        <div>
          <Input
            {...register("oldPassword", {
              required: "Old password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            name="oldPassword"
            type="password"
            label="Enter Old Password"
            className="h-[43px]"
            placeholder="Input your current password"
          />
          {errors.oldPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.oldPassword.message}
            </p>
          )}
        </div>

        <div>
          <Input
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, and one number",
              },
            })}
            name="newPassword"
            type="password"
            label="Enter New Password"
            className="h-[43px]"
            placeholder="Input your new password"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <Input
            {...register("confirmPassword", {
              required: "Please confirm your new password",
              validate: (value) => {
                if (value !== newPassword) {
                  return "Passwords do not match";
                }
                return true;
              },
            })}
            name="confirmPassword"
            type="password"
            label="Confirm New Password"
            className="h-[43px]"
            placeholder="Confirm your new password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-4 mb-6">
          <input
            {...register("clearOtherSessions")}
            type="checkbox"
            id="clearOtherSessions"
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <label htmlFor="clearOtherSessions" className="text-sm text-gray-700">
            Clear all other login sessions
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="medium"
          className="w-full my-4"
          state={isLoading ? "loading" : undefined}
          disabled={isLoading}
        >
          {isLoading ? "Changing Password..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}

export default Security;
