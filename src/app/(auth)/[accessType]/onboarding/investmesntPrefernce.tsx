import { CurrencyAmountInput } from "@/components/ui/Inputs";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

import { useAuth } from "@/hooks/useAuth";
import { authAtom, onboardingStepAtom } from "@/lib/atoms/atoms";
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
import { toast } from "sonner";

type Props = {};

type InvestmentPreferenceormProps = {
  setLoading: Dispatch<SetStateAction<boolean>>;
  onFinish?: () => void;
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
      setError,
    } = useForm<
      InvestmentPreferenceInfo & {
        min: number | "";
        max: number | "";
        currency: string;
      }
    >();

    useEffect(() => {
      props.setLoading(investor_investment_info.isPending);
    }, [investor_investment_info.isPending, props]);

    useEffect(() => {
      register("investmentType", { required: "Investment type is required" });
      register("targetRegions", { required: "Target region is required" });
      register("targetIndustries", { required: "Target industry is required" });
      register("businessStage", { required: "Business stage is required" });
    }, [register]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        return new Promise((resolve) => {
          handleSubmit(
            (values) => {
              // Custom validation: min < max
              if (
                Number.isFinite(min) &&
                Number.isFinite(max) &&
                typeof min === "number" &&
                typeof max === "number" &&
                min >= max
              ) {
                setError("min", {
                  type: "manual",
                  message: "Min must be less than Max",
                });
                setError("max", {
                  type: "manual",
                  message: "Max must be greater than Min",
                });
                resolve(false);
                return;
              }
              onSubmit(values);
              resolve(true);
            },
            () => {
              resolve(false);
            }
          )();
        });
      },
      isLoading: investor_investment_info.isPending,
    }));
    const setAuth = useSetAtom(authAtom);
    const router = useRouter();
    const onSubmit = (data: any) => {
      const payload = {
        ...data,
        investmentTypes: selectedInvestmentTypes,
        targetRegions: selectedRegions,
        targetIndustries: selectedIndustries,
        businessStages: selectedBusinessStages,
        investmentRange: {
          min,
          max,
          currency,
        },
      };
      console.log("SUBMIT PAYLOAD:", payload);
      investor_investment_info
        .mutateAsync(payload)
        .then((res) => {
          setAuth((prev: any) => ({ ...prev, ...res?.data?.data?.user }));
        })
        .catch((err) => toast.error(err?.message));
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
      setSelectedInvestmentTypes(newTypes);
      setValue("investmentType", newTypes);
    };

    const handleRemoveInvestmentType = (value: string) => {
      const newTypes = selectedInvestmentTypes.filter((item) => item !== value);
      setSelectedInvestmentTypes(newTypes);
      setValue("investmentType", newTypes);
      setCurrentInvestmentType(undefined); // Reset the select value
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

    const [currentInvestmentType, setCurrentInvestmentType] = useState<
      string | undefined
    >(undefined);

    const [currency, setCurrency] = useState("USD");
    const [min, setMin] = useState<number | "">("");
    const [max, setMax] = useState<number | "">("");

    return (
      <form className="gap-4 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-2 w-full gap-4">
          <div>
            <label className="block mb-1 text-[10px] font-medium">
              Investment Type
            </label>
            <MultiSelect
              selectedItems={selectedInvestmentTypes}
              onValueChange={handleInvestmentTypeChange}
            >
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
            <label className="block mb-1 text-[10px] font-medium">
              Target Regions
            </label>
            <MultiSelect
              selectedItems={selectedRegions}
              onValueChange={handleRegionChange}
            >
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
                <MultiSelectItem value="South_South">
                  South South
                </MultiSelectItem>
              </MultiSelectContent>
            </MultiSelect>
            {errors.targetRegions && (
              <span className="col-span-2 text-[10px] text-red-500">
                {errors.targetRegions.message}
              </span>
            )}
          </div>

          <div>
            <label className="block mb-1 text-[10px] font-medium">
              Target Industries
            </label>
            <MultiSelect
              selectedItems={selectedIndustries}
              onValueChange={handleIndustryChange}
            >
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
            <label className="block mb-1 text-[10px] font-medium">
              Business Stage*
            </label>
            <MultiSelect
              selectedItems={selectedBusinessStages}
              onValueChange={handleBusinessStageChange}
            >
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
        </div>

        <div className="flex flex-col">
          <label className="block mb-1 text-[10px] font-medium">
            Investment Range
          </label>
          <div className="grid md:grid-cols-2 w-full gap-4">
            <div>
              <CurrencyAmountInput
                tag="Min"
                amount={min}
                onAmountChange={(value) => setMin(value as number)}
                currency={currency}
                onCurrencyChange={setCurrency}
              />
              {errors.min && (
                <span className="col-span-2 text-[10px] text-red-500">
                  {errors.min.message}
                </span>
              )}
            </div>
            <div>
              <CurrencyAmountInput
                tag="Max"
                amount={max}
                onAmountChange={(value) => setMax(value as number)}
                currency={currency}
                onCurrencyChange={setCurrency}
              />
              {errors.max && (
                <span className="col-span-2 text-[10px] text-red-500">
                  {errors.max.message}
                </span>
              )}
            </div>
          </div>
        </div>
      </form>
    );
  }
);

export default InvestmentPreference;
