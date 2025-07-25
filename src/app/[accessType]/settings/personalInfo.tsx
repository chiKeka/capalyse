import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";

type Props = {};

function PersonalInfo({}: Props) {
  return (
    <div className="border-1 rounded-md p-3 md:p-6 ">
      <form className="md:px-6 px-2 pb-12 w-full max-w-150">
        <Input
          name="Fname"
          onChange={() => null}
          type="text"
          label="First Name"
          className="h-[43px]"
          placeholder="John"
          value=""
        />
        <Input
          name="Lname"
          onChange={() => null}
          type="email"
          label="Last Name"
          className="h-[43px]"
          placeholder="Doe"
          value=""
        />
        <Input
          name="Phone"
          onChange={() => null}
          type="phone"
          label="Phone Number"
          className="h-[43px]"
          placeholder="+1234567890"
          value=""
        />
        <Input
          name="Email"
          onChange={() => null}
          type="email"
          label="Email Address"
          className="h-[43px]"
          placeholder="johndoe@gmail.com"
          value=""
        />

        <Button variant="primary" size="medium" className="w-full my-4 ">
          Submit
        </Button>
        <div className="py-3 px-5 my-6 rounded-[40px] items-center gap-2 w-full bg-[#F4FFFC] inline-flex font-normal text-xs text-[#062039]">
          <img src={"/icons/circle_warning.svg"} /> PS: Changes made to your profile
          will be subject to verification
        </div>
      </form>
      <hr className="h-[1px] bg-[] " />
      <div className="md:px-6 px-2 mt-12 max-w-150">
        <Button variant="secondary" size="medium" className="w-full">
          Delete Account
        </Button>
      </div>
    </div>
  );
}

export default PersonalInfo;
