"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  SUBSCRIPTION_TIERS, 
  SubscriptionTierKey,
  formatPrice,
} from "@/lib/config/subscriptions";
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Check, 
  Loader2,
  CreditCard,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function UpgradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const { toast } = useToast();
  
  const [selectedTier, setSelectedTier] = useState<SubscriptionTierKey>("BASIC");
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Get tier from URL params
  useEffect(() => {
    const tierParam = searchParams.get("tier");
    if (tierParam && ["BASIC", "PRO"].includes(tierParam)) {
      setSelectedTier(tierParam as SubscriptionTierKey);
    }
  }, [searchParams]);

  const tierConfig = SUBSCRIPTION_TIERS[selectedTier];
  const currentTier = (session?.user?.subscriptionTier || "FREE") as SubscriptionTierKey;

  const getTierIcon = (tier: SubscriptionTierKey) => {
    switch (tier) {
      case "FREE":
        return <Zap className="h-6 w-6" />;
      case "BASIC":
        return <Sparkles className="h-6 w-6" />;
      case "PRO":
        return <Crown className="h-6 w-6" />;
    }
  };

  const handleUpgrade = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upgrade");
      }

      // Update session to reflect new tier
      await update();

      toast({
        title: "Upgrade Successful! 🎉",
        description: data.message,
      });

      // Redirect to subscription page
      router.push("/dashboard/settings/subscription");
      router.refresh();
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Button */}
      <Link 
        href="/dashboard/settings/subscription"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to subscription
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upgrade Your Plan</h1>
        <p className="text-muted-foreground">
          Complete your upgrade to unlock more features
        </p>
      </div>

      {/* Plan Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Plan</CardTitle>
          <CardDescription>
            Choose the plan you want to upgrade to
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["BASIC", "PRO"] as SubscriptionTierKey[]).map((tier) => {
            const config = SUBSCRIPTION_TIERS[tier];
            const isSelected = tier === selectedTier;
            const isCurrent = tier === currentTier;
            
            return (
              <div
                key={tier}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                } ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isCurrent && setSelectedTier(tier)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      tier === "BASIC" ? "bg-blue-100 text-blue-600" : "bg-primary/10 text-primary"
                    }`}>
                      {getTierIcon(tier)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{config.name}</span>
                        {isCurrent && (
                          <Badge variant="secondary">Current</Badge>
                        )}
                        {tier === "BASIC" && !isCurrent && (
                          <Badge>Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {config.features[0]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold">${config.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Selected Plan Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
              selectedTier === "BASIC" ? "bg-blue-100 text-blue-600" : "bg-primary/10 text-primary"
            }`}>
              {getTierIcon(selectedTier)}
            </div>
            <div>
              <CardTitle>{tierConfig.name} Plan</CardTitle>
              <CardDescription>
                Everything you need to grow your testimonials
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 mb-4">
            {tierConfig.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Form (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Enter your payment information to complete the upgrade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800">
              <strong>Demo Mode:</strong> This is a placeholder for Stripe integration. 
              Click "Confirm Upgrade" to simulate a successful payment and upgrade your account.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="card">Card Number</Label>
              <Input 
                id="card" 
                placeholder="4242 4242 4242 4242" 
                disabled
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input 
                  id="expiry" 
                  placeholder="MM/YY" 
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input 
                  id="cvc" 
                  placeholder="123" 
                  disabled
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{tierConfig.name} Plan (Monthly)</span>
              <span>{formatPrice(tierConfig.price)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(tierConfig.price)}</span>
            </div>
          </div>

          <Separator />

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . I understand that my subscription will automatically renew monthly.
            </label>
          </div>

          {/* Submit Button */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleUpgrade}
            disabled={isLoading || !agreedToTerms}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Confirm Upgrade - {formatPrice(tierConfig.price)}
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


