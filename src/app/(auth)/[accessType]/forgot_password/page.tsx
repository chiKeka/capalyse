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
        sub_caption="No Worries! Input the email associated with your password to reset your password"
        google_signtures={false}
        title="Create your account"
      >
        <div className="w-full">
          <Input
            name="email"
            onChange={() => null}
            type="email"
            label="Email"
            className="h-[43px]"
            placeholder="janeearnest@gmail.com"
            value=""
          />

          <Button size="medium" variant="primary" className="font-bold w-full">
            Get link
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
