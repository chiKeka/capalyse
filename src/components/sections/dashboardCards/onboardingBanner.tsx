"use client";

import Button from "@/components/ui/Button";
import { useIsOnboardingComplete, type OnboardingRole } from "@/hooks/useOnboarding";
import { routes } from "@/lib/routes";
import { ArrowRight, Rocket } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export function OnboardingBanner() {
  const params = useParams();
  const router = useRouter();
  const accessType = params.accessType as string;
  const role = accessType as OnboardingRole;
  const isComplete = useIsOnboardingComplete(role);

  if (isComplete || !accessType) return null;

  const routeMap: Record<string, string> = {
    sme: routes.sme.onboarding,
    investor: routes.investor.onboarding,
    development: routes.development.onboarding,
  };

  const onboardingRoute = routeMap[accessType] || `/${accessType}/onboarding`;

  return (
    <div className="w-full p-4 lg:p-5 rounded-lg border border-primary-green-2 bg-gradient-to-r from-primary-green-1 to-white mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center shrink-0">
            <Rocket className="w-5 h-5 text-green" />
          </div>
          <div>
            <p className="font-bold text-base text-black-500">
              Complete your setup
            </p>
            <p className="text-sm text-black-300">
              Finish onboarding to unlock all platform features and get the best
              experience.
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="small"
          onClick={() => router.push(onboardingRoute)}
          className="shrink-0"
        >
          Get Started <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

export default OnboardingBanner;
