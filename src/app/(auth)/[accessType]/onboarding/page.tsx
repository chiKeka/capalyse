"use client";

import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import { authAtom, onboardingStepAtom } from "@/lib/atoms/atoms";
import { routes } from "@/lib/routes";
import { getKeyByValue } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BusinassInformationForm from "./businassInformationForm";
const PersonalInformationForm = dynamic(
  () => import("./personalInformationForm"),
  {
    ssr: false,
  }
);
const Page = () => {
  const router = useRouter();
  const authState: any = useAtomValue(authAtom);
  const [step] = useAtom(onboardingStepAtom);
  const [personalLoading, setPersonalLoading] = useState(false);
  const [smeLoading, setSmeLoading] = useState(false);
  const personalInfoFormRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);
  const smeBusinessInfoFormRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);
  const isFirstStep = step === 1;
  const isLastStep = step === 2;

  console.log({
    personal: personalInfoFormRef?.current?.isLoading,
    smeLoading: smeBusinessInfoFormRef?.current?.isLoading,
  });
  const handleNext = () => {
    if (authState?.profileCompletionStep === 1) {
      personalInfoFormRef.current?.submit();
    } else {
      smeBusinessInfoFormRef.current?.submit();
    }
  };

  const steps = [
    { id: 1, label: "Personal Information" },
    { id: 2, label: "Business Information" },
  ];

  useEffect(() => {
    if (authState?.profileCompletionStep === 2) {
      setPersonalLoading(false);
    }
    if (authState?.profileCompletionStep === 1) {
      setSmeLoading(false);
    }
  }, [authState?.profileCompletionStep]);
  return (
    <AuthLayout
      layoutSize="lg:max-w-4xl"
      inputFieldSize="max-w-3xl"
      google_signtures={false}
      title="Complete the following information to get started"
    >
      <div className="flex w-full border-b border-[#F0F0F0] items-center justify-center mb-6 space-x-12">
        {steps.map(({ id, label }) => (
          <div
            key={id}
            className={`text-center py-2 text-xs cursor-pointer ${
              authState?.profileCompletionStep === id
                ? "border-b-2 border-green text-green font-bold"
                : "text-gray-400"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="w-full">
        {authState?.profileCompletionStep === 1 ? (
          <PersonalInformationForm
            ref={personalInfoFormRef}
            setLoading={setPersonalLoading}
          />
        ) : null}
        {authState?.profileCompletionStep === 2 && (
          <BusinassInformationForm
            ref={smeBusinessInfoFormRef}
            setLoading={setSmeLoading}
          />
        )}
        <div className="grid md:grid-cols-2 w-full gap-4 mt-4">
          <Button
            variant="secondary"
            onClick={() =>
              isFirstStep
                ? router?.push(
                    routes?.[
                      getKeyByValue(
                        UserType,
                        authState?.role
                      ) as keyof typeof routes
                    ]?.root
                  )
                : null
            }
          >
            {isFirstStep ? "Skip to Dashboard" : "Back"}
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            state={personalLoading || smeLoading ? "loading" : undefined}
          >
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
