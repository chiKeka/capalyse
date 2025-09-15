"use client";

import useDocument from "@/hooks/useDocument";
import { useCreateFinancials, useDefaultCurrency } from "@/hooks/useFinancials";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "./Button";
import { Calendar } from "./calendar";
import { CIcons } from "./CIcons";
import { Input } from "./input";
import { CurrencyAmountInput } from "./Inputs";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet";

interface UpdateFinancialRecordsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateFinancialRecordsSheet({
  open,
  onOpenChange,
}: UpdateFinancialRecordsSheetProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [revenue, setRevenue] = useState<{
    amount: number | "";
    currency: string;
  }>({ amount: "", currency: "NGN" });
  const [expenses, setExpenses] = useState<{
    amount: number | "";
    currency: string;
  }>({ amount: "", currency: "NGN" });
  const [debt, setDebt] = useState<{ amount: number | ""; currency: string }>({
    amount: "",
    currency: "NGN",
  });

  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const { useUploadDocument } = useDocument();
  const uploadDocument = useUploadDocument();
  const { data: defaultCurrency = "NGN" } = useDefaultCurrency();
  const createFinancials = useCreateFinancials();

  // keep currency synced to user's default
  useEffect(() => {
    const setCurrencyAll = (cur: string) => {
      setRevenue((s) => ({ ...s, currency: cur }));
      setExpenses((s) => ({ ...s, currency: cur }));
      setDebt((s) => ({ ...s, currency: cur }));
    };
    setCurrencyAll(defaultCurrency);
  }, [defaultCurrency]);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploadLoading(true);
    await uploadDocument.mutateAsync(
      {
        file,
        fileName: file.name,
        category: "finance",
      },
      {
        onSuccess: (res) => {
          setFiles([
            {
              id: res?._id,
              fileName: res?.originalName,
              fileUrl: `${process.env.NEXT_PUBLIC_API_URL}/documents/${res?._id}/download`,
              fileSize: res?.size,
              mimeType: res?.mimeType,
            },
          ]);
          setFileUploadLoading(false);
        },
        onError: () => {
          setFileUploadLoading(false);
        },
      }
    );
  };

  const onSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a start and end date");
      return;
    }
    const payload = {
      revenue: {
        amount: Number(revenue.amount || 0),
        currency: defaultCurrency,
      },
      expense: {
        amount: Number(expenses.amount || 0),
        currency: defaultCurrency,
      },
      debt: { amount: Number(debt.amount || 0), currency: defaultCurrency },
      backingDocs: files?.map((f: any) => f.id).filter(Boolean),
      startDate,
      endDate,
    };

    try {
      await createFinancials.mutateAsync(payload);
      toast.success("Financial records updated");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update financial records");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="p-0 sm:max-w-[31.875rem] w-full">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <div>
            <SheetTitle className="text-lg font-semibold">
              Update Financial Records
            </SheetTitle>
            <SheetDescription className="sr-only">
              Update your dashboard figures and upload a supporting document
            </SheetDescription>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form className="flex flex-col gap-5">
            {/* Date Range */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Select Date
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
                      setStartDate(
                        val?.from ? format(val.from as Date, "yyyy-MM-dd") : ""
                      );
                      setEndDate(
                        val?.to ? format(val.to as Date, "yyyy-MM-dd") : ""
                      );
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Revenue */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Revenue
              </Label>
              <CurrencyAmountInput
                amount={revenue.amount}
                currency={revenue.currency}
                onAmountChange={(val) =>
                  setRevenue((s) => ({ ...s, amount: val as number | "" }))
                }
                onCurrencyChange={(cur) =>
                  setRevenue((s) => ({ ...s, currency: cur }))
                }
                currencyDisabled
              />
            </div>

            {/* Expenses */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Expenses
              </Label>
              <CurrencyAmountInput
                amount={expenses.amount}
                currency={expenses.currency}
                onAmountChange={(val) =>
                  setExpenses((s) => ({ ...s, amount: val as number | "" }))
                }
                onCurrencyChange={(cur) =>
                  setExpenses((s) => ({ ...s, currency: cur }))
                }
                currencyDisabled
              />
            </div>

            {/* Debt */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">
                Debt
              </Label>
              <CurrencyAmountInput
                amount={debt.amount}
                currency={debt.currency}
                onAmountChange={(val) =>
                  setDebt((s) => ({ ...s, amount: val as number | "" }))
                }
                onCurrencyChange={(cur) =>
                  setDebt((s) => ({ ...s, currency: cur }))
                }
                currencyDisabled
              />
            </div>

            {/* Upload */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="finance-upload"
                className="text-sm font-medium text-foreground"
              >
                Upload document
              </Label>
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="finance-upload"
                  className="flex flex-col items-center justify-center w-full h-[5.0625rem] border-2 border-dashed border-green cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {!fileUploadLoading ? (
                      <>
                        <CIcons.documentUpload />
                        <p className="mb-2 text-sm text-[#52575C]">
                          Click to add document
                        </p>
                      </>
                    ) : (
                      <Loader className="animate-spin h-8 w-8 " />
                    )}
                  </div>
                  <Input
                    disabled={fileUploadLoading}
                    id="finance-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  {files?.map((items) => (
                    <div
                      key={items.fileName}
                      className="mx-auto w-full items-start text-red-400 fotn-normal text-xs"
                    >
                      {items.fileName}
                    </div>
                  ))}
                </Label>
              </div>
            </div>

            <div className="pt-10" />
          </form>
        </div>
        <div className="border-t px-6 py-4">
          <Button
            className="w-full"
            variant="primary"
            onClick={onSubmit}
            state={createFinancials.isPending ? "loading" : undefined}
            disabled={createFinancials.isPending}
          >
            Update
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
