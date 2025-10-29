'use client';

import AuthLayout from '@/components/layout/auth';
import Button from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetProfileNextStep } from '@/hooks/useProfileManagement';
import { authAtom } from '@/lib/atoms/atoms';
import { routes } from '@/lib/routes';
import { getKeyByValue } from '@/lib/uitils/fns';
import { onboardingSteps, UserType } from '@/lib/utils';
import { useAtomValue } from 'jotai';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BusinassInformationForm from './businassInformationForm';
import DevelopmentOrganisation from './developmentOrganisation';
import InvestmentPreference from './investmesntPrefernce';
import InvestorOrganisation from './investorOrganisation';
import AssessmentReadiness from '@/components/sections/AssessmentReadiness';

const PersonalInformationForm = dynamic(
  () => import('./personalInformationForm'),
  {
    ssr: false,
  }
);
const Page = () => {
  const router = useRouter();
  const authState: any = useAtomValue(authAtom);

  // const [onboardSteps] = useAtom(onboardingStepAtom);
  const { data: profileNextStep, refetch: refetchProfileNextStep } =
    useGetProfileNextStep();
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

  const isCompletedStep =
    (onboardingSteps.find((step) => step.role === authState?.roles)?.steps
      ?.length || 0) >= (profileNextStep?.completedSteps?.length || 0);

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);
  useEffect(() => {
    refetchProfileNextStep();
  }, [loading]);

  const handleNext = async () => {
    setLoading(true);
    const role = authState?.roles?.toLowerCase();
    const step = profileNextStep?.currentStep;
    let valid = true;
    if (role.toLowerCase() === 'investor') {
      if (step === onboardingSteps[1].steps[0].label) {
        valid = personalInfoFormRef.current?.submit()!;
      } else if (step === onboardingSteps[1].steps[1].label) {
        valid = investmentPreferenceRef.current?.submit()!;
      } else if (step === onboardingSteps[1].steps[2].label) {
        valid = investorOrganisationRef.current?.submit()!;
      }
    } else if (role.toLowerCase() === 'sme') {
      if (step === onboardingSteps[0].steps[0].label) {
        valid = personalInfoFormRef.current?.submit()!;
      } else if (step === onboardingSteps[0].steps[1].label) {
        valid = smeBusinessInfoFormRef.current?.submit()!;
      }
    } else if (role.toLowerCase() === 'development_org') {
      if (step === onboardingSteps[2].steps[0].label) {
        valid = developmentOrganisationRef.current?.submit()!;
      }
    }
    if (!valid) {
      setLoading(false);
      return;
    }
  };

  const roleFormMap = {
    sme: (
      <>
        {profileNextStep?.currentStep === onboardingSteps[0].steps[0].label && (
          <PersonalInformationForm
            ref={personalInfoFormRef}
            setLoading={setLoading}
            onFinish={() => setLoading(false)}
          />
        )}
        {profileNextStep?.currentStep === onboardingSteps[0].steps[1].label && (
          <BusinassInformationForm
            ref={smeBusinessInfoFormRef}
            setLoading={setLoading}
            onFinish={() => setLoading(false)}
            onSuccess={() => setShowSuccessDialog(true)}
          />
        )}
      </>
    ),
    investor: (
      <>
        {profileNextStep?.currentStep === onboardingSteps[1].steps[0].label && (
          <PersonalInformationForm
            ref={personalInfoFormRef}
            setLoading={setLoading}
            onFinish={() => setLoading(false)}
          />
        )}
        {profileNextStep?.currentStep === onboardingSteps[1].steps[1].label && (
          <InvestmentPreference
            ref={investmentPreferenceRef}
            setLoading={setLoading}
            onFinish={() => setLoading(false)}
          />
        )}
        {profileNextStep?.currentStep === onboardingSteps[1].steps[2].label && (
          <InvestorOrganisation
            ref={investorOrganisationRef}
            setLoading={setLoading}
            onFinish={() => setLoading(false)}
            onSuccess={() => setShowSuccessDialog(true)}
          />
        )}
      </>
    ),
    development: (
      <>
        {profileNextStep?.currentStep === onboardingSteps[2].steps[0].label && (
          <DevelopmentOrganisation
            ref={developmentOrganisationRef}
            setLoading={setLoading}
            onFinish={() => setLoading(false)}
            onSuccess={() => setShowSuccessDialog(true)}
          />
        )}
      </>
    ),
  };

  const getPrimaryButtonLabel = () => {
    const role = authState?.role?.toLowerCase();
    const step = profileNextStep?.currentStep;
    if (role === 'sme') {
      return step === onboardingSteps[0].steps[1].label ? 'Submit' : 'Next';
    }
    if (role === 'investor') {
      return step === onboardingSteps[1].steps[2].label ? 'Submit' : 'Next';
    }
    if (role === 'development_org') {
      return step === onboardingSteps[2].steps[0].label ? 'Submit' : 'Next';
    }
    return 'Next';
  };

  const dashboardUrl =
    routes?.[getKeyByValue(UserType, authState?.roles) as keyof typeof routes]
      ?.root;

  return (
    <AuthLayout
      layoutSize="lg:max-w-4xl"
      inputFieldSize="max-w-3xl"
      google_signtures={false}
      title="Complete the following information to get started"
    >
      <div className="flex w-full border-b border-[#F0F0F0] items-center justify-center mb-6 space-x-12">
        {onboardingSteps
          ?.find((step) => step.role === authState?.roles)
          ?.steps?.map(({ id, label }: { id: number; label: string }) => (
            <div
              key={id}
              className={`text-center py-2 text-xs cursor-pointer ${
                profileNextStep?.currentStep === label
                  ? 'border-b-2 border-green text-green font-bold'
                  : 'text-gray-400'
              }`}
            >
              {label}
            </div>
          ))}
      </div>

      <div className="w-full">
        {
          roleFormMap[
            getKeyByValue(
              UserType,
              authState?.roles
            ) as keyof typeof roleFormMap
          ]
        }
      </div>

      <div className="w-full">
        <div
          className={`grid ${
            !profileNextStep?.isCompleted && 'md:grid-cols-2'
          }  w-full gap-4 mt-4`}
        >
          <Button
            variant="secondary"
            onClick={() =>
              isCompletedStep
                ? router?.push(
                    routes?.[
                      getKeyByValue(
                        UserType,
                        authState?.roles
                      ) as keyof typeof routes
                    ]?.root
                  )
                : null
            }
          >
            {isCompletedStep ? 'Skip to Dashboard' : 'Back'}
          </Button>

          {!profileNextStep?.isCompleted && (
            <Button
              variant="primary"
              onClick={handleNext}
              state={loading ? 'loading' : undefined}
            >
              {getPrimaryButtonLabel()}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="md:w-fit flex flex-col items-center p-3">
          <DialogTitle>
            <div className="gap-2 flex flex-col">
              <img
                src={
                  authState?.role?.toLowerCase() === 'development_org'
                    ? '/icons/pendingCheck.svg'
                    : '/icons/successCheck.svg'
                }
              />
              <div
                className={`${
                  authState?.role?.toLowerCase() === 'development_org'
                    ? 'text-[#D3931C]'
                    : 'text-green'
                }`}
              >
                {authState?.role?.toLowerCase() === 'development_org'
                  ? 'Pending Verification'
                  : 'Success!'}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm w-full max-w-sm font-normal text-center">
            {authState?.roles?.toLowerCase() === 'sme'
              ? 'You have successfully created your account. You can start the Investment Readiness Assessment or you can go straight to your dashboard.'
              : authState?.roles?.toLowerCase() === 'investor'
              ? "Welcome Investor! You have successfully created your account. We're reviewing your details. You'll get an email once verification is complete."
              : "We're reviewing your details. You'll get an email once verification is complete."}
          </DialogDescription>
          <DialogFooter className="!flex w-full max-w-sm !flex-col">
            <Button variant="primary" onClick={() => router.push(dashboardUrl)}>
              Go to Dashboard
            </Button>
            {authState?.roles?.toLowerCase() === 'sme' && (
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
