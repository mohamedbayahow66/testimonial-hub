"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles, ArrowRight, RefreshCw } from "lucide-react";

interface SubmissionSuccessProps {
  businessName: string;
  onSubmitAnother: () => void;
  className?: string;
}

export function SubmissionSuccess({
  businessName,
  onSubmitAnother,
  className,
}: SubmissionSuccessProps) {
  const [showContent, setShowContent] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    // Stagger the animations
    const contentTimer = setTimeout(() => setShowContent(true), 300);
    const actionsTimer = setTimeout(() => setShowActions(true), 1500);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(actionsTimer);
    };
  }, []);

  return (
    <div className={cn("w-full max-w-2xl mx-auto px-4 py-8", className)}>
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className={cn(
            "mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center",
            "transition-all duration-500 transform",
            showContent ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}>
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          
          {/* Sparkle decorations */}
          <Sparkles className={cn(
            "absolute -top-2 -right-2 h-6 w-6 text-amber-400",
            "transition-all duration-500 delay-300",
            showContent ? "opacity-100 animate-pulse" : "opacity-0"
          )} />
          <Sparkles className={cn(
            "absolute -bottom-1 -left-3 h-5 w-5 text-primary",
            "transition-all duration-500 delay-500",
            showContent ? "opacity-100 animate-pulse" : "opacity-0"
          )} />
        </div>

        {/* Thank You Message */}
        <div className={cn(
          "transition-all duration-500 delay-200",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Thank You!
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Your testimonial has been submitted successfully.
          </p>
          <p className="text-gray-500 max-w-md mx-auto">
            {businessName} will review your feedback. If approved, your testimonial
            may be featured on their website.
          </p>
        </div>

        {/* What Happens Next */}
        <div className={cn(
          "mt-8 p-6 bg-gray-50 rounded-xl transition-all duration-500 delay-400",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <ArrowRight className="h-4 w-4" />
            What happens next?
          </h3>
          <ol className="text-sm text-gray-600 space-y-2 text-left max-w-sm mx-auto">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                1
              </span>
              <span>Your testimonial is being reviewed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                2
              </span>
              <span>If approved, it may be displayed publicly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                3
              </span>
              <span>You may be contacted for verification</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className={cn(
          "mt-8 transition-all duration-500",
          showActions ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Button
            onClick={onSubmitAnother}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Submit Another Testimonial
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className={cn(
        "mt-6 text-center text-sm text-gray-400 transition-all duration-500 delay-700",
        showActions ? "opacity-100" : "opacity-0"
      )}>
        Powered by Testimonial Hub
      </p>
    </div>
  );
}


