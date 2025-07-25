"use client";

import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import Input from "@/components/ui/Inputs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { complianceAttachment, createComplianceForm } from "@/lib/uitils/types";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

function CompliancePage() {
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [files, setFiles] = useState<complianceAttachment[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<createComplianceForm>();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50">
      <Card className="grid gap-8 md:grid-cols-5 p-6 w-full">
        {/* Make a Complaint Form */}
        <div className="flex gap-6 col-span-3">
          <div className="space-y-6 pb-6 w-full">
            <div className="border rounded-lg border-[#ABD2C7] bg-[#F4FFFC] px-6 py-3 text-center">
              <div>
                <h6 className="text-[#2E3034] font-semibold text-xl">
                  Compliance Hub
                </h6>
              </div>
            </div>
            <form
              // onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="reason">Select Country</Label>
                <Select onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder="Select Reason"
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unite states">United States</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="austrailia">Austrailia</SelectItem>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="col-span-2 text-[10px] text-red-500">
                    {errors.category.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Select Product Category</Label>
                <Select onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder="Select Reason"
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stock">Stock</SelectItem>
                    <SelectItem value="gods">Goods</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="col-span-2 text-[10px] text-red-500">
                    {errors.category.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Describe your product</Label>
                <Textarea
                  {...register("description", {
                    required: "business Registration number is required",
                  })}
                  id="description"
                  placeholder="Enter Message"
                  className="min-h-[120px]"
                />
                {errors.description && (
                  <span className="col-span-2 text-[10px] text-red-500">
                    {errors.description.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="upload">
                  Upload Pictures or videos (Optional)
                </Label>
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor="upload"
                    className="flex flex-col items-center justify-center w-full h-[5.0625rem] border-2 border-dashed border-green cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center  ">
                      {!fileUploadLoading ? (
                        <>
                          <CIcons.documentUpload />

                          <p className=" text-sm text-[#52575C]">
                            Click to add image/Video
                          </p>
                        </>
                      ) : (
                        <Loader className="animate-spin h-8 w-8 " />
                      )}
                    </div>
                    <Input
                      // disabled={fileUploadLoading}
                      name="supportFile"
                      // onChange={handleFileUpload}
                      id="upload"
                      type="file"
                      className="hidden"
                    />

                    {/* {files?.map((items) => {
                      return (
                        <div className="mx-auto w-full items-start text-red-400 fotn-normal text-xs">
                          {items.fileName}
                        </div>
                      );
                    })} */}
                  </Label>
                </div>
              </div>

              <Button
                // type="submit"
                // disabled={createSupport.isPending || fileUploadLoading}
                // state={createSupport.isPending ? "loading" : undefined}
                size="big"
                className="w-full"
              >
                Submit
              </Button>
            </form>
          </div>
          <Separator className="hidden md:block" orientation="vertical" />
        </div>

        {/* Dispute History */}
        <div className="space-y-6 col-span-2">
          <h6 className="text-[#2E3034] font-bold text-xl">
            Compliance Result
          </h6>

          <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
            <div className="p-4 bg-[#F4FFFC] rounded-full w-[67.44px] h-[67.44px]">
              <CIcons.carbonReport />
            </div>
            <p className="font-semibold text-lg">No compliance yet </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CompliancePage;
