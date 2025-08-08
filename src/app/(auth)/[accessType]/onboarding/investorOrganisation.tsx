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
import { investorOrg } from "@/lib/uitils/types";
import { useAtomValue, useSetAtom } from "jotai";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useImperativeHandle,
} from "react";
import "react-country-state-city/dist/react-country-state-city.css";
import { useForm } from "react-hook-form";

type Props = {};

type InvestmentPreferenceormProps = {
  setLoading: Dispatch<SetStateAction<boolean>>;
  onFinish?: () => void;
  onSuccess?: () => void;
};

const InvestorOrganisation = forwardRef<any, InvestmentPreferenceormProps>(
  (props, ref) => {
    const { investor_org_info } = useAuth();
    const authState: any = useAtomValue(authAtom);
    const setStep = useSetAtom(onboardingStepAtom);
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
    } = useForm<investorOrg>();

    useEffect(() => {
      props.setLoading(investor_org_info.isPending);
    }, [investor_org_info.isPending, props]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        return new Promise((resolve) => {
          handleSubmit(
            (values) => {
              onSubmit(values);
              resolve(true);
            },
            () => {
              resolve(false);
            }
          )();
        });
      },
      isLoading: investor_org_info.isPending,
    }));

    const router = useRouter();
    const onSubmit = (data: any) => {
      const payload = {
        ...data,
      };
      console.log("SUBMIT PAYLOAD:", payload); // Log payload for user to see
      investor_org_info.mutateAsync(payload, {
        onSuccess: () => {
          if (props.onSuccess) {
            props.onSuccess();
          }
        },
        onError: (error: any) => console.log(error),
      });
    };

    return (
      <form
        className="grid md:grid-cols-2 w-full gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <Input
            label="Organization name"
            placeholder="Jane"
            {...register("organizationName", {
              required: "organisation name is required",
            })}
            type="text"
            name="organizationName"
          />
          {errors.organizationName && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.organizationName.message}
            </span>
          )}
        </div>

        <div>
          <Input
            label="Company Email address"
            placeholder="Janeearnest@gmail.com"
            {...register("companyEmail", { required: "Email is required" })}
            type="email"
            name="companyEmail"
          />
          {errors.companyEmail && (
            <span className="col-span-2 text-[10px]  text-red-500">
              {errors.companyEmail.message}
            </span>
          )}
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">
            Country Headquarters
          </label>
          <Select
            onValueChange={(val: any) => setValue("countryHeadquarters", val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Abuja">Abuja</SelectItem>
              <SelectItem value="Sydney">Sydney</SelectItem>
              <SelectItem value="Illinois">Illinois</SelectItem>
              <SelectItem value="Los_angeles">Los Angeles</SelectItem>
            </SelectContent>
          </Select>
          {errors.countryHeadquarters && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.countryHeadquarters.message}
            </span>
          )}
        </div>
        <div>
          <Input
            label="Website"
            placeholder="wwww.us.com"
            {...register("website", {
              setValueAs: (v) => {
                if (!v) return v;
                const value = String(v).trim();
                return /^https?:\/\//i.test(value) ? value : `https://${value}`;
              },
              pattern: {
                value:
                  /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-.~:?#[\]@!$&'()*+,;=]*)*\/?$/,
                message: "Please enter a valid URL",
              },
              required: "website is required",
            })}
            type="text"
            name="website"
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

export default InvestorOrganisation;
