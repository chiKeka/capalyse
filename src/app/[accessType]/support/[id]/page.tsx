"use client";

import { Card } from "@/components/ui/card";
import { CIcons } from "@/components/ui/CIcons";
import { Separator } from "@/components/ui/separator";
import { useGetSingleTicket } from "@/hooks/useSupport";
import { format } from "date-fns";
import { useParams } from "next/navigation";
import { useState } from "react";

type Props = {};

function SupportDetailsPage({}: Props) {
  const params = useParams();
  const ticketId = params.id as string;
  const { data: ticketData } = useGetSingleTicket(ticketId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleViewDocument = (document: string) => {
    setSelectedImage(document);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50">
      <h6 className="text-[#2E3034] font-bold text-xl">Make a complaint</h6>
      <Card className="grid gap-8 w-full md:grid-cols-[1.7fr_1.3fr] p-6">
        {/* Make a Complaint Form */}
        <div className="flex gap-6 w-full">
          <div className="space-y-6 w-full pb-6">
            <div className="border rounded-lg border-[#ABD2C7] bg-[#F4FFFC] px-6 py-3 text-center">
              <div className="grid w-full gap-4 items-center lg:grid-cols-[2fr_1.5fr_1fr]">
                <div className="text-[#36394D] text-start text-sm">
                  <p className="font-bold">Ticket No</p>
                  <p>{ticketData?.ticket?.id}</p>
                </div>
                <div className="text-[#36394D] text-start text-sm">
                  <p className="font-bold">Date</p>
                  <p>
                    {ticketData?.ticket?.createdAt
                      ? format(
                          new Date(ticketData?.ticket?.createdAt),
                          "MMM d, yyyy"
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="text-[#36394D] text-start text-sm">
                  {ticketData?.ticket?.status}
                </div>
              </div>
            </div>
            <div className="border min-h-20 rounded-lg px-6 py-3 items- justify-center flex flex-col">
              <p className="text-xs font-normal">Description</p>
              <p className="text-sm font-normal">
                {ticketData?.ticket?.description}
              </p>
            </div>

            <div className="border min-h-30 rounded-lg px-6 py-3">
              <p className="text-sm font-bold mb-4">Documents</p>
              <div className="space-y-3">
                {ticketData?.ticket?.images?.map(
                  (image: any, index: number) => (
                    <div
                      key={image}
                      className="flex items-center gap-4 p-3 border border-[#E8E8E8] rounded-lg"
                    >
                      <div className="w-10 h-10 bg-[#F4FFFC] rounded-full flex items-center justify-center">
                        <CIcons.document />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          IMG-{String(index + 1).padStart(5, "0")}.PNG
                        </p>
                        <p className="text-xs text-gray-500">200 KB</p>
                      </div>
                      <button
                        onClick={() => handleViewDocument(image)}
                        className="text-sm text-[#16B679] hover:text-green-700 font-medium cursor-pointer"
                      >
                        View Image
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <Separator className="hidden md:block" orientation="vertical" />
        </div>

        {/* Dispute History */}
        <div className="space-y-6">
          <h6 className="text-[#2E3034] font-bold text-xl">Dispute History</h6>
          <div className="flex items-center gap-4">
            <CIcons.indicator />
            <div>
              <p className="text-sm font-bold">Dispute Raised</p>
              <span className="text-xs font-normal">
                {ticketData?.ticket?.createdAt
                  ? format(
                      new Date(ticketData?.ticket?.createdAt),
                      "MMM d, yyyy, hh:mm a"
                    )
                  : "N/A"}{" "}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">View Document</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={selectedImage}
                alt="Document"
                className="max-w-full max-h-[70vh] object-contain mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/placeholder.png"; // fallback image
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportDetailsPage;
