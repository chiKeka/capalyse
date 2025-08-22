"use client";

import Button from "@/components/ui/Button";
import { CIcons } from "@/components/ui/CIcons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useGetSupport, useSupports } from "@/hooks/useSupport";
import { handleImageUpload } from "@/lib/uitils/fns";
import { CreateSupportForm, supportAttachment } from "@/lib/uitils/types";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SupportPage = () => {
  const { createSupport } = useSupports();

  const { data: supportTicket } = useGetSupport();
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [files, setFiles] = useState<supportAttachment[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateSupportForm>();

  const onSubmit = ({ category, description }: CreateSupportForm) => {
    createSupport
      .mutateAsync({
        subject: category,
        file: files,
        description,
        category,
      })
      .then(() => {
        toast.success("Ticket submitted successfully");
      });
  };
  const handleFileUpload = async (e: any) => {
    if (e) setFileUploadLoading(true);
    const file = e.target.files[0];
    const fileUrl = await handleImageUpload(file, (res: any) => {
      console.log({ res });
      setFiles([
        {
          fileName: res?.original_filename,
          fileUrl: res?.secure_url,
          fileSize: res?.bytes,
          mimeType: res?.format,
        },
      ]);
      setFileUploadLoading(false);
    });
  };
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50">
      <Card className="grid gap-8 md:grid-cols-2 p-6">
        {/* Make a Complaint Form */}
        <div className="flex gap-6">
          <div className="space-y-6 pb-6">
            <div className="border rounded-lg border-[#ABD2C7] bg-[#F4FFFC] px-6 py-3 text-center">
              <div>
                <h6 className="text-[#2E3034] font-semibold text-xl">
                  Make a complaint
                </h6>
                <div className="text-[#36394D] text-sm">
                  Please fill out the following form with your complaint. We
                  will review your request and follow up with you as soon as
                  possible.
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Complaint</Label>
                <Select onValueChange={(val) => setValue("category", val)}>
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder="Select Reason"
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Inquiry</SelectItem>
                    <SelectItem value="account">Service Quality</SelectItem>
                    <SelectItem value="feature_request">
                      Features Request
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <span className="col-span-2 text-[10px] text-red-500">
                    {errors.category.message}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
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
                  Upload Relevant Pictures or Document (Optional)
                </Label>
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor="upload"
                    className="flex flex-col items-center justify-center w-full h-[5.0625rem] border-2 border-dashed border-green cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {!fileUploadLoading ? (
                        <>
                          <CIcons.documentUpload />

                          <p className="mb-2 text-sm text-[#52575C]">
                            Click to add image/Video
                          </p>
                        </>
                      ) : (
                        <Loader className="animate-spin h-8 w-8 " />
                      )}
                    </div>
                    <Input
                      disabled={fileUploadLoading}
                      name="supportFile"
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
                disabled={createSupport.isPending || fileUploadLoading}
                state={createSupport.isPending ? "loading" : undefined}
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
        <div className="space-y-6">
          <h6 className="text-[#2E3034] font-bold text-xl">Dispute History</h6>
          {supportTicket?.tickets.length > 0 ? (
            <div className="space-y-6">
              {supportTicket?.tickets?.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-start gap-2">
                    <CIcons.messageMinus />
                    <div>
                      <p className="text-sm">
                        <strong>Ticket No:</strong>
                        <span>{item?.id.slice(0, -8) + "..."}</span>
                      </p>
                      <p className=" text-[#9EA5B1] text-sm">{item?.subject}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge
                      variant={
                        item.status as
                          | "resolved"
                          | "in_progress"
                          | "open"
                          | "closed"
                      }
                      className="capitalize mb-2"
                    >
                      {item.status.replace(/([A-Z])/g, " $1")}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {item.date} {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="p-4 bg-[#F4FFFC] rounded-full w-[67.44px] h-[67.44px]">
                <CIcons.carbonReport />
              </div>
              <p className="font-semibold text-lg">No disputes raised yet</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SupportPage;
