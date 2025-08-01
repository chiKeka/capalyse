"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import { Verify } from "@/components/ui/inputOtp";

type Props = {};

function page({}: Props) {
  return (
    <AuthLayout
      google_signtures={false}
      title="Enter the 6-digit code sent to your mail example@gmail.com"
    >
      <Verify validCode="123456" />
      <div className="mt-10 w-full">
        <Button className="w-full" variant="primary">
          Next
        </Button>
      </div>
      <div className="w-full text-sm mx-auto mt-10 text-center">
        Didn’t receive a mail?{" "}
        <span className="text-green font-bold">Resend</span> in{" "}
        <span className="text-[#DC2626] font-bold">59:00</span>
      </div>
    </AuthLayout>
  );
}

export default page;
