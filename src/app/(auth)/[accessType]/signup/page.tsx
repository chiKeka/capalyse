"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import PasswordChecker from "@/components/ui/passwordChecker";
import { useAuth } from "@/hooks/useAuth";
import { authAtom } from "@/lib/atoms/atoms";
import { validateAuthForm } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import { useSetAtom } from "jotai";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
export default function SignupPage() {
  const param = useParams();
  const { registerMutation } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", role: "SME" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const setAuth = useSetAtom(authAtom);
  const router = useRouter();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAuthForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    registerMutation
      .mutateAsync({
        ...form,
        role: UserType[param?.accessType as keyof typeof UserType],
      })
      .then((res) => {
        const { token, refreshToken: newRefreshToken, user } = res?.data?.data;
        setAuth(user);
        console.log({ user });
        Cookies.set("access_token", token);
        Cookies.set("refresh_token", newRefreshToken);
        Cookies.set(
          "token_exp",
          Math.floor(Date.now() / 1000) + jwtDecode(token)?.exp!.toString()
        );
        localStorage.setItem("onBoardignData", JSON.stringify(res?.data));
        // const rootRoute = getKeyByValue(UserType, user?.role);
        router.push(`/verify?email=${form.email}`);
      })
      .catch((err) => {
        console.log({ err });
        toast.error(err.error);
      });
  };

  return (
    <>
      <AuthLayout google_signtures={true} title="Create your account">
        <form onSubmit={handleSubmit} className="w-full">
          <Input
            name="email"
            onChange={handleChange}
            type="email"
            label="Email"
            className="h-[43px]"
            placeholder="janeearnest@gmail.com"
            value={form.email}
          />
          {errors.email && (
            <div className="text-red-500 text-xs mt-1">{errors.email}</div>
          )}

          <Input
            name="password"
            onChange={handleChange}
            className="h-[43px]"
            type="password"
            label="Password"
            placeholder="**********"
            value={form.password}
          />
          {form.password && <PasswordChecker password={form.password} />}
          {errors.password && (
            <div className="text-red-500 text-xs -mt-1 mb-1">
              {errors.password}
            </div>
          )}
          <Button
            disabled={registerMutation?.isPending}
            type="submit"
            size="medium"
            variant="primary"
            className="font-bold w-full"
            state={registerMutation?.isPending ? "loading" : "default"}
          >
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
        </form>
      </AuthLayout>
    </>
  );
}
