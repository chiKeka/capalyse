import Input from "@/components/ui/Inputs";

type Props = {};

export default function BusinassInformationForm({}: Props) {
  return (
    <div className="grid md:grid-cols-2 w-full gap-4">
      <Input
        className=""
        label="Business Name"
        placeholder="Input business name"
        value=""
        type="text"
        name="bname"
        onChange={() => null}
      />
      <Input
        className=""
        label="Business registration number"
        placeholder="Earnest"
        value=""
        type="text"
        name="rname"
        onChange={() => null}
      />
      <Input
        className=""
        label="Country of operation"
        placeholder="Select your country"
        value=""
        type="text"
        name="country"
        onChange={() => null}
      />
      <Input
        className=""
        label="business stage"
        placeholder="select business stage"
        value=""
        type="email"
        name="bstage"
        onChange={() => null}
      />
      <Input
        className=""
        label="Industry (Optional)"
        placeholder="select Industry"
        value=""
        type="text"
        name="industry"
        onChange={() => null}
      />
      <Input
        className=""
        label="Business website (Optional)"
        placeholder="Input your website link"
        value=""
        type="text"
        name="website"
        onChange={() => null}
      />
    </div>
  );
}
