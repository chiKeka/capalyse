"use client";

import AuthLayout from "@/components/layout/auth";
import AssessmentReadiness from "@/components/sections/ReadinessAssessment";
import Button from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { authAtom, onboardingStepAtom } from "@/lib/atoms/atoms";
import { routes } from "@/lib/routes";
import { getKeyByValue } from "@/lib/uitils/fns";
import { UserType } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BusinassInformationForm from "./businassInformationForm";
import DevelopmentOrganisation from "./developmentOrganisation";
import InvestmentPreference from "./investmesntPrefernce";
import InvestorOrganisation from "./investorOrganisation";

const PersonalInformationForm = dynamic(
  () => import("./personalInformationForm"),
  {
    ssr: false,
  }
);
const Page = () => {
  const router = useRouter();
  const authState: any = useAtomValue(authAtom);
  const [onboardSteps] = useAtom(onboardingStepAtom);

  const personalInfoFormRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);
  const smeBusinessInfoFormRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);
  const investmentPreferenceRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);
  const investorOrganisationRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);
  const developmentOrganisationRef = useRef<{
    submit: () => void;
    isLoading: boolean;
  }>(null);

  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const isFirstStep = onboardSteps === 1;
  const isSecond = onboardSteps === 2;
  const isThirdStep = onboardSteps === 3;

  const handleNext = async () => {
    setButtonLoading(true);
    const role = authState?.role?.toLowerCase();
    const step = authState?.profileCompletionStep;
    let valid = true;
    if (role === "investor") {
      if (step === 1) {
        valid = (await personalInfoFormRef.current?.submit()) ?? false;
      } else if (step === 2) {
        valid = (await investmentPreferenceRef.current?.submit()) ?? false;
      } else if (step === 3) {
        valid = (await investorOrganisationRef.current?.submit()) ?? false;
      }
    } else if (role === "sme") {
      if (step === 1) {
        valid = (await personalInfoFormRef.current?.submit()) ?? false;
      } else if (step === 2) {
        valid = (await smeBusinessInfoFormRef.current?.submit()) ?? false;
      }
    } else if (role === "developmentorg") {
      if (step === 1) {
        valid = (await developmentOrganisationRef.current?.submit()) ?? false;
      }
    }
    if (!valid) {
      setButtonLoading(false);
      return;
    }
    // Only proceed if valid (if you have additional logic, add here)
  };

  useEffect(() => {
    setButtonLoading(false); // Reset button loading on step change
    setLoading(false); // (optional) Reset other loading state too
  }, [authState?.profileCompletionStep]);

  const steps = {
    sme: [
      { id: 1, label: "Personal Information" },
      { id: 2, label: "Business Information" },
    ],
    investor: [
      { id: 1, label: "Personal Information" },
      { id: 2, label: "Investment Preference" },
      { id: 3, label: "Organisation Profile" },
    ],
    developmentorg: [{ id: 1, label: "" }],
  };

  const roleFormMap = {
    sme: (
      <>
        {authState?.profileCompletionStep === 1 && (
          <PersonalInformationForm
            ref={personalInfoFormRef}
            setLoading={setLoading}
            onFinish={() => setButtonLoading(false)}
          />
        )}
        {authState?.profileCompletionStep === 2 && (
          <BusinassInformationForm
            ref={smeBusinessInfoFormRef}
            setLoading={setLoading}
            onFinish={() => setButtonLoading(false)}
            onSuccess={() => setShowSuccessDialog(true)}
          />
        )}
      </>
    ),
    investor: (
      <>
        {authState?.profileCompletionStep === 1 && (
          <PersonalInformationForm
            ref={personalInfoFormRef}
            setLoading={setLoading}
            onFinish={() => setButtonLoading(false)}
          />
        )}
        {authState?.profileCompletionStep === 2 && (
          <InvestmentPreference
            ref={investmentPreferenceRef}
            setLoading={setLoading}
            onFinish={() => setButtonLoading(false)}
          />
        )}
        {authState?.profileCompletionStep === 3 && (
          <InvestorOrganisation
            ref={investorOrganisationRef}
            setLoading={setLoading}
            onFinish={() => setButtonLoading(false)}
            onSuccess={() => setShowSuccessDialog(true)}
          />
        )}
      </>
    ),
    developmentorg: (
      <>
        {authState?.profileCompletionStep === 1 && (
          <DevelopmentOrganisation
            ref={developmentOrganisationRef}
            setLoading={setLoading}
            onFinish={() => setButtonLoading(false)}
            onSuccess={() => setShowSuccessDialog(true)}
          />
        )}
      </>
    ),
  };

  console.log("Role:", authState?.role);
  console.log("Role lowercase:", authState?.role?.toLowerCase());
  console.log("Profile completion step:", authState?.profileCompletionStep);
  console.log("Available steps:", steps);
  console.log("Available forms:", Object.keys(roleFormMap));
  const getPrimaryButtonLabel = () => {
    const role = authState?.role?.toLowerCase();
    const step = authState?.profileCompletionStep;
    if (role === "sme") {
      return step === 2 ? "Submit" : "Next";
    }
    if (role === "investor") {
      return step === 3 ? "Submit" : "Next";
    }
    if (role === "developmentorg") {
      return step === 1 ? "Submit" : "Next";
    }
    return "Next";
  };

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);
  const dashboardUrl =
    routes?.[getKeyByValue(UserType, authState?.role) as keyof typeof routes]
      ?.root;

  return (
    <AuthLayout
      layoutSize="lg:max-w-4xl"
      inputFieldSize="max-w-3xl"
      google_signtures={false}
      title="Complete the following information to get started"
    >
      <div className="flex w-full border-b border-[#F0F0F0] items-center justify-center mb-6 space-x-12">
        {steps[authState?.role?.toLowerCase() as keyof typeof steps]?.map(
          ({ id, label }) => (
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
          )
        )}
      </div>

      <div className="w-full">
        {
          roleFormMap[
            authState?.role?.toLowerCase() as keyof typeof roleFormMap
          ]
        }
      </div>

      <div className="w-full">
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
            state={loading ? "loading" : undefined}
          >
            {getPrimaryButtonLabel()}
          </Button>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="md:w-fit flex flex-col items-center p-3">
          <DialogTitle>
            <div className="gap-2 flex flex-col">
              <img
                src={
                  authState?.role?.toLowerCase() === "developmentorg"
                    ? "/icons/pendingCheck.svg"
                    : "/icons/successCheck.svg"
                }
              />
              <div
                className={`${
                  authState?.role?.toLowerCase() === "developmentorg"
                    ? "text-[#D3931C]"
                    : "text-green"
                }`}
              >
                {authState?.role?.toLowerCase() === "developmentorg"
                  ? "Pending Verification"
                  : "Success!"}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm w-full max-w-sm font-normal text-center">
            {authState?.role?.toLowerCase() === "sme"
              ? "You have successfully created your account. You can start the Investment Readiness Assessment or you can go straight to your dashboard."
              : authState?.role?.toLowerCase() === "investor"
              ? "Welcome Investor! You have successfully created your account. We're reviewing your details. You'll get an email once verification is complete."
              : "We're reviewing your details. You'll get an email once verification is complete."}
          </DialogDescription>
          <DialogFooter className="!flex w-full max-w-sm !flex-col">
            <Button variant="primary" onClick={() => router.push(dashboardUrl)}>
              Go to Dashboard
            </Button>
            {authState?.role?.toLowerCase() === "sme" && (
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSuccessDialog(false);
                  setShowReadiness(true);
                }}
              >
                Start Assessment
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AssessmentReadiness
        setIsOpen={setShowReadiness}
        isOpen={showReadiness}
      />
    </AuthLayout>
  );
};

export default Page;
