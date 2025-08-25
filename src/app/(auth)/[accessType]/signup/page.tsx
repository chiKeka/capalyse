"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import PasswordChecker from "@/components/ui/passwordChecker";
import { authAtom } from "@/lib/atoms/atoms";
import { authClient } from "@/lib/auth-client";
import { validateAuthForm } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import { useSetAtom } from "jotai";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
export default function SignupPage() {
  const param = useParams();
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    roles: UserType[param?.accessType as keyof typeof UserType],
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    name?: string;
  }>({});
  const setAuth = useSetAtom(authAtom);
  const router = useRouter();
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAuthForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    authClient.signUp.email(
      {
        ...form,
        name: form.name || form.email.split("@")[0],
        roles: form.roles,
        profileCompletionStep: 0,
      },

      {
        onRequest: (ctx) => {
          setIsLoading(true);
        },
        onSuccess: (ctx) => {
          setIsLoading(false);
          router.push(`/verify?email=${form.email}`);
          toast.success("Email sent successfully");
        },
        onError: (ctx) => {
          setIsLoading(false);
          toast.error(ctx.error.message);
        },
      }
    );
  };

  return (
    <>
      <AuthLayout google_signtures={true} title="Create your account">
        <form onSubmit={handleSubmit} className="w-full">
          <Input
            name="name"
            onChange={handleChange}
            type="text"
            label="Enter Name"
            className="h-[43px]"
            placeholder="Enter Name"
            value={form.name}
          />
          {errors.email && (
            <div className="text-red-500 text-xs mt-1">{errors.name}</div>
          )}
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
            disabled={isLoading}
            type="submit"
            size="medium"
            variant="primary"
            className="font-bold w-full"
            state={isLoading ? "loading" : "default"}
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
