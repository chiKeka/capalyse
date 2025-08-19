import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UserType = {
  development: "DevelopmentOrg",
  sme: "SME",
  investor: "Investor",
};

export const onboardingSteps = [
  {
    role: "sme",
    steps: [
      { id: 1, label: "personal-info" },
      { id: 2, label: "sme-business-info" },
    ],
  },
  {
    role: "investor",
    steps: [
      { id: 1, label: "personal-info" },
      { id: 2, label: "investor-investment-info" },
      { id: 3, label: "investor-organization-info" },
    ],
  },
  {
    role: "developmentorg",
    steps: [{ id: 1, label: "dev-org-info" }],
  },
];
