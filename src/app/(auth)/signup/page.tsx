"use client";
import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Inputs";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import React, { useState } from "react";

type Props = {};

export default function SignupPage() {
  const { registerMutation } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(form);
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

          <Input
            name="password"
            onChange={handleChange}
            className="h-[43px]"
            type="password"
            label="Password"
            placeholder="**********"
            value={form.password}
          />
          <Button
            type="submit"
            size="medium"
            variant="primary"
            className="font-bold w-full"
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
