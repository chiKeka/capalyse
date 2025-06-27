import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";

type Props = {};

export default function Document({}: Props) {
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6 ">
      <div className="flex flex-col w-full gap-x-6 lg:flex-row">
        <div className="grid w-full lg:grid-cols-2 gap-2 grid-cols-1">
          <Input
            name="Bname"
            onChange={() => null}
            type="text"
            label="Business Name"
            className="h-[43px]"
            placeholder="Input Business name "
            value=""
          />
          <Input
            name="B_reg_no"
            onChange={() => null}
            type="text"
            label="Business Registration Number"
            className="h-[43px]"
            placeholder="Input registration number "
            value=""
          />
          <Input
            name="country"
            onChange={() => null}
            type="text"
            label="Country of Operation"
            className="h-[43px]"
            placeholder="John"
            value=""
          />
          <Input
            name="Bname"
            onChange={() => null}
            type="text"
            label="Business Name"
            className="h-[43px]"
            placeholder="John"
            value=""
          />
          <Input
            name="Bname"
            onChange={() => null}
            type="text"
            label="Business Name"
            className="h-[43px]"
            placeholder="John"
            value=""
          />
          <Input
            name="website"
            onChange={() => null}
            type="text"
            label="Business Website"
            className="h-[43px]"
            placeholder="Input your website link"
            value=""
          />
        </div>

        <div className="w-full flex flex-col gap-4 items-center  max-w-44 p-2">
          <p className="text-[10px] font-bold text-[#2E3034]">
            Upload Business logo
          </p>
          <div className="w-full border-1 boeder-[#ABD2C7] flex flex-col  items-center justify-center gap-2 border-dashed h-20 rounded-md">
            <img src={"/icons/upload2.svg"} />
            <p className="text-[#52575C] font-normal text-xs">
              Click to add logo
            </p>
          </div>
        </div>
      </div>
      <div className="flex lg:max-w-[83%] mt-8 w-full justify-between lg:flex-row flex-col items-center pr-6">
        <div className="py-3 px-5 my-6 rounded-[40px] items-center gap-2 w-full max-w-130 bg-[#F4FFFC] inline-flex font-normal text-xs text-[#062039]">
          <img src={"/icons/circle_warning.svg"} /> PS: Changes made to your
          profile will be subject to verification
        </div>
        <Button variant="primary" size="medium" className="w-fit my-4 ">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
