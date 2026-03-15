"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepperStep {
  id: number;
  label: string;
  description?: string;
  optional?: boolean;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <>
      {/* Desktop: Horizontal */}
      <div className={cn("hidden md:flex items-start w-full", className)}>
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className={cn("flex items-start flex-1", !isLast && "relative")}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 shrink-0",
                    isCompleted &&
                      "bg-green border-green text-white",
                    isCurrent &&
                      "bg-primary-green-1 border-green text-green",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-white border-black-100 text-black-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center max-w-[100px]">
                  <p
                    className={cn(
                      "text-xs font-medium leading-tight",
                      isCurrent
                        ? "text-green"
                        : isCompleted
                          ? "text-green"
                          : "text-black-300"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.optional && (
                    <span className="text-[10px] text-black-200">
                      Optional
                    </span>
                  )}
                </div>
              </div>
              {!isLast && (
                <div className="flex-1 mt-5 mx-2">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded transition-all duration-300",
                      isCompleted ? "bg-green" : "bg-black-100"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Vertical */}
      <div className={cn("flex md:hidden flex-col gap-0", className)}>
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 shrink-0",
                    isCompleted &&
                      "bg-green border-green text-white",
                    isCurrent &&
                      "bg-primary-green-1 border-green text-green",
                    !isCompleted &&
                      !isCurrent &&
                      "bg-white border-black-100 text-black-300"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 h-8 rounded transition-all duration-300",
                      isCompleted ? "bg-green" : "bg-black-100"
                    )}
                  />
                )}
              </div>
              <div className="pb-6">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent
                      ? "text-green"
                      : isCompleted
                        ? "text-green"
                        : "text-black-300"
                  )}
                >
                  {step.label}
                </p>
                {step.optional && (
                  <span className="text-xs text-black-200">Optional</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Stepper;
