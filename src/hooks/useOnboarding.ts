import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axios";
import { profileRoutes } from "@/api/endpoints";
import { useAtomValue } from "jotai";
import { authAtom } from "@/lib/atoms/atoms";

// ============================================================================
// TYPES
// ============================================================================

export type OnboardingRole = "sme" | "investor" | "development";

export interface OnboardingStepConfig {
  id: number;
  key: string;
  label: string;
  description: string;
  icon: string;
  optional?: boolean;
  actionType: "info" | "form" | "link" | "action";
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  skippedSteps: number[];
  isComplete: boolean;
  startedAt?: string;
  completedAt?: string;
}

export interface ProfileCompletionData {
  completedSteps?: string[];
  totalSteps?: number;
  completionPercentage?: number;
}

// ============================================================================
// STEP DEFINITIONS PER ROLE
// ============================================================================

export const smeOnboardingSteps: OnboardingStepConfig[] = [
  {
    id: 1,
    key: "welcome",
    label: "Welcome",
    description: "Welcome to Capalyse! Let's get you set up.",
    icon: "rocket",
    actionType: "info",
  },
  {
    id: 2,
    key: "complete-profile",
    label: "Complete Profile",
    description: "Fill in your business details to get started.",
    icon: "briefcase",
    actionType: "form",
  },
  {
    id: 3,
    key: "take-assessment",
    label: "Take Assessment",
    description: "Complete the readiness assessment to measure your investment readiness.",
    icon: "chart",
    actionType: "link",
  },
  {
    id: 4,
    key: "upload-documents",
    label: "Upload Documents",
    description: "Upload key compliance documents for verification.",
    icon: "document",
    optional: true,
    actionType: "action",
  },
  {
    id: 5,
    key: "explore-matches",
    label: "Explore Matches",
    description: "You're ready! Start exploring investor matches.",
    icon: "search",
    actionType: "link",
  },
];

export const investorOnboardingSteps: OnboardingStepConfig[] = [
  {
    id: 1,
    key: "welcome",
    label: "Welcome",
    description: "Welcome to Capalyse! Let's set up your investor profile.",
    icon: "rocket",
    actionType: "info",
  },
  {
    id: 2,
    key: "complete-profile",
    label: "Complete Profile",
    description: "Set your investment preferences and organization details.",
    icon: "briefcase",
    actionType: "form",
  },
  {
    id: 3,
    key: "set-criteria",
    label: "Investment Criteria",
    description: "Define what you're looking for in SME investments.",
    icon: "target",
    actionType: "form",
  },
  {
    id: 4,
    key: "browse-smes",
    label: "Browse SMEs",
    description: "Discover investment-ready SMEs that match your criteria.",
    icon: "search",
    actionType: "link",
  },
];

export const developmentOnboardingSteps: OnboardingStepConfig[] = [
  {
    id: 1,
    key: "welcome",
    label: "Welcome",
    description: "Welcome to Capalyse! Let's set up your organization.",
    icon: "rocket",
    actionType: "info",
  },
  {
    id: 2,
    key: "org-profile",
    label: "Organization Profile",
    description: "Enter your organization details, mission, and focus areas.",
    icon: "briefcase",
    actionType: "form",
  },
  {
    id: 3,
    key: "create-program",
    label: "Create First Program",
    description: "Set up a development program for SMEs.",
    icon: "program",
    actionType: "link",
  },
  {
    id: 4,
    key: "invite-smes",
    label: "Invite SMEs",
    description: "Browse and invite SMEs to your programs.",
    icon: "search",
    actionType: "link",
  },
];

// ============================================================================
// HOOKS
// ============================================================================

const STORAGE_KEY = "capalyse_onboarding_progress";

function getStorageKey(role: string, userId?: string): string {
  return `${STORAGE_KEY}_${role}_${userId || "anonymous"}`;
}

