"use client";

import AuthLayout from "@/components/layout/auth";
import Button from "@/components/ui/Button";
import { onboardingStepAtom } from "@/lib/atoms/atoms";
import { useAtom } from "jotai";
import { useRef } from "react";
import BusinassInformationForm from "./businassInformationForm";
import PersonalInformationForm from "./personalInformationForm";

const Page = () => {
  const [step, setStep] = useAtom(onboardingStepAtom);
  const personalInfoFormRef = useRef<{ submit: () => void }>(null);

  const isFirstStep = step === 1;
  const isLastStep = step === 2;

  const handleNext = () => {
    if (isFirstStep) {
      // Imperatively submit the form in the child
      personalInfoFormRef.current?.submit();
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (isLastStep) setStep(1);
  };

  const handleSubmit = () => {
    console.log("Form submitted");
  };

  const steps = [
    { id: 1, label: "Personal Information" },
    { id: 2, label: "Business Information" },
  ];

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
              step === id
                ? "border-b-2 border-green text-green font-bold"
                : "text-gray-400"
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="w-full">
        {isFirstStep && <PersonalInformationForm ref={personalInfoFormRef} />}
        {isLastStep && <BusinassInformationForm />}
        <div className="grid md:grid-cols-2 w-full gap-4 mt-4">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={isFirstStep}
          >
            {isFirstStep ? "Skip to Dashboard" : "Back"}
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
