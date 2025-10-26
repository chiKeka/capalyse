import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { CurrencyAmountInput } from '@/components/ui/Inputs';
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useDebounce from '@/hooks/useDebounce';
import { useSmeDirectory } from '@/hooks/useDirectories';
import { useInvestmentMutations, useInvestments } from '@/hooks/useInvestments';
import { Loader2Icon, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';

const InvestorInvestments = () => {
  const [search, setSearch] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const debouncedSearch = useDebounce(search, 500);
  const { data: investments = [], isLoading, error } = useInvestments();
  const { createInvestment, updateInvestment } = useInvestmentMutations();

  const { data: smeDirectory, isLoading: isLoadingSmeDirectory } =
    useSmeDirectory(undefined, { q: debouncedSearch });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<any>({
    mode: 'all',
    defaultValues: {
      investments: [
        {
          amount: '',
          currency: 'USD',
          smeUserId: '',
          date: '',
          metadata: {
            investmentType: '',
            description: '',
          },
        },
      ],
    },
  });
  const onSubmit = async (data: any) => {
    const oldpayload = {
      ...data.investments?.[0],
    };
    // console.log({
    //   oldpayload,
    // });

    try {
      if (isEditing && selectedInvestment) {
        // Update existing investment
        const updatePayload = {
          id: selectedInvestment.id,
          ...oldpayload,
        };
        // console.log({ updatePayload });
        await updateInvestment.mutateAsync(updatePayload);
        toast.success('Investment updated successfully');
        handleNewInvestment(); // Reset form after successful update
      } else {
        // Create new investment
        await createInvestment.mutateAsync(oldpayload);
        toast.success('Investment added successfully');
        reset();
      }
    } catch (err: any) {
      toast.error(err?.message || 'An error occurred');
    }
  };
  const { fields, append, remove } = useFieldArray({
    name: 'investments',
    control,
  });

  // Watch all investment fields to get current values
  const watchedInvestments = watch('investments');

  // Get the current SME data for the form
  const currentSmeData = watchedInvestments[0];

  // Create a combined list of SMEs including the currently selected one
  const allSmeOptions = React.useMemo(() => {
    const smeList = smeDirectory?.items || [];

    // If we have a selected SME that's not in the search results, add it
    if (currentSmeData?.smeUserId && currentSmeData?.metadata?.smeName) {
      const isAlreadyInList = smeList.some(
        (sme: any) => sme.userId === currentSmeData.smeUserId
      );
      if (!isAlreadyInList) {
        return [
          {
            userId: currentSmeData.smeUserId,
            name: currentSmeData.metadata.smeName,
          },
          ...smeList,
        ];
      }
    }

    return smeList;
  }, [smeDirectory?.items, currentSmeData]);

  // Function to handle investment selection for editing
  const handleInvestmentSelect = (investment: any) => {
    setSelectedInvestment(investment);
    setIsEditing(true);

    // Prefill the form with the selected investment data
    setValue(`investments.${0}.amount`, investment.amount || '');
    setValue(`investments.${0}.currency`, investment.currency || 'USD');
    setValue(`investments.${0}.smeUserId`, investment.smeUserId || '');
    setValue(
      `investments.${0}.date`,
      investment.date ? investment.date.split('T')?.[0] : ''
    );
    setValue(
      `investments.${0}.metadata.investmentType`,
      investment.metadata?.investmentType || ''
    );

    setValue(
      `investments.${0}.metadata.description`,
      investment.metadata?.description || ''
    );
  };

  // Function to reset form for new investment
  const handleNewInvestment = () => {
    setSelectedInvestment(null);
    setIsEditing(false);
    reset();
  };

  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[200px_1fr] gap-4">
        <div>
          <div className="text-sm text-black-400 border rounded-md divide-y divide-black-50 border-black-50">
            <h2 className="font-bold pl-6 pr-3 py-[0.6563rem]">Company</h2>
            {investments?.length > 0 ? (
              investments?.map((investment: any) => (
                <div
                  key={investment.id}
                  onClick={() => handleInvestmentSelect(investment)}
                  className={`py-[0.6563rem] leading-9 pl-6 pr-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedInvestment?.id === investment.id
                      ? 'bg-green-50 border-l-4 border-green-500'
                      : ''
                  }`}
                >
                  <span className="block">{investment.metadata.name}</span>
                  {selectedInvestment?.id === investment.id && (
                    <span className="text-xs text-green-600 font-medium">
                      Editing...
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-[0.6563rem] leading-9 pl-6 pr-3">
                No investments found
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="text-sm flex flex-col gap-2">
            <div className="flex items-center justify-between py-[0.6563rem] pl-6 pr-3">
              <h3 className="font-semibold text-lg">
                {isEditing ? 'Edit Investment' : 'Add New Investment'}
              </h3>
              {isEditing && (
                <Button
                  type="button"
                  onClick={handleNewInvestment}
                  variant="secondary"
                  size="small"
                  className="text-sm"
                >
                  New Investment
                </Button>
              )}
            </div>
            <form
              className="py-[0.6563rem] pl-6 pr-3 space-y-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">
                      Investment #{index + 1}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="tertiary"
                      size="small"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Company Name
                      </label>
                      <Select
                        onValueChange={(val) => {
                          setValue(`investments.${index}.smeUserId`, val);
                        }}
                        value={currentSmeData?.smeUserId ?? undefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company name" />
                        </SelectTrigger>
                        <SelectContent>
                          <div>
                            <Input
                              placeholder="Search company name"
                              onChange={(e) => {
                                const value = e.target.value;
                                setSearch(value);
                              }}
                              value={search}
                            />
                          </div>
                          {isLoadingSmeDirectory ? (
                            <div className="flex items-center justify-center h-full">
                              <Loader2Icon className="w-12 h-12 animate-spin" />
                            </div>
                          ) : (
                            allSmeOptions?.map((sme: any) => (
                              <SelectItem key={sme.userId} value={sme.userId}>
                                {sme.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Investment Type */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Investment Type
                      </label>
                      <Input
                        {...register(
                          `investments.${index}.metadata.investmentType`
                        )}
                        placeholder="e.g., Seed, Series A, etc."
                        className="h-[43px]"
                        type="text"
                      />
                    </div>

                    {/* Amount with Currency */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Investment Amount
                      </label>
                      <CurrencyAmountInput
                        amount={watchedInvestments[index]?.amount || ''}
                        onAmountChange={(value) =>
                          setValue(`investments.${index}.amount`, value)
                        }
                        currency={watchedInvestments[index]?.currency || 'USD'}
                        onCurrencyChange={(currency) =>
                          setValue(`investments.${index}.currency`, currency)
                        }
                        placeholder="Enter amount"
                        currencyOptions={[
                          'USD',
                          'EUR',
                          'NGN',
                          'GBP',
                          'CAD',
                          'AUD',
                        ]}
                      />
                    </div>

                    {/* Investment Date */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Investment Date
                      </label>
                      <Input
                        {...register(`investments.${index}.date`)}
                        placeholder="YYYY-MM-DD"
                        className="h-[43px]"
                        type="date"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      {...register(`investments.${index}.metadata.description`)}
                      placeholder="Brief description of the investment"
                      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              ))}

              <div className="flex flex-col items-end gap-2">
                {/* <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    append({
                      amount: '',
                      currency: 'USD',
                      companyName: '',
                      investmentDate: '',
                      investmentType: '',
                      description: '',
                    })
                  }
                  className="w-fit border-none"
                >
                  + Add Investment
                </Button> */}
                <Button
                  state={
                    createInvestment.isPending || updateInvestment.isPending
                      ? 'loading'
                      : 'default'
                  }
                  type="submit"
                  className="w-fit"
                >
                  {isEditing ? 'Update Investment' : 'Save Investment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorInvestments;
