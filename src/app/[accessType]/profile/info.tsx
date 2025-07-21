import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useGetCurrentProfile } from "@/hooks/useProfileManagement";
import { useSmeProfile } from "@/hooks/useSmeProfile";
import { SMEsBusinessInfo } from "@/lib/uitils/types";
import { useEffect, useState } from "react";
import "react-country-state-city/dist/react-country-state-city.css";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
type Props = {};

export default function Info({}: Props) {
  const ProfileDetails = useGetCurrentProfile();
  const { data: user, isLoading, error } = ProfileDetails;
  const { smes_bussiness_info } = useAuth();
  console.log(user);
  const [selectedCountry, setSelectedCountry] = useState<string[]>(
    user?.countryOfOperation || []
  );
  const [selectedCountryName, setSelectedCountryName] = useState(
    user ? user?.countryOfOperation : ""
  );
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm<SMEsBusinessInfo>({
    defaultValues: {
      businessName: "",
      registrationNumber: "",
      countryOfOperation: selectedCountry,
      businessStage: "",
      industry: "",
      website: "",
    },
  });
  const { updateSmeBusinessInfo } = useSmeProfile();
  useEffect(() => {
    if (user) {
      setSelectedCountry(user?.countryOfOperation || []);
      reset({
        businessName: user?.businessName || "",
        registrationNumber: user?.registrationNumber || "",

        countryOfOperation: user?.countryOfOperation || [],
        businessStage: user?.businessStage || "",
        industry: user?.industry || "",
        website: user?.website || "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: any) => {
    updateSmeBusinessInfo
      .mutateAsync(data)
      .then((res) => {
        toast.success("Profile data updated successfully");
      })
      .catch((err) => toast.error(err?.msg));
  };
  const businessStage = watch("businessStage");
  const handleCountryStageChange = (value: string) => {
    const newCountry = selectedCountry.includes(value)
      ? selectedCountry.filter((item) => item !== value)
      : [...selectedCountry, value];

    setSelectedCountry(newCountry);
    setValue("countryOfOperation", newCountry);
  };

  const handleRemoveCountry = (value: string) => {
    const newCountry = selectedCountry.filter((item) => item !== value);
    setSelectedCountry(newCountry);
    setValue("countryOfOperation", newCountry);
  };
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6">
      <div className="flex flex-col w-full gap-x-6 lg:flex-row">
        <form className="grid w-full lg:grid-cols-2 gap-2 grid-cols-1">
          <Input
            type="text"
            {...register("businessName", {
              required: "Business Name is required",
            })}
            label="Business Name"
            className="h-[43px] "
          />
          <Input
            {...register("registrationNumber", {
              required: "Business Name is required",
            })}
            type="text"
            label="Business Registration Number"
            className="h-[43px] "
          />

          {/* <div className="w-full max-w-xl">
            <label className="block mb-1 text-sm font-normal">
              Country of Operation
            </label>
            <CountrySelect
              value={selectedCountryName}
              containerClassName="h-[43px]"
              inputClassName="px-4 !w-full py-2  !border-none focus:!ring-0 focus:!border-none"
              onChange={(country: any) => {
                if (
                  country &&
                  typeof country === "object" &&
                  "id" in country &&
                  "name" in country
                ) {
                  setSelectedCountryName(country.name);
                  setValue("countryOfOperation", country.name);
                }
              }}
            />
          </div> */}

          <div>
            <label className="block mb-1 text-sm font-medium">
              Country of Operation
            </label>
            <MultiSelect
              selectedItems={selectedCountry}
              onValueChange={handleCountryStageChange}
            >
              <MultiSelectTrigger
                selectedItems={selectedCountry}
                onRemoveItem={handleRemoveCountry}
              >
                <MultiSelectValue placeholder="Select business stage" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectItem value="Nigeria">Nigeria</MultiSelectItem>
                <MultiSelectItem value="USA">United States</MultiSelectItem>
                <MultiSelectItem value="Canada">Canada</MultiSelectItem>
                <MultiSelectItem value="Australlia">Australlia</MultiSelectItem>
              </MultiSelectContent>
            </MultiSelect>
            {errors.businessStage && (
              <span className="col-span-2 text-[10px] text-red-500">
                {errors.businessStage.message}
              </span>
            )}
          </div>
          <div className="max-w-xl w-full">
            <label className="block mb-1 text-sm font-normal">
              Business Stage*
            </label>
            <Select
              value={businessStage}
              onValueChange={(val) => setValue("businessStage", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Idea">Idea</SelectItem>
                <SelectItem value="Startup">Startup</SelectItem>
                <SelectItem value="Growth">Growth</SelectItem>
                <SelectItem value="Mature">Mature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Input
            {...register("industry", {
              required: "Business Name is required",
            })}
            type="text"
            label="Industry"
            className="h-[43px]"
          />
          <Input
            {...register("website", {
              required: "Business Name is required",
            })}
            type="text"
            label="Business Website"
            className="h-[43px]"
          />
        </form>

        <div className="w-full flex flex-col gap-4 items-center  max-w-44 p-2">
          <p className="text-[10px] font-bold text-[#2E3034]">
            Upload Business logo
          </p>
          <div className="w-full border-1 boeder-[#ABD2C7] flex flex-col  items-center justify-center gap-2 border-dashed h-20 rounded-md">
            <img src={"/icons/upload2.svg"} />
            <p className="text-[#52575C] font-normal text-xs">
              Click to add logo
            </p>
          </div>
        </div>
      </div>
      <div className="flex lg:max-w-[83%] mt-8 w-full justify-between lg:flex-row flex-col items-center pr-6">
        <div className="py-3 px-5 my-6 rounded-[40px] items-center gap-2 w-full max-w-130 bg-[#F4FFFC] inline-flex font-normal text-xs text-[#062039]">
          <img src={"/icons/circle_warning.svg"} /> PS: Changes made to your
          profile will be subject to verification
        </div>
        <Button
          state={updateSmeBusinessInfo.isPending ? "loading" : undefined}
          type="submit"
          onClick={handleSubmit(onSubmit)}
          variant="primary"
          size="medium"
          className="w-fit my-4 "
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
