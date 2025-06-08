import Input from "@/components/ui/Inputs";

type Props = {};

export default function PersonalInformationForm({}: Props) {
  return (
    <div className="grid md:grid-cols-2 w-full gap-4">
      <Input
        className=""
        label="First Name*"
        placeholder="Jane"
        value=""
        type="text"
        name="fname"
        onChange={() => null}
      />
      <Input
        className=""
        label="Last Name*"
        placeholder="Earnest"
        value=""
        type="text"
        name="lname"
        onChange={() => null}
      />
      <Input
        className=""
        label="Phone Number*"
        placeholder="(+234) 8164763794"
        value=""
        type="phone"
        name="phone"
        onChange={() => null}
      />
      <Input
        className=""
        label="Email Address*"
        placeholder="Janeearnest@gmail.com"
        value=""
        type="email"
        name="email"
        onChange={() => null}
      />
      <Input
        className=""
        label="Country Of Residence"
        placeholder="select your country of residence"
        value=""
        type="text"
        name="country"
        onChange={() => null}
      />
      <Input
        className=""
        label="State of residence"
        placeholder="select your state of residence"
        value=""
        type="text"
        name="state"
        onChange={() => null}
      />
    </div>
  );
}
