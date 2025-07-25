import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Props = {};

function page({}: Props) {
  return (
    <div>
      <Card className="p-6">
        <div className="flex mb-6 md:mb-10 justify-between items-center">
          <p className="font-bold text-xl ">Compliance Failure</p>
          <Button variant="primary">Change Staus</Button>
        </div>
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 flex gap-6 ">
            <div className="w-full">
              <div className="border rounded-lg border-[#ABD2C7] bg-[#F4FFFC] px-6 py-3 text-center">
                <div>
                  <h6 className="text-[#2E3034] font-semibold text-xl">
                    Make a complaint
                  </h6>
                </div>
              </div>
              <div className="border mt-12 rounded-lg border-[##E8E8E8] min-h-24  px-6 py-3 justify-center flex flex-col text-start">
                <p className="text-xs">Description</p>
                <p className="text-sm">
                  My order was reported unsuccessful but my wallet was debited
                </p>
              </div>
              <div className="border mt-6 rounded-lg border-[##E8E8E8] min-h-24  px-6 py-3 justify-center flex flex-col text-start">
                <p className="text-xs">Document</p>
                <p className="text-sm">No file upload</p>
              </div>
              <div className="border mt-6 rounded-lg border-[##E8E8E8] min-h-24  px-6 py-3 justify-center flex flex-col text-start">
                <p className="text-xs">Activity</p>
                <p className="text-sm"></p>
              </div>
            </div>

            <Separator className="hidden md:block" orientation="vertical" />
          </div>
          <div className="col-span-2">Reports</div>
        </div>
      </Card>
    </div>
  );
}

export default page;
