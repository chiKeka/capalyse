"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import Link from "next/link";

type Props = {};

function page({}: Props) {
  return (
    <>
      <AuthLayout
        sub_caption="Your new password should be easy to recall"
        google_signtures={false}
        title="Reset your password"
      >
        <div className="w-full">
          <Input
            name="new_password"
            onChange={() => null}
            type="password"
            label="Enter new password"
            className="h-[43px]"
            placeholder="**********"
            value=""
          />

          <Input
            name="confirm_password"
            onChange={() => null}
            className="h-[43px]"
            type="password"
            label="Confirm password"
            placeholder="**********"
            value=""
          />
          <Button size="medium" variant="primary" className="font-bold w-full">
            Reset Password
          </Button>
          <div className="flex flex-col items-center justify-center my-6">
            <Link
              href={"/signin"}
              className="flex font-bold text-green text-sm text-center items-center"
            >
              Return to login page
            </Link>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

export default page;
