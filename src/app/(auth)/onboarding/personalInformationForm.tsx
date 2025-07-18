import Input from "@/components/ui/Inputs";
import { useAuth } from "@/hooks/useAuth";
import { onboardingStepAtom } from "@/lib/atoms/atoms";
import { PersonalInfoInputs } from "@/lib/uitils/types";
import { useSetAtom } from "jotai";
import { forwardRef, useImperativeHandle, useState } from "react";
import { CountrySelect, StateSelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { useForm } from "react-hook-form";
const PersonalInfoForm = forwardRef((props, ref) => {
  const { personal_information } = useAuth();
  const setStep = useSetAtom(onboardingStepAtom);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfoInputs>();

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(onSubmit)();
    },
    isLoading: personal_information.isPending,
  }));

  const onSubmit = (data: PersonalInfoInputs) => {
    personal_information.mutateAsync(data, {
      onSuccess: () => setStep((prev) => prev + 1),
      onError: (error) => console.error(error),
    });
  };

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedCountryName, setSelectedCountryName] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");

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
      {/* <div>
        <label className="block mb-1 text-sm font-medium">Phone Code</label>
        <PhonecodeSelect
          value={selectedPhoneCode}
          inputClassName="w-full px-4 py-2 !border-none"
          onChange={(code: any) => {
            if (code && typeof code === "object" && "phonecode" in code) {
              setSelectedPhoneCode(code.phonecode);
              setValue("phoneNumber", code.phonecode);
            }
          }}
        />
        {errors.phoneNumber && (
          <span className="col-span-2 text-[10px] text-red-500">
            {errors.phoneNumber.message}
          </span>
        )}
      </div> */}
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
          <span className="col-span-2 text-[10px]  text-red-500">
            {errors.email.message}
          </span>
        )}
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium">
          Country Of Residence
        </label>
        <CountrySelect
          value={selectedCountryName}
          inputClassName="w-full px-4 py-2 !border-none focus:!ring-0 focus:!border-none"
          onChange={(country: any) => {
            if (
              country &&
              typeof country === "object" &&
              "id" in country &&
              "name" in country
            ) {
              setSelectedCountryId(country.id); // for StateSelect
              setSelectedCountryName(country.name); // for display
              setValue("countryOfResidence", country.name); // for form
              setSelectedStateName("");
              setValue("stateOfResidence", "");
            }
          }}
        />
        {errors.countryOfResidence && (
          <span className="col-span-2 text-[10px] border-none  text-red-500">
            {errors.countryOfResidence.message}
          </span>
        )}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium">
          State of Residence
        </label>
        <StateSelect
          countryid={Number(selectedCountryId)}
          value={selectedStateName}
          inputClassName="w-full px-4 py-2 focus:!border-none focus:!ring-0 !border-none"
          onChange={(state: any) => {
            if (state && typeof state === "object" && "name" in state) {
              setSelectedStateName(state.name);
              setValue("stateOfResidence", state.name);
            }
          }}
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


// {
//     "message": "{\"success\":false,\"error\":\"Missing or invalid authorization header\"}",
//     "stack": "Error: {\"success\":false,\"error\":\"Missing or invalid authorization header\"}\n    at new U4 (/app/dist/index.js:1181:45816)\n    at <anonymous> (/app/dist/index.js:1181:181178)\n    at p1 (/app/dist/index.js:1181:181645)\n    at <anonymous> (/app/dist/index.js:1181:141042)\n    at <anonymous> (/app/dist/index.js:1181:141078)\n    at <anonymous> (/app/dist/index.js:1181:48102)\n    at $ (/app/dist/index.js:1181:48280)\n    at <anonymous> (/app/dist/index.js:1181:47355)\n    at processTicksAndRejections (native:7:39)"
// }