"use client";

import DashboardCardLayout from "@/components/layout/dashboardCardLayout";
import EmptyBox from "@/components/sections/dashboardCards/emptyBox";
import Programs from "@/components/sections/dashboardCards/programs";
import Button from "@/components/ui/Button";
import { Calendar } from "@/components/ui/calendar";

import Input from "@/components/ui/Inputs";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createProgram, useProgramForm } from "@/hooks/useProgramForm";
import { GetPrograms } from "@/hooks/usePrograms";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

type Props = {};
const programs = [
  { id: 1, status: "active", label: "Open for Applications" },
  { id: 2, status: "closed", label: "Applications Closed" },
  { id: 3, status: "active", label: "Open for Applications" },
  { id: 4, status: "closed", label: "Applications Closed" },
];

const tabs = ["active", "closed"];

function page({}: Props) {
  const filterParams = {
    page: 1,
    limit: 10,
    industry: undefined,
    country: undefined,
    stage: undefined,
    supportType: undefined,
    status: undefined,
    sortBy: undefined,
  };
  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const { data: programs } = GetPrograms(filterParams);
  const filteredPrograms = programs?.programs?.filter((p: any) =>
    currentTab === "active" ? p.status === "active" : p.status === "closed"
  );
  const [isOpen, setIsOpen] = useState(false);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { mutateAsync: createProgramMutation } = createProgram();
  const { formData, isLoading, error, updateField } = useProgramForm();

  const onSubmit = async () => {
    await createProgramMutation(formData, {
      onSuccess: () => {
        toast.success("Program created successfully");
        setIsOpen(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
      onSettled: () => {
        setIsOpen(false);
      },
    });
  };
  const selectedItems = formData.supportTypes;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <DashboardCardLayout height="h-full" caption="">
          <div className="flex flex-row justify-between">
            <div>
              <div className="flex flex-row gap-3">
                <img src={"/icons/code.svg"} />
                <p className="text-green text-base font-bold">Program</p>
              </div>
              <div className="flex gap-0 my-5">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(tab)}
                    className={`transition-all capitalize duration-300 ease-in-out  px-4 py-2 text-sm h-[39px] whitespace-nowrap ${
                      currentTab === tab
                        ? "text-green border-b-green border-b font-bold"
                        : "text-[#A0A4A8] border-b border-b-[#A0A4A8] hover:font-bold"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <Button size="small" onClick={() => setIsOpen(true)}>
              Create New Program
            </Button>
          </div>
        </DashboardCardLayout>
      </div>
      {filteredPrograms?.length > 0 ? (
        <div className="flex-1 ">
          <DashboardCardLayout
            height="h-full"
            // caption={`Recent ${currentTab} Programs`}
          >
            <div className="my-8 flex-col flex gap-2">
              {filteredPrograms?.map((program: any) => {
                return (
                  <Programs
                    program={program}
                    status={program.status}
                    label={program.label}
                    key={program.id}
                  />
                );
              })}
            </div>
          </DashboardCardLayout>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4 lg:flex-row">
          <DashboardCardLayout
            height="h-full"
            caption={`Recent ${currentTab} Programs`}
          >
            <div className="w-full h-full py-24 flex items-center justify-center">
              <EmptyBox
                buttonText="Create Program"
                caption="No Programs Yet!"
                caption2={`You have not created any ${currentTab.toLowerCase()} programs yet.`}
              />
            </div>
          </DashboardCardLayout>
        </div>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="   sm:max-w-[31.875rem] w-full">
          <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <SheetTitle className="text-lg font-semibold">
              Create Program
            </SheetTitle>
          </SheetHeader>

          <form
            className="p-3 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <Input
              placeholder="Program Name"
              type="text"
              className="border rounded-lg w-full"
              label="Program Name"
              name="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            <Input
              placeholder="Overview/Description"
              name="description"
              type="textarea"
              className="border rounded-lg w-full"
              label="Overview/Description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
            />

            <div>
              <Label className="text-sm font-medium font-bold text-foreground">
                Duration
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="relative inline-flex items-center w-full h-11 rounded-md border bg-background px-3 pl-10 text-left text-sm hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label="Select date range"
                  >
                    <img
                      src="/icons/calendar.svg"
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70 pointer-events-none"
                    />
                    <span className="text-foreground/80">
                      {range.from && range.to
                        ? `${format(range.from, "PPP")} - ${format(
                            range.to,
                            "PPP"
                          )}`
                        : "Select Date"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[95%]" align="start">
                  <Calendar
                    mode="range"
                    selected={range as any}
                    onSelect={(val: any) => {
                      setRange(val || {});
                      const startDate = val?.from
                        ? format(val.from as Date, "yyyy-MM-dd")
                        : "";
                      const endDate = val?.to
                        ? format(val.to as Date, "yyyy-MM-dd")
                        : "";
                      setStartDate(startDate);
                      setEndDate(endDate);
                      updateField("startDate", startDate);
                      updateField("endDate", endDate);
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-full ">
              <Label className="text-sm  font-bold  mb-1">SME stage</Label>
              <Select>
                <SelectTrigger className="w-full border rounded-lg">
                  <SelectValue placeholder="SME stage" defaultValue="" />
                </SelectTrigger>
                <SelectContent className="rounded-lg w-full border">
                  <SelectItem value="Early">early </SelectItem>
                  <SelectItem value="growth">growth</SelectItem>
                  <SelectItem value="expansion">expansion</SelectItem>
                  <SelectItem value="mature">mature</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                placeholder="Enter country or countries"
                type="text"
                name="country name"
                label="Eligible country (You can enter more than one)"
              />
              <p className="font-normal text-xs">Use comma to add more.</p>
            </div>
            <div className=" w-full grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium  mb-1">
                  Industry of focus
                </Label>
                <Select>
                  <SelectTrigger className="w-full font-normal border rounded-lg">
                    <SelectValue placeholder="Health" defaultValue="Health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Health">Health </SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Input
                type="text"
                name="insdusrty"
                label="Maximum number of participants'"
              />
            </div>
            <div className="flex flex-row gap-2 flex-wrap">
              {[
                "Resource Guides",
                "Compliance Training",
                "Mentorship",
                "Live Sessions",
              ].map((item) => {
                const isSelected = selectedItems.includes(item);
                return (
                  <div key={item} className="flex items-center gap-2 flex-wrap">
                    <Label
                      className={`text-sm rounded-full border p-3 font-medium cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-transparent text-green border-green"
                          : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                      }`}
                      htmlFor={item}
                      onClick={() => {
                        const newSelection = selectedItems.includes(item)
                          ? selectedItems.filter((i) => i !== item)
                          : [...selectedItems, item];
                        updateField("supportTypes", newSelection);
                      }}
                    >
                      {item}
                    </Label>
                  </div>
                );
              })}
            </div>
            <div>
              <Input
                placeholder="Partners"
                type="text"
                name="Partners"
                label="partners"
              />
              <p className="font-normal text-xs">Use comma to add more.</p>
            </div>

            <div className="flex gap-3  w-full pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-full  mt-12"
              >
                {isLoading ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default page;
