'use client';

import AuthLayout from '@/components/layout/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Inputs';
import StatusChangeModal from '@/components/useManagementComponents.tsx/modals';
import { authClient } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ResetPasswordForm {
  confirm_password?: string;
  new_password: string;
  email: string;
  otp: string;
}

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
  const [showModal, setShowModal] = useState(false);
  const newPassword = watch('new_password');
  const onSubmit = async (data: ResetPasswordForm) => {
    const resetPassword = localStorage.getItem('reset_password');
    const { email, otp } = JSON.parse(resetPassword || '{}');
    if (data?.confirm_password !== data?.new_password) {
      toast.error('Passwords do not match');
      return;
    }
    authClient.emailOtp.resetPassword(
      { email, otp, password: data.new_password },
      {
        onRequest: (ctx) => {
          // console.log({ ctx });
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          // console.log({ ctx });
          localStorage.removeItem('reset_password');
          setShowModal(true);
          setIsLoading(false);
        },
        onError: (ctx) => {
          // console.log({ ctx });
          toast.error(ctx.error.message || 'Failed to reset password');
          setIsLoading(false);
        },
      }
    );
  };

  return (
    <AuthLayout
      title="Reset Password"
      sub_caption="Enter your new password below"
    >
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('new_password', {
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message:
                'Password must contain at least one uppercase letter, one lowercase letter, and one number',
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
          {...register('confirm_password', {
            required: 'Please confirm your password',
            validate: (value) => {
              if (value !== newPassword) {
                return 'Passwords do not match';
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
          {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
        </Button>

        <div className="flex flex-col items-center justify-center my-6">
          <Link
            href={'/signin'}
            className="flex font-bold text-green text-sm text-center items-center"
          >
            Return to login page
          </Link>
        </div>
      </form>
      <StatusChangeModal
        modalType="success"
        description="Password reset successful"
        handleAction={() => {
          setShowModal(true);
        }}
        handleCancel={() => {
          router.push(`/signin`);
          setShowModal(false);
        }}
        timer={false}
        title="Password reset successful"
        routename="Next"
        showModal={showModal}
      />
    </AuthLayout>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[80vh] bg-white mt-[10rem] p-4 md:p-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;
