import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";

type Props = {};

export default function Team({}: Props) {
  return (
    <div className="border-1 flex flex-col w-full rounded-md p-3 md:p-6 ">
      <div className="grid w-full lg:grid-cols-3  lg:max-w-[80%] gap-2 grid-cols-1">
        <Input
          name="name"
          onChange={() => null}
          type="text"
          label="Name"
          className="h-[43px]"
          placeholder="Enter Name "
          value=""
        />
        <Input
          name="email"
          onChange={() => null}
          type="text"
          label="Email"
          className="h-[43px]"
          placeholder="Enter Email"
          value=""
        />
        <Input
          name="role"
          onChange={() => null}
          type="text"
          label="Role"
          className="h-[43px]"
          placeholder="Enter role"
          value=""
        />
      </div>
      <div className="grid w-full lg:grid-cols-3  lg:max-w-[80%] gap-2 grid-cols-1">
        <Input
          name="name"
          onChange={() => null}
          type="text"
          label="Name"
          className="h-[43px]"
          placeholder="Enter Name "
          value=""
        />
        <Input
          name="email"
          onChange={() => null}
          type="text"
          label="Email"
          className="h-[43px]"
          placeholder="Enter Email"
          value=""
        />
        <Input
          name="role"
          onChange={() => null}
          type="text"
          label="Role"
          className="h-[43px]"
          placeholder="Enter role"
          value=""
        />
      </div>
      <div className="flex text-green font-bold text-sm lg:max-w-[82%] mt-8 w-full justify-end lg:flex-row flex-col items-end pr-6">
         Add Section +

      </div>
      <div className="flex lg:max-w-[82%] mt-8 w-full justify-end lg:flex-row flex-col items-end pr-6">
        <Button variant="primary" size="medium" className="w-fit my-4 ">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
