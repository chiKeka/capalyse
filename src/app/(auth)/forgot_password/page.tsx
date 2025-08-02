"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import StatusChangeModal from "@/components/useManagementComponents.tsx/modals";
import { useAuth } from "@/hooks/useAuth";
import { authAtom } from "@/lib/atoms/atoms";
import { useAtomValue } from "jotai";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage = () => {
  const { forgot_password } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    forgot_password.mutate(data, {
      onSuccess: (res) => {
        setShowModal(true);
      },
      onError: (error) => {
        toast.error("Failed to send reset link. Please try again.");
      },
    });
  };
  const router = useRouter();
  const authState: any = useAtomValue(authAtom);
  const role = authState?.role?.toLowerCase();
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
          disabled={isSubmitting}
          state={isSubmitting ? "loading" : "default"}
        >
          {isSubmitting ? "Sending Link..." : "Get link"}
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
      <StatusChangeModal
        timer={true}
        modalType="success"
        description="A password reset link has been sent to your inbox"
        handleAction={() => {
          setShowModal(false);
        }}
        handleCancel={() => {
          router.push(`/signin`);
          setShowModal(false);
        }}
        title="Link sent!!"
        routename="Next"
        showModal={showModal}
      />
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
