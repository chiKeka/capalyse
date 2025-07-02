'use client';

import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { CIcons } from '@/components/ui/CIcons';
import { Badge } from '@/components/ui/badge';

const disputeHistory = [
  {
    ticket: '15235GT',
    issue: 'Upload Issue',
    status: 'unresolved',
    date: '03 August 2023',
    time: '09:17pm',
  },
  {
    ticket: '15235GT',
    issue: 'Upload Issue',
    status: 'inProgress',
    date: '03 August 2023',
    time: '09:17pm',
  },
  {
    ticket: '15235GT',
    issue: 'Upload Issue',
    status: 'resolved',
    date: '03 August 2023',
    time: '09:17pm',
  },
];

const SupportPage = () => {
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
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Complaint</Label>
                <Select>
                  <SelectTrigger id="reason">
                    <SelectValue
                      placeholder="Select Reason"
                      className="placeholder:text-[#D1D1D1]"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Inquiry</SelectItem>
                    <SelectItem value="service">Service Quality</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter Message"
                  className="min-h-[120px]"
                />
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
                      <CIcons.documentUpload />
                      <p className="mb-2 text-sm text-[#52575C]">
                        Click to add image/Video
                      </p>
                    </div>
                    <Input id="upload" type="file" className="hidden" />
                  </Label>
                </div>
              </div>

              <Button size="big" className="w-full">
                Submit
              </Button>
            </div>
          </div>
          <Separator orientation="vertical" />
        </div>

        {/* Dispute History */}
        <div className="space-y-6">
          <h6 className="text-[#2E3034] font-bold text-xl">Dispute History</h6>
          {disputeHistory.length > 0 ? (
            <div className="space-y-6">
              {disputeHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-start gap-2">
                    <CIcons.messageMinus />
                    <div>
                      <p className="text-sm">
                        <strong>Ticket No:</strong> <span>{item.ticket}</span>
                      </p>
                      <p className=" text-[#9EA5B1] text-sm">{item.issue}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge
                      variant={
                        item.status as 'resolved' | 'inProgress' | 'unresolved'
                      }
                      className="capitalize mb-2"
                    >
                      {item.status.replace(/([A-Z])/g, ' $1')}
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
