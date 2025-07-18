import Input from "@/components/ui/Inputs";
import { useAuth } from "@/hooks/useAuth";
import { onboardingStepAtom } from "@/lib/atoms/atoms";
import { PersonalInfoInputs } from "@/lib/uitils/types";
import { useSetAtom } from "jotai";
import { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";

const PersonalInfoForm = forwardRef((props, ref) => {
  const { personal_information } = useAuth();
  const setStep = useSetAtom(onboardingStepAtom);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoInputs>();

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(onSubmit)();
    },
    isLoading: personal_information.isPending,
  }));

  const onSubmit = (data: PersonalInfoInputs) => {
    personal_information.mutate(data, {
      onSuccess: () => setStep((prev) => prev + 1),
      onError: (error) => console.error(error),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid md:grid-cols-2 w-full gap-4"
    >
      <div>
        <Input
          label="First Name*"
          placeholder="Jane"
          {...register("firstName", { required: "First name is required" })}
          type="text"
          name="firstName"
        />
        {errors.firstName && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.firstName.message}
          </span>
        )}
      </div>
      <div>
        <Input
          label="Last Name*"
          placeholder="Earnest"
          {...register("lastName", { required: "Last name is required" })}
          type="text"
          name="lastName"
        />
        {errors.lastName && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.lastName.message}
          </span>
        )}
      </div>

      <div>
        <Input
          label="Phone Number*"
          placeholder="(+234) 8164763794"
          {...register("phoneNumber", { required: "Phone Number is required" })}
          type="phone"
          name="phoneNumber"
        />
        {errors.phoneNumber && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.phoneNumber.message}
          </span>
        )}
      </div>
      <div>
        <Input
          label="Email Address*"
          placeholder="Janeearnest@gmail.com"
          {...register("email", { required: "Email is required" })}
          type="email"
          name="email"
        />
        {errors.email && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.email.message}
          </span>
        )}
      </div>

      <div>
        <Input
          label="Country Of Residence"
          placeholder="Select your country of residence"
          {...register("countryOfResidence", {
            required: "Country is required",
          })}
          type="text"
          name="countryOfResidence"
        />
        {errors.countryOfResidence && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.countryOfResidence.message}
          </span>
        )}
      </div>
      <div>
        <Input
          label="State of residence"
          placeholder="Select your state of residence"
          {...register("stateOfResidence", { required: "State is required" })}
          type="text"
          name="stateOfResidence"
        />
        {errors.stateOfResidence && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.stateOfResidence.message}
          </span>
        )}
      </div>
    </form>
  );
});

export default PersonalInfoForm;
