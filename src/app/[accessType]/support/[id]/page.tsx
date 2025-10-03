import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {};

function SupportDetailsPage({}: Props) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/50">
      <h6 className="text-[#2E3034] font-bold text-xl">Make a complaint</h6>
      <Card className="grid gap-8 md:grid-cols-2 p-6">
        {/* Make a Complaint Form */}
        <div className="flex gap-6">
          <div className="space-y-6 pb-6">
            <div className="border rounded-lg border-[#ABD2C7] bg-[#F4FFFC] px-6 py-3 text-center">
              <div className="grid  grid-cols-2 w-full gap-4 lg:grid-cols-4">
                <div className="text-[#36394D] text-start text-sm">
                  <p className="font-bold">Ticket No</p>
                  <p>SP-34559866</p>
                </div>
                <div className="text-[#36394D] text-start text-sm">
                  <p className="font-bold">Date</p>
                  <p>Jan 23, 2022</p>
                </div>
                <div className="text-[#36394D] text-start text-sm">
                  inProgress
                </div>
              </div>
            </div>
            <div className="border min-h-20 rounded-lg px-6 py-3 items- justify-center flex flex-col">
              <p className="text-xs font-normal">Description</p>
              <p className="text-sm font-normal">
                My order was reported unsuccessful but my wallet was debited
              </p>
            </div>

            <div className="border min-h-30 rounded-lg  px-6 py-3 text-center">
              <div className="text-[#36394D] text-start text-sm">
                inProgress
              </div>
            </div>
          </div>
          <Separator className="hidden md:block" orientation="vertical" />
        </div>

        {/* Dispute History */}
        <div className="space-y-6">
          <h6 className="text-[#2E3034] font-bold text-xl">Dispute History</h6>
        </div>
      </Card>
    </div>
  );
}

export default SupportDetailsPage;
