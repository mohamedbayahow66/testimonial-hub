"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  SUBSCRIPTION_TIERS, 
  SubscriptionTierKey, 
  formatPrice,
  getNextTier,
} from "@/lib/config/subscriptions";
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Check, 
  X,
  ArrowRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface UpgradePromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: SubscriptionTierKey;
  reason?: string;
  suggestedTier?: SubscriptionTierKey;
  limitType?: "testimonials" | "widgets" | "collectionLinks" | "feature";
  featureName?: string;
}

export function UpgradePrompt({
  open,
  onOpenChange,
  currentTier,
  reason,
  suggestedTier,
  limitType,
  featureName,
}: UpgradePromptProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const targetTier = suggestedTier || getNextTier(currentTier) || "PRO";
  const currentConfig = SUBSCRIPTION_TIERS[currentTier];
  const targetConfig = SUBSCRIPTION_TIERS[targetTier];

  const getTierIcon = (tier: SubscriptionTierKey) => {
    switch (tier) {
      case "FREE":
        return <Zap className="h-5 w-5" />;
      case "BASIC":
        return <Sparkles className="h-5 w-5" />;
      case "PRO":
        return <Crown className="h-5 w-5" />;
    }
  };

  const getReasonMessage = () => {
    if (reason) return reason;
    
    switch (limitType) {
      case "testimonials":
        return `You've reached your limit of ${currentConfig.maxTestimonials} testimonials`;
      case "widgets":
        return `You've reached your limit of ${currentConfig.maxWidgets} widget${currentConfig.maxWidgets === 1 ? "" : "s"}`;
      case "collectionLinks":
        return `You've reached your limit of ${currentConfig.maxCollectionLinks} collection links`;
      case "feature":
        return `${featureName} requires a ${targetTier} subscription`;
      default:
        return "Upgrade to unlock more features";
    }
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      // Navigate to upgrade page with selected tier
      router.push(`/dashboard/settings/upgrade?tier=${targetTier}`);
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to process upgrade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPlans = () => {
    router.push("/dashboard/settings/subscription");
    onOpenChange(false);
  };

  // Features comparison
  const compareFeatures = [
    {
      name: "Testimonials",
      current: currentConfig.maxTestimonials === null ? "Unlimited" : currentConfig.maxTestimonials.toString(),
      target: targetConfig.maxTestimonials === null ? "Unlimited" : targetConfig.maxTestimonials.toString(),
    },
    {
      name: "Widgets",
      current: currentConfig.maxWidgets === null ? "Unlimited" : currentConfig.maxWidgets.toString(),
      target: targetConfig.maxWidgets === null ? "Unlimited" : targetConfig.maxWidgets.toString(),
    },
    {
      name: "Audio testimonials",
      current: currentConfig.allowsAudio,
      target: targetConfig.allowsAudio,
    },
    {
      name: "Video testimonials",
      current: currentConfig.allowsVideo,
      target: targetConfig.allowsVideo,
    },
    {
      name: "Remove branding",
      current: currentConfig.allowsBrandingRemoval,
      target: targetConfig.allowsBrandingRemoval,
    },
    {
      name: "Analytics",
      current: currentConfig.allowsAnalytics,
      target: targetConfig.allowsAnalytics,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-7 w-7 text-amber-600" />
          </div>
          <DialogTitle className="text-xl">Upgrade Required</DialogTitle>
          <DialogDescription className="text-base">
            {getReasonMessage()}
          </DialogDescription>
        </DialogHeader>

        {/* Comparison Table */}
        <div className="my-4">
          <div className="grid grid-cols-3 gap-2 text-sm">
            {/* Header */}
            <div className="font-medium text-muted-foreground">Feature</div>
            <div className="text-center">
              <Badge variant="outline" className="gap-1">
                {getTierIcon(currentTier)}
                {currentConfig.name}
              </Badge>
            </div>
            <div className="text-center">
              <Badge className="gap-1 bg-primary">
                {getTierIcon(targetTier)}
                {targetConfig.name}
              </Badge>
            </div>

            {/* Features */}
            {compareFeatures.map((feature) => (
              <>
                <div key={`name-${feature.name}`} className="py-2 border-t">
                  {feature.name}
                </div>
                <div key={`current-${feature.name}`} className="py-2 border-t text-center">
                  {typeof feature.current === "boolean" ? (
                    feature.current ? (
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    ) : (
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    )
                  ) : (
                    <span className="text-muted-foreground">{feature.current}</span>
                  )}
                </div>
                <div key={`target-${feature.name}`} className="py-2 border-t text-center">
                  {typeof feature.target === "boolean" ? (
                    feature.target ? (
                      <Check className="h-4 w-4 mx-auto text-green-500" />
                    ) : (
                      <X className="h-4 w-4 mx-auto text-muted-foreground" />
                    )
                  ) : (
                    <span className="font-medium">{feature.target}</span>
                  )}
                </div>
              </>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="rounded-lg bg-primary/5 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Upgrade to {targetConfig.name} for just
          </p>
          <p className="text-2xl font-bold">
            {formatPrice(targetConfig.price)}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={handleUpgrade}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Upgrade to {targetConfig.name}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={handleViewPlans}
          >
            Compare all plans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to manage upgrade prompt state
 */
export function useUpgradePrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<{
    currentTier: SubscriptionTierKey;
    reason?: string;
    suggestedTier?: SubscriptionTierKey;
    limitType?: "testimonials" | "widgets" | "collectionLinks" | "feature";
    featureName?: string;
  }>({
    currentTier: "FREE",
  });

  const showUpgradePrompt = (config: typeof promptConfig) => {
    setPromptConfig(config);
    setIsOpen(true);
  };

  const hideUpgradePrompt = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    setIsOpen,
    promptConfig,
    showUpgradePrompt,
    hideUpgradePrompt,
  };
}


