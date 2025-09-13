import Button from '@/components/ui/Button';
import Input from '@/components/ui/Inputs';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCurrentProfile, updateProfile } from '@/hooks/useUpdateProfile';
import { SMEsBusinessInfo } from '@/lib/uitils/types';
import { africanCountries } from '@/lib/utils';
import { useEffect, useState } from 'react';
import 'react-country-state-city/dist/react-country-state-city.css';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
type Props = {};

export default function Info({}: Props) {
  const { data: user, isLoading, error } = getCurrentProfile();
  const { smes_bussiness_info } = updateProfile();
  console.log(user, 'user');
  const [selectedCountry, setSelectedCountry] = useState<string[]>(
    user?.countryOfOperation || []
  );

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<SMEsBusinessInfo>({
    defaultValues: {
      businessName: '',
      registrationNumber: '',
      countryOfOperation: [],
      businessStage: '',
      industry: '',
      website: '',
    },
  });

  useEffect(() => {
    if (user) {
      setSelectedCountry(
        user?.countryOfOperation ||
          user?.smeBusinessInfo?.countryOfOperation ||
          []
      );
      reset({
        businessName:
          user?.investorInvestmentInfo?.businessName ||
          user?.smeBusinessInfo?.businessName ||
          '',
        registrationNumber:
          user?.investorInvestmentInfo?.registrationNumber ||
          user?.smeBusinessInfo?.registrationNumber ||
          '',
        countryOfOperation:
          user?.investorInvestmentInfo?.countryOfOperation || [],
        businessStage:
          user?.investorInvestmentInfo?.businessStage ||
          user?.smeBusinessInfo?.businessStage ||
          '',
        industry:
          user?.investorInvestmentInfo?.industry ||
          user?.smeBusinessInfo?.industry ||
          '',
        website:
          user?.investorInvestmentInfo?.website ||
          user?.smeBusinessInfo?.website ||
          '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data: any) => {
    smes_bussiness_info
      .mutateAsync(data)
      .then((res) => {
        toast.success('Profile data updated successfully');
      })
      .catch((err) => toast.error(err?.msg));
  };
  const businessStage = watch('businessStage');
  const handleCountryStageChange = (value: string) => {
    const newCountry = selectedCountry.includes(value)
      ? selectedCountry.filter((item) => item !== value)
      : [...selectedCountry, value];

    setSelectedCountry(newCountry);
    setValue('countryOfOperation', newCountry);
  };

  const handleRemoveCountry = (value: string) => {
    const newCountry = selectedCountry.filter((item) => item !== value);
    setSelectedCountry(newCountry);
    setValue('countryOfOperation', newCountry);
  };
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6">
      <div className="flex flex-col w-full gap-x-6 lg:flex-row">
        <form className="grid w-full lg:grid-cols-2 gap-2 grid-cols-1">
          <Input
            type="text"
            {...register('businessName', {
              required: 'Business Name is required',
            })}
            label="Business Name"
            className="h-[43px] "
          />
          <Input
            {...register('registrationNumber', {
              required: 'Business Name is required',
            })}
            type="text"
            label="Business Registration Number"
            className="h-[43px] "
          />
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
                <MultiSelectValue placeholder="Select country of operation" />
              </MultiSelectTrigger>
              <MultiSelectContent>
                {africanCountries.map((country) => (
                  <MultiSelectItem key={country} value={country}>
                    {country}
                  </MultiSelectItem>
                ))}
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
              onValueChange={(val) => setValue('businessStage', val)}
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
            {...register('industry', {
              required: 'Business Name is required',
            })}
            type="text"
            label="Industry"
            className="h-[43px]"
          />
          <Input
            {...register('website', {
              required: 'Business Name is required',
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
            <img src={'/icons/upload2.svg'} />
            <p className="text-[#52575C] font-normal text-xs">
              Click to add logo
            </p>
          </div>
        </div>
      </div>
      <div className="flex lg:max-w-[83%] mt-8 w-full justify-between lg:flex-row flex-col items-center pr-6">
        <div className="py-3 px-5 my-6 rounded-[40px] items-center gap-2 w-full max-w-130 bg-[#F4FFFC] inline-flex font-normal text-xs text-[#062039]">
          <img src={'/icons/circle_warning.svg'} /> PS: Changes made to your
          profile will be subject to verification
        </div>
        <Button
          state={smes_bussiness_info.isPending ? 'loading' : undefined}
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
