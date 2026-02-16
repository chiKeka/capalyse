import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { getCurrentProfile, updateProfile } from "@/hooks/useUpdateProfile";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient } from "@/lib/auth-client";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

type Props = {};

function PersonalInfo({}: Props) {
  const auth: any = useAtomValue(authAtom);
  const { data: details } = getCurrentProfile();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PersonalInfoData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (details?.personalInfo) {
      reset({
        firstName: details.personalInfo.firstName || "",
        lastName: details.personalInfo.lastName || "",
        phoneNumber: details.personalInfo.phoneNumber || "",
        email: details.personalInfo.email || auth?.email || "",
      });
    }
  }, [details, reset]);

  const { personal_information } = updateProfile();

  const onSubmit = async (data: PersonalInfoData) => {
    const { email, ...rest } = data;
    authClient.updateUser(
      {
        name: data.firstName + " " + data.lastName,
        ...rest,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
        },
        onError: (error) => {
          toast.error(error?.error.message || "Failed to update profile. Please try again.");
        },
      },
    );
  };

  return (
    <div className="border-1 rounded-md p-3 md:p-6 ">
      <form onSubmit={handleSubmit(onSubmit)} className="md:px-6 px-2 pb-12 w-full max-w-150">
        <Input
          {...register("firstName", {
            required: "First name is required",
            minLength: {
              value: 2,
              message: "First name must be at least 2 characters",
            },
          })}
          name="firstName"
          type="text"
          label="First Name"
          className="h-[43px]"
          placeholder="John"
        />
        {errors.firstName && (
          <span className="text-[10px] text-red-500">{errors.firstName.message}</span>
        )}

        <Input
          {...register("lastName", {
            required: "Last name is required",
            minLength: {
              value: 2,
              message: "Last name must be at least 2 characters",
            },
          })}
          name="lastName"
          type="text"
          label="Last Name"
          className="h-[43px]"
          placeholder="Doe"
        />
        {errors.lastName && (
          <span className="text-[10px] text-red-500">{errors.lastName.message}</span>
        )}

        <Input
          {...register("phoneNumber", {
            pattern: {
              value: /^\+?[\d\s\-\(\)]+$/,
              message: "Please enter a valid phone number",
            },
          })}
          name="phoneNumber"
          type="phone"
          label="Phone Number"
          className="h-[43px]"
          placeholder="+1234567890"
        />
        {errors.phoneNumber && (
          <span className="text-[10px] text-red-500">{errors.phoneNumber.message}</span>
        )}

        <Input
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
          })}
          name="email"
          type="email"
          label="Email Address"
          className="h-[43px]"
          placeholder="johndoe@gmail.com"
          readOnly={true}
        />
        {errors.email && <span className="text-[10px] text-red-500">{errors.email.message}</span>}

        <Button
          variant="primary"
          size="medium"
          className="w-full mt-4"
          type="submit"
          disabled={personal_information.isPending}
        >
          {personal_information.isPending ? "Updating..." : "Submit"}
        </Button>
      </form>
    </div>
  );
}

export default PersonalInfo;
