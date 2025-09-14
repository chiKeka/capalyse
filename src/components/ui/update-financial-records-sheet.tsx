"use client";

import React, { useEffect, useState } from "react";
import Button from "./Button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./sheet";
import { Input } from "./input";
import { Label } from "./label";
import { CIcons } from "./CIcons";
import { CurrencyAmountInput } from "./Inputs";
import useDocument from "@/hooks/useDocument";
import { Loader } from "lucide-react";
import { useCreateFinancials, useDefaultCurrency } from "@/hooks/useFinancials";
import { toast } from "sonner";

interface UpdateFinancialRecordsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateFinancialRecordsSheet({ open, onOpenChange }: UpdateFinancialRecordsSheetProps) {
  const [date, setDate] = useState<string>("");
  const [revenue, setRevenue] = useState<{ amount: number | ""; currency: string }>({ amount: "", currency: "NGN" });
  const [expenses, setExpenses] = useState<{ amount: number | ""; currency: string }>({ amount: "", currency: "NGN" });
  const [debt, setDebt] = useState<{ amount: number | ""; currency: string }>({ amount: "", currency: "NGN" });

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
    const payload = {
      revenue: { amount: Number(revenue.amount || 0), currency: defaultCurrency },
      expense: { amount: Number(expenses.amount || 0), currency: defaultCurrency },
      debt: { amount: Number(debt.amount || 0), currency: defaultCurrency },
      backingDocs: files?.map((f) => f.id).filter(Boolean),
      startDate: date || new Date().toISOString().slice(0, 10),
      endDate: date || new Date().toISOString().slice(0, 10),
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
            <SheetTitle className="text-lg font-semibold">Update Financial Records</SheetTitle>
            <SheetDescription className="sr-only">Update your dashboard figures and upload a supporting document</SheetDescription>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form className="flex flex-col gap-5">
            {/* Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="finance-date" className="text-sm font-medium text-foreground">Select Date</Label>
              <div className="relative">
                <Input
                  id="finance-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11"
                />
                <img src="/icons/calendar.svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 opacity-70 pointer-events-none" />
              </div>
            </div>

            {/* Revenue */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Revenue</Label>
              <CurrencyAmountInput
                amount={revenue.amount}
                currency={revenue.currency}
                onAmountChange={(val) => setRevenue((s) => ({ ...s, amount: val as number | "" }))}
                onCurrencyChange={(cur) => setRevenue((s) => ({ ...s, currency: cur }))}
                currencyDisabled
              />
            </div>

            {/* Expenses */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Expenses</Label>
              <CurrencyAmountInput
                amount={expenses.amount}
                currency={expenses.currency}
                onAmountChange={(val) => setExpenses((s) => ({ ...s, amount: val as number | "" }))}
                onCurrencyChange={(cur) => setExpenses((s) => ({ ...s, currency: cur }))}
                currencyDisabled
              />
            </div>

            {/* Debt */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Debt</Label>
              <CurrencyAmountInput
                amount={debt.amount}
                currency={debt.currency}
                onAmountChange={(val) => setDebt((s) => ({ ...s, amount: val as number | "" }))}
                onCurrencyChange={(cur) => setDebt((s) => ({ ...s, currency: cur }))}
                currencyDisabled
              />
            </div>

            {/* Upload */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="finance-upload" className="text-sm font-medium text-foreground">Upload document</Label>
              <div className="flex items-center justify-center w-full">
                <Label
                  htmlFor="finance-upload"
                  className="flex flex-col items-center justify-center w-full h-[5.0625rem] border-2 border-dashed border-green cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {!fileUploadLoading ? (
                      <>
                        <CIcons.documentUpload />
                        <p className="mb-2 text-sm text-[#52575C]">Click to add document</p>
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
                    <div key={items.fileName} className="mx-auto w-full items-start text-red-400 fotn-normal text-xs">
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
          <Button className="w-full" variant="primary" onClick={onSubmit} state={createFinancials.isPending ? 'loading' : undefined} disabled={createFinancials.isPending}>
            Update
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
