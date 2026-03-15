"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentProfile, updateProfile } from "@/hooks/useUpdateProfile";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient } from "@/lib/auth-client";
import { useAtomValue } from "jotai";
import { Loader2Icon, UserIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export default function AdminProfilePage() {
  const auth: any = useAtomValue(authAtom);
  const { data: details, isLoading } = getCurrentProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    },
  });

  useEffect(() => {
    if (details?.personalInfo) {
      reset({
        firstName: details.personalInfo.firstName || "",
        lastName: details.personalInfo.lastName || "",
        phoneNumber: details.personalInfo.phoneNumber || "",
        email: details.personalInfo.email || auth?.email || "",
      });
    } else if (auth) {
      reset({
        firstName: auth.name?.split(" ")[0] || "",
        lastName: auth.name?.split(" ").slice(1).join(" ") || "",
        phoneNumber: "",
        email: auth.email || "",
      });
    }
  }, [details, auth, reset]);

  const { personal_information } = updateProfile();

  const onSubmit = async (data: ProfileFormData) => {
    authClient.updateUser(
      {
        name: data.firstName + " " + data.lastName,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
        },
        onError: (error) => {
          toast.error(error?.error?.message || "Failed to update profile.");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Profile Header */}
      <Card className="shadow-none mb-6">
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#F4FFFC] border border-[#ABD2C7] flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-green" />
            </div>
            <div>
              <p className="text-lg font-bold">
                {auth?.name ||
                  `${details?.personalInfo?.firstName || ""} ${details?.personalInfo?.lastName || ""}`.trim() ||
                  "Admin User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {auth?.email || details?.personalInfo?.email || ""}
              </p>
              <p className="text-xs text-green font-medium mt-1 capitalize">
                {auth?.role || "Admin"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card className="shadow-none">
        <CardContent className="py-6">
          <p className="font-bold text-base mb-4">Personal Information</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
            <div>
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
            </div>

            <div>
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
            </div>

            <div>
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
            </div>

            <div>
              <Input
                {...register("email")}
                name="email"
                type="email"
                label="Email Address"
                className="h-[43px]"
                placeholder="admin@example.com"
                readOnly={true}
              />
            </div>

            <Button
              variant="primary"
              size="medium"
              className="w-full mt-4"
              type="submit"
              state={personal_information.isPending ? "loading" : "default"}
            >
              {personal_information.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
