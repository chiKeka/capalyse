import Input from "@/components/ui/Inputs";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { useAuth } from "@/hooks/useAuth";
import { authAtom, onboardingStepAtom } from "@/lib/atoms/atoms";
import { routes } from "@/lib/routes";
import { InvestmentPreferenceInfo } from "@/lib/uitils/types";
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
import "react-country-state-city/dist/react-country-state-city.css";
import { useForm } from "react-hook-form";

type Props = {};

type InvestmentPreferenceormProps = {
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const InvestmentPreference = forwardRef<any, InvestmentPreferenceormProps>(
  (props, ref) => {
    const [selectedCountryName, setSelectedCountryName] = useState("");
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedInvestmentTypes, setSelectedInvestmentTypes] = useState<
      string[]
    >([]);
    const [selectedBusinessStages, setSelectedBusinessStages] = useState<
      string[]
    >([]);
    const { investor_investment_info } = useAuth();
    const authState: any = useAtomValue(authAtom);
    const setStep = useSetAtom(onboardingStepAtom);
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
    } = useForm<InvestmentPreferenceInfo>();

    useEffect(() => {
      props.setLoading(investor_investment_info.isPending);
    }, [investor_investment_info.isPending, props]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        handleSubmit(onSubmit)();
      },
      isLoading: investor_investment_info.isPending,
    }));

    const router = useRouter();
    const onSubmit = (data: any) => {
      investor_investment_info.mutateAsync(data, {
        onSuccess: () =>
          router.push(
            routes?.[authState?.role?.toLowerCase() as keyof typeof routes]
              ?.root
          ),
        onError: (error: any) => console.log(error),
      });
    };

    const handleRegionChange = (value: string) => {
      const newRegions = selectedRegions.includes(value)
        ? selectedRegions.filter((item) => item !== value)
        : [...selectedRegions, value];
      setSelectedRegions(newRegions);
      setValue("targetRegions", newRegions);
    };

    const handleRemoveRegion = (value: string) => {
      const newRegions = selectedRegions.filter((item) => item !== value);
      setSelectedRegions(newRegions);
      setValue("targetRegions", newRegions);
    };

    const handleIndustryChange = (value: string) => {
      const newIndustries = selectedIndustries.includes(value)
        ? selectedIndustries.filter((item) => item !== value)
        : [...selectedIndustries, value];
      setSelectedIndustries(newIndustries);
      setValue("targetIndustries", newIndustries);
    };

    const handleRemoveIndustry = (value: string) => {
      const newIndustries = selectedIndustries.filter((item) => item !== value);
      setSelectedIndustries(newIndustries);
      setValue("targetIndustries", newIndustries);
    };

    const handleInvestmentTypeChange = (value: string) => {
      const newTypes = selectedInvestmentTypes.includes(value)
        ? selectedInvestmentTypes.filter((item) => item !== value)
        : [...selectedInvestmentTypes, value];
      console.log("New investment types:", newTypes);
      setSelectedInvestmentTypes(newTypes);
      setValue("investmentType", newTypes);
    };

    const handleRemoveInvestmentType = (value: string) => {
      const newTypes = selectedInvestmentTypes.filter((item) => item !== value);
      setSelectedInvestmentTypes(newTypes);
      setValue("investmentType", newTypes);
    };

    const handleBusinessStageChange = (value: string) => {
      const newStages = selectedBusinessStages.includes(value)
        ? selectedBusinessStages.filter((item) => item !== value)
        : [...selectedBusinessStages, value];

      setSelectedBusinessStages(newStages);
      setValue("businessStage", newStages);
    };

    const handleRemoveBusinessStage = (value: string) => {
      const newStages = selectedBusinessStages.filter((item) => item !== value);
      setSelectedBusinessStages(newStages);
      setValue("businessStage", newStages);
    };

    return (
      <form
        className="grid md:grid-cols-2 w-full gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {/* Test button to verify console and handlers work */}

        <div>
          <label className="block mb-1 text-sm font-medium">
            Investment Type
          </label>
          <MultiSelect onValueChange={handleInvestmentTypeChange}>
            <MultiSelectTrigger
              selectedItems={selectedInvestmentTypes}
              onRemoveItem={handleRemoveInvestmentType}
            >
              <MultiSelectValue placeholder="Select investment type" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectItem value="Equity">Equity</MultiSelectItem>
              <MultiSelectItem value="Debt">Debt</MultiSelectItem>
              <MultiSelectItem value="Grant">Grant</MultiSelectItem>
            </MultiSelectContent>
          </MultiSelect>
          {errors.investmentType && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.investmentType.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-normal">
            Target Regions
          </label>
          <MultiSelect onValueChange={handleRegionChange}>
            <MultiSelectTrigger
              selectedItems={selectedRegions}
              onRemoveItem={handleRemoveRegion}
            >
              <MultiSelectValue placeholder="Select Regions" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectItem value="North_East">North East</MultiSelectItem>
              <MultiSelectItem value="North_west">North west</MultiSelectItem>
              <MultiSelectItem value="South_East">South East</MultiSelectItem>
              <MultiSelectItem value="South_South">South South</MultiSelectItem>
            </MultiSelectContent>
          </MultiSelect>
          {errors.targetRegions && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.targetRegions.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-normal">
            Target Industries
          </label>
          <MultiSelect onValueChange={handleIndustryChange}>
            <MultiSelectTrigger
              selectedItems={selectedIndustries}
              onRemoveItem={handleRemoveIndustry}
            >
              <MultiSelectValue placeholder="Select Industries" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectItem value="Ict">ICT</MultiSelectItem>
              <MultiSelectItem value="TelCom">
                Tel Communication
              </MultiSelectItem>
              <MultiSelectItem value="Health">Health</MultiSelectItem>
            </MultiSelectContent>
          </MultiSelect>
          {errors.targetIndustries && (
            <span className="col-span-2 text-[10px] text-red-500">
              {errors.targetIndustries.message}
            </span>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-normal">
            Business Stage*
          </label>
          <MultiSelect onValueChange={handleBusinessStageChange}>
            <MultiSelectTrigger
              selectedItems={selectedBusinessStages}
              onRemoveItem={handleRemoveBusinessStage}
            >
              <MultiSelectValue placeholder="Select business stage" />
            </MultiSelectTrigger>
            <MultiSelectContent>
              <MultiSelectItem value="Idea">Idea</MultiSelectItem>
              <MultiSelectItem value="Startup">Startup</MultiSelectItem>
              <MultiSelectItem value="Growth">Growth</MultiSelectItem>
              <MultiSelectItem value="Mature">Mature</MultiSelectItem>
            </MultiSelectContent>
          </MultiSelect>
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

export default InvestmentPreference;
