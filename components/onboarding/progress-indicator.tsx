"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  steps?: { title: string; description?: string }[];
}

const defaultSteps = [
  { title: "Welcome", description: "Get started" },
  { title: "Branding", description: "Customize your look" },
  { title: "First Link", description: "Start collecting" },
];

export function ProgressIndicator({
  currentStep,
  totalSteps = 3,
  steps = defaultSteps,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full">
      {/* Step counter text */}
      <div className="text-center mb-6">
        <span className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={index} className="flex items-center">
              {/* Step circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isCurrent && "border-primary text-primary bg-primary/10",
                  !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-medium">{stepNumber}</span>
                )}
              </div>

              {/* Connector line */}
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-2 transition-all duration-300",
                    stepNumber < currentStep ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step titles */}
      <div className="flex justify-between px-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={index}
              className={cn(
                "text-center flex-1",
                isCurrent && "text-primary",
                isCompleted && "text-muted-foreground",
                !isCompleted && !isCurrent && "text-muted-foreground/50"
              )}
            >
              <p className="text-sm font-medium">{step.title}</p>
              {step.description && (
                <p className="text-xs mt-0.5 hidden sm:block">{step.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


