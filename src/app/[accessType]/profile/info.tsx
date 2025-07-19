import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { useGetCurrentProfile } from "@/hooks/useProfileManagement";
import { useState } from "react";

type Props = {};

export default function Info({}: Props) {
  const ProfileDetails = useGetCurrentProfile();
  const [form, setForm] = useState({
    businessName: "",
    countryOfOperation: "",
    businessStage: "SME",
    industry: "",
    website: "",
  });

  const { data: user, isLoading, error } = ProfileDetails;
  console.log(user);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6 ">
      <div className="flex flex-col w-full gap-x-6 lg:flex-row">
        <form className="grid w-full lg:grid-cols-2 gap-2 grid-cols-1">
          <Input
            name="Bname"
            onChange={() => null}
            type="text"
            value={user?.businessName}
            label="Business Name"
            className="h-[43px]"
            placeholder={
              user?.businessName ? user?.businessName : "Input Business name"
            }
          />
          <Input
            name="B_reg_no"
            onChange={() => null}
            type="text"
            label="Business Registration Number"
            className="h-[43px]"
            placeholder={user?.businessn}
            value=""
          />
          <Input
            name="country"
            onChange={() => null}
            type="text"
            label="Country of Operation"
            className="h-[43px]"
            placeholder={
              user?.countryOfOperation
                ? user?.countryOfOperation[0]
                : "Select country"
            }
          />
          <Input
            name="Bstage"
            onChange={() => null}
            type="text"
            label="Business Stage"
            className="h-[43px]"
            placeholder={
              user?.businessStage
                ? user?.businessStage
                : "Select Business Stage"
            }
            value=""
          />
          <Input
            name="industry"
            onChange={() => null}
            type="text"
            label="Industry"
            className="h-[43px]"
            placeholder=""
            value=""
          />
          <Input
            name="website"
            onChange={() => null}
            type="text"
            label="Business Website"
            className="h-[43px]"
            placeholder={
              user?.website ? user?.website : "Input your website link"
            }
            value=""
          />
        </form>

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
