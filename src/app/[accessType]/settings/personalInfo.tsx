import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { useUpdatePersonalInfo } from "@/hooks/useProfileManagement";
import { useState } from "react";
import { CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface PersonalInfoData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  countryOfResidence: string;
}

type Props = {};

function PersonalInfo({}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PersonalInfoData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      countryOfResidence: "",
    },
  });

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const {
    mutateAsync: updatePersonalInfo,
    isPending,
    isSuccess,
  } = useUpdatePersonalInfo();

  const onSubmit = async (data: PersonalInfoData) => {
    updatePersonalInfo(data as any)
      .then((res) => {
        toast.success("Profile updated successfully");
      })
      .catch((err) => {
        toast.error(
          err?.message || "Failed to update profile. Please try again."
        );
      });
  };

  return (
    <div className="border-1 rounded-md p-3 md:p-6 ">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="md:px-6 px-2 pb-12 w-full max-w-150"
      >
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
          <span className="text-[10px] text-red-500">
            {errors.firstName.message}
          </span>
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
          <span className="text-[10px] text-red-500">
            {errors.lastName.message}
          </span>
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
          <span className="text-[10px] text-red-500">
            {errors.phoneNumber.message}
          </span>
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
        />
        {errors.email && (
          <span className="text-[10px] text-red-500">
            {errors.email.message}
          </span>
        )}

        <div>
          <label className="block mb-1 text-sm font-medium">
            Country Of Residence
          </label>
          <CountrySelect
            value={selectedCountryName}
            autoComplete="new-country"
            inputClassName="w-full px-4 py-2 !border-none focus:!ring-0 focus:!border-none"
            onChange={(country: any) => {
              console.log({ country });
              if (
                country &&
                typeof country === "object" &&
                "id" in country &&
                "name" in country
              ) {
                setSelectedCountryName(country.name); // for display
                setValue("countryOfResidence", country.name); // for form
              }
            }}
            defaultValue={getValues()?.countryOfResidence as any}
            onTextChange={(_txt) =>
              setValue("countryOfResidence", _txt.target.value)
            }
          />
          {errors.countryOfResidence && (
            <span className="col-span-2 text-[10px] border-none  text-red-500">
              {errors.countryOfResidence.message}
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="medium"
          className="w-full my-4"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Submit"}
        </Button>
        <div className="py-3 px-5 my-6 rounded-[40px] items-center gap-2 w-full bg-[#F4FFFC] inline-flex font-normal text-xs text-[#062039]">
          <img src={"/icons/circle_warning.svg"} /> PS: Changes made to your
          profile will be subject to verification
        </div>
      </form>
      <hr className="h-[1px] bg-[] " />
      <div className="md:px-6 px-2 mt-12 max-w-150">
        <Button
          disabled={isPending}
          variant="secondary"
          size="medium"
          className="w-full"
          state={isPending ? "loading" : "default"}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
}

export default PersonalInfo;
