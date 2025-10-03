'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChevronDown, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useGetSingleTicket,
  useSupportTicketMutations,
} from '@/hooks/useSupport';
import { format } from 'date-fns';

type Props = {};

const statuses = [
  {
    name: 'Processing',
    key: 'in_progress',
  },
  {
    name: 'Resolved',
    key: 'resolved',
  },
  ,
  {
    name: 'Unresolved',
    key: 'closed',
  },
];

function Page({}: Props) {
  const params = useParams();
  const ticketId = params.id as string;
  const [selectedStatus, setSelectedStatus] = useState('Unresolved');

  const { data: ticketData, isLoading: ticketLoading } =
    useGetSingleTicket(ticketId);
  const { updateTicket, submitSupportMessage } = useSupportTicketMutations();
  console.log({ ticketData });

  // Mock data for demonstration - replace with actual data from API
  const disputeHistory = useMemo(() => {
    const history = [
      {
        stage: 'Dispute Raised',
        timestamp: ticketData?.ticket?.createdAt
          ? format(
              new Date(ticketData?.ticket?.createdAt),
              'MMM d, yyyy, hh:mm a'
            )
          : undefined,
        status: 'completed',
      },
      {
        stage: 'Resolution in progress',
        timestamp:
          ticketData?.messages?.length > 0
            ? format(
                new Date(ticketData?.messages?.[0]?.createdAt),
                'MMM d, yyyy, hh:mm a'
              )
            : undefined,
        status: 'in_progress',
      },
      {
        stage: 'Resolved',
        timestamp: ticketData?.ticket?.resolvedAt
          ? format(
              new Date(ticketData?.ticket?.resolvedAt),
              'MMM d, yyyy, hh:mm a'
            )
          : undefined,
        status: 'completed',
      },
    ];
    return history.filter((item) => item.timestamp !== undefined);
  }, [ticketData?.ticket, ticketData?.messages]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    // Here you would typically make an API call to update the status
    console.log('Status changed to:', status);
    updateTicket.mutate({ id: ticketId, rest: { status } });
    const message =
      status === 'in_progress'
        ? 'You ticket has been picked up for Processing'
        : status === 'resolved'
        ? 'You ticket has been marked as Resolved'
        : 'You ticket has been marked as Unresolved';
    submitSupportMessage.mutate({ id: ticketId, rest: { message } });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-red-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTimelineIconColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  if (ticketLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card className="p-6">
        <div className="flex mb-6 md:mb-10 justify-between items-center">
          <h1 className="font-bold text-2xl text-[#18181B] capitalize">
            {ticketData?.ticket?.subject?.replace(/_/g, ' ')}
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={
                  updateTicket?.isPending || submitSupportMessage?.isPending
                }
                variant="primary"
                className="flex items-center gap-2"
              >
                {(updateTicket?.isPending ||
                  submitSupportMessage?.isPending) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Change Status
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
              {statuses.map((status) => (
                <DropdownMenuItem
                  key={status?.key}
                  onClick={() => handleStatusChange(status?.key || '')}
                  disabled={ticketData?.ticket?.status === status?.key}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {status?.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Summary Card */}
            <div className="border rounded-lg border-[#ABD2C7] bg-[#F4FFFC] px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Ticket No</p>
                  <p className="font-semibold text-[#2E3034]">
                    {ticketData?.ticket?.id}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Transaction Date</p>
                  <p className="font-semibold text-[#2E3034]">
                    {ticketData?.ticket?.createdAt
                      ? format(
                          new Date(ticketData?.ticket?.createdAt),
                          'MMM d, yyyy, hh:mm a'
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end mt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      ticketData?.ticket?.status
                    )}`}
                  ></div>
                  <span className="text-sm font-medium text-[#2E3034]">
                    {ticketData?.ticket?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="border rounded-lg border-[#E8E8E8] px-6 py-4">
              <h3 className="font-bold text-[#2E3034] mb-3">Description</h3>
              <p className="text-sm text-gray-700">
                {ticketData?.ticket?.description}
              </p>
            </div>

            {/* Document Card */}
            <div className="border rounded-lg border-[#E8E8E8] px-6 py-4">
              <h3 className="font-bold text-[#2E3034] mb-3">Document</h3>
              <p className="text-sm text-gray-700">
                {ticketData?.ticket?.images?.map((image: any) => (
                  <div key={image}>
                    <a href={image} target="_blank">
                      Click to view
                      <div className="bg-black w-20 h-20 rounded-md overflow-hidden border border-[#E8E8E8]">
                        <img
                          src={image}
                          alt="Document"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    </a>
                  </div>
                ))}
              </p>
            </div>

            {/* Activity Card */}
            <div className="border rounded-lg border-[#E8E8E8] px-6 py-4">
              <h3 className="font-bold text-[#2E3034] mb-3">Activity</h3>
              <p className="text-sm text-gray-700 space-y-4 divide-y-2">
                {ticketData?.messages?.map((message: any) => (
                  <div key={message?.id}>
                    <p>{message?.message}</p>
                    <p>{format(new Date(message?.createdAt), 'MMM d, yyyy')}</p>
                    <p>By {message?.sender?.name}</p>
                  </div>
                ))}
              </p>
            </div>
          </div>

          {/* Right Column - Dispute History */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg border-[#E8E8E8] px-6 py-4">
              <h3 className="font-bold text-[#2E3034] mb-6">Dispute History</h3>

              <div className="space-y-6">
                {disputeHistory.map((item, index) => (
                  <div key={index} className="relative">
                    {/* Timeline line */}
                    {index < disputeHistory.length - 1 && (
                      <div className="absolute left-3 top-8 w-0.5 h-12 bg-gray-200 border-l-2 border-dashed"></div>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Timeline icon */}
                      <div
                        className={`w-6 h-6 rounded-full ${getTimelineIconColor(
                          item.status
                        )} flex items-center justify-center relative z-10`}
                      >
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      </div>

                      {/* Timeline content */}
                      <div className="flex-1">
                        <p className="font-medium text-[#2E3034] text-sm">
                          {item.stage}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Page;
