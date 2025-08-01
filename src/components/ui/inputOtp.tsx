import { redirect } from "next/navigation";
import { unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui";
import * as React from "react";

export function Verify({ validCode }: { validCode: string }) {
  const [value, setValue] = React.useState("");
  const PASSWORD_LENGTH = 6;
  function handleSubmit() {
    if (value === validCode) {
      redirect("/authenticated");
    } else {
      window.alert("Invalid code");
    }
  }
  return (
    <OneTimePasswordField.Root
      autoSubmit
      value={value}
      onAutoSubmit={handleSubmit}
      onValueChange={setValue}
      className="flex gap-2 justify-between w-full mx-auto mt-10"
    >
      {Array.from({ length: PASSWORD_LENGTH }, (_, i) => (
        <OneTimePasswordField.Input
          key={i}
          className="w-10 h-11 rounded-[4px] text-black font-bold text-center border-[#D8E1F8] border shadow-sm shadow-[#1018280D]/10 bg-transparent"
        />
      ))}
    </OneTimePasswordField.Root>
  );
}