function loadProgress(role: string, userId?: string): OnboardingProgress {
  if (typeof window === "undefined") {
    return { currentStep: 1, completedSteps: [], skippedSteps: [], isComplete: false };
  }
  try {
    const stored = localStorage.getItem(getStorageKey(role, userId));
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { currentStep: 1, completedSteps: [], skippedSteps: [], isComplete: false };
}

function saveProgress(role: string, userId: string | undefined, progress: OnboardingProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(role, userId), JSON.stringify(progress));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get the onboarding steps for a specific role
 */
export function getStepsForRole(role: OnboardingRole): OnboardingStepConfig[] {
  switch (role) {
    case "sme":
      return smeOnboardingSteps;
    case "investor":
      return investorOnboardingSteps;
    case "development":
      return developmentOnboardingSteps;
    default:
      return smeOnboardingSteps;
  }
}

/**
 * Primary hook for managing onboarding wizard progress
 */
export function useOnboardingProgress(role: OnboardingRole) {
  const auth: any = useAtomValue(authAtom);
  const userId = auth?.id;
  const steps = useMemo(() => getStepsForRole(role), [role]);

  const [progress, setProgress] = useState<OnboardingProgress>(() =>
    loadProgress(role, userId)
  );

  // Sync with localStorage on mount and when userId changes
  useEffect(() => {
    const loaded = loadProgress(role, userId);
    setProgress(loaded);
  }, [role, userId]);

  // Persist changes
  useEffect(() => {
    saveProgress(role, userId, progress);
  }, [progress, role, userId]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 1 && step <= steps.length) {
        setProgress((prev) => ({ ...prev, currentStep: step }));
      }
    },
    [steps.length]
  );

  const completeStep = useCallback(
    (stepId: number) => {
      setProgress((prev) => {
        const completed = prev.completedSteps.includes(stepId)
          ? prev.completedSteps
          : [...prev.completedSteps, stepId];
        const nextStep = Math.min(stepId + 1, steps.length);
        const isComplete = completed.length >= steps.length;
        return {
          ...prev,
          completedSteps: completed,
          currentStep: isComplete ? steps.length : nextStep,
          isComplete,
          completedAt: isComplete ? new Date().toISOString() : prev.completedAt,
        };
      });
    },
    [steps.length]
  );

  const skipStep = useCallback(
    (stepId: number) => {
      setProgress((prev) => {
        const skipped = prev.skippedSteps.includes(stepId)
          ? prev.skippedSteps
          : [...prev.skippedSteps, stepId];
        const nextStep = Math.min(stepId + 1, steps.length);
        return {
          ...prev,
          skippedSteps: skipped,
          currentStep: nextStep,
        };
      });
    },
    [steps.length]
  );

  const goNext = useCallback(() => {
    setProgress((prev) => {
      const completed = prev.completedSteps.includes(prev.currentStep)
        ? prev.completedSteps
        : [...prev.completedSteps, prev.currentStep];
      const nextStep = Math.min(prev.currentStep + 1, steps.length);
      const isComplete = completed.length >= steps.length;
      return {
        ...prev,
        completedSteps: completed,
        currentStep: nextStep,
        isComplete,
        completedAt: isComplete ? new Date().toISOString() : prev.completedAt,
      };
    });
  }, [steps.length]);

  const goBack = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1),
    }));
  }, []);

  const markComplete = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      isComplete: true,
      completedAt: new Date().toISOString(),
      completedSteps: steps.map((s) => s.id),
    }));
  }, [steps]);

  const resetProgress = useCallback(() => {
    const fresh: OnboardingProgress = {
      currentStep: 1,
      completedSteps: [],
      skippedSteps: [],
      isComplete: false,
    };
    setProgress(fresh);
  }, []);

  const completionPercentage = useMemo(() => {
    if (steps.length === 0) return 0;
    return Math.round((progress.completedSteps.length / steps.length) * 100);
  }, [progress.completedSteps, steps.length]);

  const currentStepConfig = useMemo(
    () => steps.find((s) => s.id === progress.currentStep) || steps[0],
    [steps, progress.currentStep]
  );

  return {
    steps,
    progress,
    currentStep: progress.currentStep,
    currentStepConfig,
    completionPercentage,
    isComplete: progress.isComplete,
    goToStep,
    completeStep,
    skipStep,
    goNext,
    goBack,
    markComplete,
    resetProgress,
  };
}

/**
 * Hook to fetch profile completion status from the API
 */
export function useProfileCompletion() {
  return useQuery({
    queryKey: ["profile_completion"],
    queryFn: async (): Promise<ProfileCompletionData> => {
      const response = await api.get(profileRoutes.getCompletion);
      return response?.data;
    },
  });
}

/**
 * Hook to check if onboarding is complete (for conditional rendering)
 */
export function useIsOnboardingComplete(role: OnboardingRole) {
  const auth: any = useAtomValue(authAtom);
  const userId = auth?.id;

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const progress = loadProgress(role, userId);
    setIsComplete(progress.isComplete);
  }, [role, userId]);

  return isComplete;
}
