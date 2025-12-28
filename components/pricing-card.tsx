"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Check, Loader2, Crown, Sparkles, Zap } from "lucide-react";
import { SubscriptionTierKey, formatPrice } from "@/lib/config/subscriptions";

interface PricingCardProps {
  tier: SubscriptionTierKey;
  name: string;
  price: number;
  features: string[];
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  onUpgrade?: (tier: SubscriptionTierKey) => Promise<void>;
  className?: string;
}

export function PricingCard({
  tier,
  name,
  price,
  features,
  isCurrentPlan = false,
  isPopular = false,
  onUpgrade,
  className,
}: PricingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getTierIcon = () => {
    switch (tier) {
      case "FREE":
        return <Zap className="h-5 w-5" />;
      case "BASIC":
        return <Sparkles className="h-5 w-5" />;
      case "PRO":
        return <Crown className="h-5 w-5" />;
    }
  };

  const handleUpgrade = async () => {
    if (isCurrentPlan) return;

    if (onUpgrade) {
      setIsLoading(true);
      try {
        await onUpgrade(tier);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Navigate to upgrade page with selected tier
      router.push(`/dashboard/settings/upgrade?tier=${tier}`);
    }
  };

  return (
    <Card className={cn(
      "relative flex flex-col transition-all",
      isCurrentPlan && "border-primary border-2 shadow-lg",
      isPopular && !isCurrentPlan && "border-primary/50",
      className
    )}>
      {isPopular && !isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
          Most Popular
        </Badge>
      )}
      
      {isCurrentPlan && (
        <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">
          Current Plan
        </Badge>
      )}

      <CardHeader className="text-center pb-2">
        <div className={cn(
          "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full",
          tier === "FREE" && "bg-slate-100 text-slate-600",
          tier === "BASIC" && "bg-blue-100 text-blue-600",
          tier === "PRO" && "bg-primary/10 text-primary",
        )}>
          {getTierIcon()}
        </div>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">
            {price === 0 ? "Free" : `$${price}`}
          </span>
          {price > 0 && <span className="text-muted-foreground">/month</span>}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : tier === "PRO" ? "default" : "secondary"}
          disabled={isCurrentPlan || isLoading}
          onClick={handleUpgrade}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            "Your Current Plan"
          ) : price === 0 ? (
            "Downgrade"
          ) : (
            `Upgrade to ${name}`
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Compact pricing card for comparison displays
 */
export function PricingCardCompact({
  tier,
  name,
  price,
  features,
  isCurrentPlan = false,
  onSelect,
  className,
}: Omit<PricingCardProps, 'onUpgrade'> & { onSelect?: () => void }) {
  return (
    <div 
      className={cn(
        "p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/50",
        isCurrentPlan && "border-primary bg-primary/5",
        className
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{name}</h4>
        <span className="font-bold">{formatPrice(price)}</span>
      </div>
      <ul className="space-y-1">
        {features.slice(0, 3).map((feature, index) => (
          <li key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3 w-3 text-green-500" />
            {feature}
          </li>
        ))}
        {features.length > 3 && (
          <li className="text-xs text-muted-foreground">
            +{features.length - 3} more features
          </li>
        )}
      </ul>
    </div>
  );
}


