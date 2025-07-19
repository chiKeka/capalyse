'use client';

import AuthLayout from '@/components/layout/auth';
import Button from '@/components/ui/Button';
import { authAtom, onboardingStepAtom } from '@/lib/atoms/atoms';
import { useAtom, useAtomValue } from 'jotai';
import { useRef } from 'react';
import BusinassInformationForm from './businassInformationForm';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { routes } from '@/lib/routes';
import { UserType } from '@/lib/utils';
import { getKeyByValue } from '@/lib/uitils/fns';
const PersonalInformationForm = dynamic(
  () => import('./personalInformationForm'),
  {
    ssr: false,
  }
);
const Page = () => {
  const router = useRouter();
  const authState: any = useAtomValue(authAtom);
  const [step, setStep] = useAtom(onboardingStepAtom);
  const personalInfoFormRef = useRef<{ submit: () => void }>(null);
  const smeBusinessInfoFormRef = useRef<{ submit: () => void }>(null);
  const isFirstStep = step === 1;
  const isLastStep = step === 2;
  console.log({ auth: authState });

  const handleNext = () => {
    if (authState?.profileCompletionStep === 1) {
      personalInfoFormRef.current?.submit();
    } else {
      smeBusinessInfoFormRef.current?.submit();
    }
  };

  const steps = [
    { id: 1, label: 'Personal Information' },
    { id: 2, label: 'Business Information' },
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
              authState?.profileCompletionStep === id
                ? 'border-b-2 border-green text-green font-bold'
                : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="w-full">
        {authState?.profileCompletionStep === 1 ? (
          <PersonalInformationForm ref={personalInfoFormRef} />
        ) : null}
        {authState?.profileCompletionStep === 2 && (
          <BusinassInformationForm ref={smeBusinessInfoFormRef} />
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
            {isFirstStep ? 'Skip to Dashboard' : 'Back'}
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {isLastStep ? 'Submit' : 'Next'}
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
