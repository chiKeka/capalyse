"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import Link from "next/link";

type Props = {};

function page({}: Props) {
  return (
    <>
      <AuthLayout google_signtures={true} title="Create your account">
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

          <Input
            name="password"
            onChange={() => null}
            className="h-[43px]"
            type="password"
            label="Password"
            placeholder="**********"
            value=""
          />
          <Button size="medium" variant="primary" className="font-bold w-full">
            Create Account
          </Button>
          <div className="flex flex-col items-center justify-center my-6">
            <p className="flex font-normal text-sm text-center items-center">
              Already have an account ?.
              <Link href="/signin" className=" font-bold text-sm text-green">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    </>
  );
}

export default page;
