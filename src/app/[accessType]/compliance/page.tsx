"use client";

import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
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
import { CreateComplianceForm, useCompliance, useGetComplianceCases } from "@/hooks/useCompliance";
import { useDocument } from "@/hooks/useDocument";
import { complianceAttachment } from "@/lib/uitils/types";
import { useAfricanCountries, useProductCategories } from "@/hooks/useComplianceCatalogs";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function CompliancePage() {
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [files, setFiles] = useState<complianceAttachment[]>([]);
  const { createCompliance, refreshCompliance } = useCompliance();
  const { data: complianceCases } = useGetComplianceCases();
  // console.log({ complianceCases });
  const { useUploadDocument } = useDocument();
  const uploadDocument = useUploadDocument();
  // Catalog data
  const {
    data: countries = [],
    isLoading: countriesLoading,
    isError: countriesError,
  } = useAfricanCountries();
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useProductCategories();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<CreateComplianceForm>();

  const onSubmit = (data: CreateComplianceForm) => {
    if (createCompliance?.data?.data?.data?.case?._id) {
      refreshCompliance.mutateAsync(createCompliance?.data?.data?.data?.case?._id).then(() => {
        toast.success("Compliance refreshed successfully");
        // reset();
        // console.log({ data });
      });
    } else {
      createCompliance.mutateAsync(data).then(() => {
        toast.success("Compliance submitted successfully");
        // reset();
        // console.log({ data });
      });
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    // check if file size is greater than 2MB
    if (file && file.size > 2000000) {
      toast.error("File size must be less than 2MB");
      return;
    }
    if (file) {
      uploadDocument.mutateAsync(
        {
          file: e.target.files[0],
          fileName: getValues("imageDocumentId") || file.name,
          category: "compliance",
        },
        {
          onSuccess: (res) => {
            setFiles([
              {
                fileName: res?.originalName,
                fileUrl: `${process.env.NEXT_PUBLIC_API_URL}/documents/${res?._id}/download`,
                fileSize: res?.size,
                mimeType: res?.mimeType,
              },
            ]);
            setValue("imageDocumentId", res?._id);
          },
          onError(error: any) {
            toast.error(error?.response?.data?.message);
          },
        },
      );
    }
  };
  const result = createCompliance?.data?.data?.data;
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50">
      <Card className="grid gap-8 md:grid-cols-5 p-6 w-full">
        {/* Make a Complaint Form */}
        <div className="flex gap-6 col-span-3">
          <div className="space-y-6 pb-6 w-full">
            <div className="border rounded-lg border-[#ABD2C7] bg-[#F4FFFC] px-6 py-3 text-center">
              <div>
                <h6 className="text-[#2E3034] font-semibold text-xl">Compliance Hub</h6>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Select Country</Label>
                <Select
                  onValueChange={(val) => setValue("country", val)}
                  disabled={countriesLoading || (!!countriesError && countries.length === 0)}
                >
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder={
                        countriesLoading
                          ? "Loading countries..."
                          : countriesError
                            ? "Failed to load countries"
                            : "Select Country"
                      }
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <span className="col-span-2 text-[10px] text-red-500">
                    {errors.country.message}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Select Product Category</Label>
                <Select
                  onValueChange={(val) => setValue("productCategory", val)}
                  disabled={categoriesLoading || (!!categoriesError && categories.length === 0)}
                >
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : categoriesError
                            ? "Failed to load categories"
                            : "Select Category"
                      }
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productCategory && (
                  <span className="col-span-2 text-[10px] text-red-500">
                    {errors.productCategory.message}
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
                <Label htmlFor="upload">Upload Pictures or videos (Optional)</Label>
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor="upload"
                    className="flex flex-col items-center justify-center w-full min-h-[5.0625rem] border-2 border-dashed border-green cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center  ">
                      {!fileUploadLoading ? (
                        <>
                          <CIcons.documentUpload />

                          <p className=" text-sm text-[#52575C]">Click to add image/Video</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Accepted formats: PNG, JPG, JPEG
                          </p>
                          <p className="text-xs text-gray-400 mt-2">max file size: 2MB each</p>
                        </>
                      ) : (
                        <Loader className="animate-spin h-8 w-8 " />
                      )}
                    </div>
                    <input
                      disabled={fileUploadLoading}
                      name="imageDocumentId"
                      onChange={handleFileUpload}
                      id="upload"
                      type="file"
                      className="hidden"
                    />

                    {files?.map((items) => {
                      return (
                        <div className="mx-auto w-full items-start text-red-400 fotn-normal text-xs">
                          {items.fileName}
                        </div>
                      );
                    })}
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={createCompliance.isPending || fileUploadLoading}
                state={createCompliance.isPending ? "loading" : undefined}
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
          <h6 className="text-[#2E3034] font-bold text-xl">Compliance Result</h6>

          {result?.case && (
            <>
              <div className="flex flex-col space-y-4">
                <span>Status</span>
                <div className="p-4 bg-[#F4FFFC] rounded-full w-max">
                  {result?.case?.status?.replace("_", " ")}
                </div>
              </div>
              <div>
                <p>Suggested Improvements</p>
                <div className="flex flex-col gap-2">
                  {result?.requirements?.map((requirement: any) => (
                    <div
                      key={requirement._id}
                      className="shadow-[0px_2px_4px_0px_#00000040] p-4 rounded-lg border border-black-50 flex flex-col gap-2"
                    >
                      <span className="font-bold">{requirement.name}</span>
                      <span className="text-sm">{requirement.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Button variant="secondary" size="small" iconPosition="chat">
                  Chat with an AI assistant
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

export default CompliancePage;
