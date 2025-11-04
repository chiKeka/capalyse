import Input from "@/components/ui/Inputs";
import { useAfricanCountries } from "@/hooks/useComplianceCatalogs";
import {
  createProgram,
  ProgramFormData,
  updateProgram,
} from "@/hooks/usePrograms";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Button from "./Button";
import { Calendar } from "./calendar";
import { Label } from "./label";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "./multi-select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./sheet";

// Type definitions

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  program?: any;
  isEdit?: boolean;
};

function CreateProgram({ isOpen, setIsOpen, program, isEdit }: Props) {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [partnersInput, setPartnersInput] = useState("");
  const { mutateAsync: createProgramMutation } = createProgram();
  const { mutateAsync: updateProgramMutation } = updateProgram(program?.id);

  // React Hook Form setup
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgramFormData>({
    defaultValues: {
      name: "",
      objectives:"",
      description: "",
      startDate: "",
      endDate: "",
      smeStage: [],
      eligibleCountries: [],
      industryFocus: [],
      maxParticipants: 1,
      supportTypes: [],
      applicationDeadline: "",
      requirements: [],
      partners: [
        {
          name: "",
          role: "member",
          description: "",
          contactInfo: "",
        },
      ],
    },
  });

  const {
    data: countries = [],
    isLoading: countriesLoading,
    isError: countriesError,
  } = useAfricanCountries();

  // Watch form values for controlled components
  const watchedValues = watch();

  // Reset form values when modal opens or program data changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && program) {
        // Edit mode - populate form with existing program data
        reset({
          name: program.name || "",
          objectives: program?.objectives|| "",
          description: program.description || "",
          startDate: program.startDate || "",
          endDate: program.endDate || "",
          smeStage: program.smeStage || [],
          eligibleCountries: program.eligibleCountries || [],
          industryFocus: program.industryFocus || [],
          maxParticipants: program.maxParticipants || 1,
          supportTypes: program.supportTypes || [],
          applicationDeadline: program.applicationDeadline || "",
          requirements: program.requirements || [],
          partners: program.partners || [
            {
              name: "",
              role: "member",
              description: "",
              contactInfo: "",
            },
          ],
        });

        // Set date range for edit mode
        if (program.startDate && program.endDate) {
          setRange({
            from: new Date(program.startDate),
            to: new Date(program.endDate),
          });
        }

        // Set partners input for edit mode
        if (program.partners && program.partners.length > 0) {
          setPartnersInput(program.partners.map((p: any) => p.name).join(", "));
        }
      } else {
        // Create mode - reset form to default values
        reset({
          name: "",
          description: "",
          objectives:"",
          startDate: "",
          endDate: "",
          smeStage: [],
          eligibleCountries: [],
          industryFocus: [],
          maxParticipants: 1,
          supportTypes: [],
          applicationDeadline: "",
          requirements: [],
          partners: [
            {
              name: "",
              role: "member",
              description: "",
              contactInfo: "",
            },
          ],
        });

        // Reset additional state
        setRange({});
        setPartnersInput("");
      }
    }
  }, [isOpen, isEdit, program, reset]);

  // Reset additional state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRange({});
      setPartnersInput("");
    }
  }, [isOpen]);

  const onSubmit = async (data: ProgramFormData) => {
    const payload = {
      ...data,
      maxParticipants: Number(data.maxParticipants),
      startDate: range?.from ? format(range?.from, "yyyy-MM-dd") : "",
      endDate: range?.to ? format(range?.to, "yyyy-MM-dd") : "",
      applicationDeadline: range?.from ? format(range?.from, "yyyy-MM-dd") : "",
    };
    if (isEdit) {
      await updateProgramMutation(payload, {
        onSuccess: () => {
          toast.success("Program updated successfully");
          setIsOpen(false);
          reset();
        },
      });
    } else {
      await createProgramMutation(payload, {
        onSuccess: () => {
          toast.success("Program created successfully");
          setIsOpen(false);
          reset();
        },
        onError: (error) => {
          toast.error(error.message);
        },
        onSettled: () => {
          setIsOpen(false);
        },
      });
    }
  };

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="   sm:max-w-[31.875rem] w-full">
          <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <SheetTitle className="text-lg font-semibold">
              Create Program
            </SheetTitle>
          </SheetHeader>

          <form
            className="p-3 flex flex-col h-full justify-between "
            onSubmit={handleSubmit((data) => {
              onSubmit(data);
            })}
          >
            <div className="flex flex-col p-1 gap-6 max-h-[calc(100vh-200px)] no-scrollbar h-full overflow-y-scroll">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Program Name
                </Label>
                <Input
                  placeholder="Program Name"
                  type="text"
                  className="border rounded-lg w-full"
                  {...register("name", {
                    required: "Program name is required",
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Overview/Description
                </Label>
                <Input
                  placeholder="Overview/Description"
                  type="textarea"
                  className="border min-h-26 rounded-lg w-full"
                  {...register("description", {
                    required: "Description is required",
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Program Objectives
                </Label>
                <Input
                  placeholder="Program Objectives"
                  type="textarea"
                  className="border min-h-26 rounded-lg w-full"
                  {...register("objectives", {
                    required: "Description is required",
                  })}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium text-foreground">
                  Duration
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: "Start date is required" }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="relative w-full inline-flex items-center h-11 rounded-md border bg-background px-3 pl-10 text-left text-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            aria-label="Select start date"
                          >
                            <img
                              src="/icons/calendar.svg"
                              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70 pointer-events-none"
                            />
                            <span className="text-foreground/80">
                              {range?.from
                                ? format(range?.from, "PPP")
                                : "Start Date"}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[95%]" align="start">
                          <Calendar
                            mode="single"
                            selected={range?.from}
                            onSelect={(date) => {
                              setRange((prev) => ({ ...prev, from: date }));
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              );
                            }}
                            numberOfMonths={1}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ required: "End date is required" }}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="relative w-full inline-flex items-center h-11 rounded-md border bg-background px-3 pl-10 text-left text-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            aria-label="Select end date"
                          >
                            <img
                              src="/icons/calendar.svg"
                              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70 pointer-events-none"
                            />
                            <span className="text-foreground/80">
                              {range?.to
                                ? format(range?.to, "PPP")
                                : "End Date"}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[95%]" align="start">
                          <Calendar
                            mode="single"
                            selected={range?.to}
                            onSelect={(date) => {
                              setRange((prev) => ({ ...prev, to: date }));
                              field.onChange(
                                date ? format(date, "yyyy-MM-dd") : ""
                              );
                            }}
                            numberOfMonths={1}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
                {(errors.startDate || errors.endDate) && (
                  <div className="text-red-500 text-xs">
                    {errors.startDate?.message || errors.endDate?.message}
                  </div>
                )}
              </div>
              <Controller
                name="smeStage"
                control={control}
                rules={{ required: "SME Stage is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange([value])}
                    value={field.value[0] || ""}
                  >
                    <Label className="text-sm font-medium text-foreground">
                      SME Stage
                    </Label>
                    <SelectTrigger>
                      <SelectValue placeholder="SME Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early">Early</SelectItem>
                      <SelectItem value="growth">Growth</SelectItem>
                      <SelectItem value="expansion">Expansion</SelectItem>
                      <SelectItem value="mature">Mature</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.smeStage && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.smeStage.message}
                </p>
              )}
              <div>
                {countriesLoading && <Loader className="animate-spin" />}
                {countriesError && <p>Error loading countries</p>}
                {countries && (
                  <Controller
                    name="eligibleCountries"
                    control={control}
                    rules={{ required: "At least one country is required" }}
                    render={({ field }) => (
                      <MultiSelect
                        onValueChange={(value) => {
                          if (value && !field.value.includes(value)) {
                            field.onChange([...field.value, value]);
                          }
                        }}
                      >
                        <Label className="text-sm mb-1.5 font-medium text-foreground">
                          Eligible country (You can enter more than one)
                        </Label>
                        <MultiSelectTrigger
                          selectedItems={field.value}
                          onRemoveItem={(value) => {
                            field.onChange(
                              field.value.filter((v) => v !== value)
                            );
                          }}
                        >
                          <MultiSelectValue placeholder="Eligible Countries" />
                        </MultiSelectTrigger>
                        <MultiSelectContent>
                          {countries.map((country) => (
                            <MultiSelectItem
                              key={country.code}
                              value={country.name}
                            >
                              {country.name}
                            </MultiSelectItem>
                          ))}
                        </MultiSelectContent>
                      </MultiSelect>
                    )}
                  />
                )}
                {errors.eligibleCountries && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.eligibleCountries.message}
                  </p>
                )}
                <p className="font-normal text-xs mt-1">
                  Press Enter to add countries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-1">
                <div>
                  <Controller
                    name="industryFocus"
                    control={control}
                    rules={{ required: "Industry focus is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => field.onChange([value])}
                        value={field.value[0] || ""}
                      >
                        <Label className="text-sm mb-1.5 font-medium text-foreground">
                          Industry Focus
                        </Label>
                        <SelectTrigger>
                          <SelectValue placeholder="Industry Focus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Software">Software</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.industryFocus && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.industryFocus.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Maximum number of participants
                  </Label>
                  <Input
                    placeholder="Maximum number of participants"
                    type="number"
                    className="border rounded-lg w-full "
                    {...register("maxParticipants", {
                      required: "Max participants is required",
                      min: { value: 1, message: "Must be at least 1" },
                    })}
                  />
                  {errors.maxParticipants && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.maxParticipants.message}
                    </p>
                  )}
                </div>
              </div>
              <Controller
                name="supportTypes"
                control={control}
                rules={{ required: "At least one support type is required" }}
                render={({ field }) => (
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Types of support
                    </Label>
                    <div className="flex mt-2 flex-row gap-2 flex-wrap">
                      {[
                        { label: "Resource Guides", value: "resource_guides" },
                        {
                          label: "Coaching Training",
                          value: "coaching_training",
                        },
                        { label: "Mentoring", value: "mentoring" },
                        { label: "Funding", value: "funding" },
                        { label: "Networking", value: "networking" },
                        { label: "Custom", value: "custom" },
                      ].map((type) => (
                        <div
                          key={type.value}
                          className={`border-2 text-xs rounded-full w-fit  px-3 py-2 cursor-pointer ${
                            field.value?.includes(type.value)
                              ? "border-green text-green"
                              : " text-[#D1D1D1] border-[#D1D1D1]"
                          }`}
                          onClick={() => {
                            const newValue = field.value.includes(type.value)
                              ? field.value.filter((t) => t !== type.value)
                              : [...field.value, type.value];
                            field.onChange(newValue);
                          }}
                        >
                          {type.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
              {errors.supportTypes && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.supportTypes.message}
                </p>
              )}

              <Controller
                name="partners"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label className="text-sm font-medium text-foreground">
                      Partners
                    </Label>
                    <Input
                      name="partners"
                      placeholder="Partners (separate with commas)"
                      type="text"
                      className="border rounded-lg w-full"
                      value={partnersInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPartnersInput(value);
                      }}
                      onBlur={() => {
                        // Process on blur to convert to Partner objects
                        const partnersArray = partnersInput
                          .split(",")
                          .map((partner) => partner.trim())
                          .filter((partner) => partner.length > 0)
                          .map((name) => ({
                            name,
                            role: "member",
                            description: "",
                            contactInfo: "",
                          }));
                        field.onChange(partnersArray);
                      }}
                    />
                    <p className="font-normal text-xs mt-1">
                      Use comma to add more partners.
                    </p>
                  </div>
                )}
              />
            </div>

            <Button
              size="big"
              className="rounded-full"
              variant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateProgram;
