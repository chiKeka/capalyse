import Input from "@/components/ui/Inputs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { authAtom, onboardingStepAtom } from "@/lib/atoms/atoms";
import { routes } from "@/lib/routes";
import { SMEsBusinessInfo } from "@/lib/uitils/types";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { CountrySelect } from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import { useForm } from "react-hook-form";
type Props = {};

type BusinassInformationFormProps = {
  setLoading: Dispatch<SetStateAction<boolean>>;
};
const BusinassInformationForm = forwardRef<any, BusinassInformationFormProps>(
  (props, ref) => {
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const { smes_bussiness_info } = useAuth();
    const authState: any = useAtomValue(authAtom);
    const setStep = useSetAtom(onboardingStepAtom);
    const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
    } = useForm<SMEsBusinessInfo>();

    useEffect(() => {
      props.setLoading(smes_bussiness_info.isPending);
    }, [smes_bussiness_info.isPending, props]);
    useImperativeHandle(ref, () => ({
      submit: () => {
        handleSubmit(onSubmit)();
      },
      isLoading: smes_bussiness_info.isPending,
    }));
    const router = useRouter();
    const onSubmit = (data: SMEsBusinessInfo) => {
      smes_bussiness_info.mutateAsync(data, {
        onSuccess: () =>
          router.push(
            routes?.[authState?.role?.toLowerCase() as keyof typeof routes]
              ?.root
          ),
        onError: (error) => console.log(error),
      });
    };

    return (
      <form
        className="grid md:grid-cols-2 w-full gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Input
            className=""
            label="Business Name"
            placeholder="Input business name"
            type="text"
            {...register("businessName", {
              required: "Business Name is required",
            })}
          />
          {errors.businessName && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.businessName.message}
            </span>
          )}
        </div>

        <div>
          <Input
            className=""
            label="Business registration number"
            placeholder="Earnest"
            type="text"
            {...register("registrationNumber", {
              required: "business Registration number is required",
            })}
          />
          {errors.registrationNumber && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.registrationNumber.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Country of Operation
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
                setSelectedCountryName(country.name);
                setValue("countryOfOperation", country.name);
              }
            }}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Business Stage*
          </label>
          <Select
            // value={watch("businessStage")}
            onValueChange={(val) => setValue("businessStage", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Idea">Idea</SelectItem>
              <SelectItem value="Startup">Startup</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
              <SelectItem value="Growth">Mature</SelectItem>
            </SelectContent>
          </Select>
          {errors.businessStage && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.businessStage.message}
            </span>
          )}
        </div>

        <div>
          <Input
            className=""
            label="Industry (Optional)"
            placeholder="select Industry"
            type="text"
            {...register("industry")}
          />
          {errors.industry && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.industry.message}
            </span>
          )}
        </div>

        <div>
          <Input
            className=""
            label="Business website (Optional)"
            placeholder="Input your website link"
            type="text"
            {...register("website", {
              pattern: {
                value:
                  /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.~:?#[\]@!$&'()*+,;=]*)*\/?$/,
                message: "Please enter a valid URL",
              },
            })}
          />
          {errors.website && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.website.message}
            </span>
          )}
        </div>
      </form>
    );
  }
);
export default BusinassInformationForm;
