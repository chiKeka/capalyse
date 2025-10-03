import Button from '@/components/ui/Button';
import Input from '@/components/ui/Inputs';
import { getCurrentProfile, updateProfile } from '@/hooks/useUpdateProfile';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

type Props = {};

type SummaryFormData = {
  shortPitch: string;
  missionStatement: string;
  visionStatement: string;
};

export default function Summary({}: Props) {
  const { update_business_summary } = updateProfile();
  const ProfileDetails = getCurrentProfile();
  const { data: user, isLoading, error } = ProfileDetails;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SummaryFormData>({
    defaultValues: {
      shortPitch: '',
      missionStatement: '',
      visionStatement: '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        shortPitch: user?.businessSummary?.shortPitch || '',
        missionStatement: user?.businessSummary?.missionStatement || '',
        visionStatement: user?.businessSummary?.visionStatement || '',
      });
    }
  }, [user, reset]);
  const onSubmit = (data: any) => {
    update_business_summary
      .mutateAsync(data)
      .then((res) => {
        toast.success('Business Summary updated successfully');
      })
      .catch((err) => toast.error(err?.msg));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-1 flex flex-col w-full rounded-md p-3 md:p-6 "
    >
      <div className="w-full grid grid-col-1 lg:w-[85%]">
        <Input
          {...register('shortPitch', {
            required: 'Short pitch is required',
            minLength: {
              value: 10,
              message: 'Short pitch must be at least 10 characters',
            },
          })}
          type="text"
          label="Short pitch/description"
          className="h-[112px] "
          placeholder="Input short business description"
        />
        {errors.shortPitch && (
          <span className="text-[10px] text-red-500">
            {errors.shortPitch.message}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 lg:w-[80%] w-full lg:grid-cols-2">
        <div>
          <Input
            {...register('missionStatement', {
              required: 'Mission statement is required',
              minLength: {
                value: 10,
                message: 'Mission statement must be at least 10 characters',
              },
            })}
            type="text"
            label="Mission Statement"
            className="h-[112px] w-full"
            placeholder="Enter Mission Statement"
          />
          {errors.missionStatement && (
            <span className="text-[10px] text-red-500">
              {errors.missionStatement.message}
            </span>
          )}
        </div>
        <div>
          <Input
            {...register('visionStatement', {
              required: 'Vision statement is required',
              minLength: {
                value: 10,
                message: 'Vision statement must be at least 10 characters',
              },
            })}
            type="text"
            label="Vision Statement"
            className="h-[112px] w-full"
            placeholder="Enter Vision Statement"
          />
          {errors.visionStatement && (
            <span className="text-[10px] text-red-500">
              {errors.visionStatement.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex w-full lg:w-[80%] items-end mt-12 justify-end">
        <Button
          variant="primary"
          type="submit"
          state={update_business_summary.isPending ? 'loading' : undefined}
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
