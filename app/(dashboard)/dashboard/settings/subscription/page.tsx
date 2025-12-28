import { auth } from "@/lib/auth";
import { getUsageStats } from "@/lib/tier-enforcement";
import { SUBSCRIPTION_TIERS, SubscriptionTierKey } from "@/lib/config/subscriptions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UsageProgress } from "@/components/dashboard/usage-progress";
import { PricingCard } from "@/components/pricing-card";
import { Crown, Sparkles, Zap, Check } from "lucide-react";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Subscription - Testimonial Hub",
  description: "Manage your subscription plan",
};

export default async function SubscriptionPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const usage = await getUsageStats(session.user.id);
  const currentTier = usage.tier;
  const tierConfig = usage.tierConfig;

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and view usage statistics
        </p>
      </div>

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                currentTier === "FREE" ? "bg-slate-100 text-slate-600" :
                currentTier === "BASIC" ? "bg-blue-100 text-blue-600" :
                "bg-primary/10 text-primary"
              }`}>
                {getTierIcon(currentTier)}
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {tierConfig.name} Plan
                  <Badge variant={currentTier === "FREE" ? "secondary" : "default"}>
                    Current Plan
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {tierConfig.price === 0 
                    ? "Free forever" 
                    : `$${tierConfig.price}/month`
                  }
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {tierConfig.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>
            Track your current usage against your plan limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UsageProgress
            label="Testimonials"
            used={usage.testimonials.used}
            limit={usage.testimonials.limit}
            showPercentage
          />
          <UsageProgress
            label="Widgets"
            used={usage.widgets.used}
            limit={usage.widgets.limit}
            showPercentage
          />
          <UsageProgress
            label="Collection Links"
            used={usage.collectionLinks.used}
            limit={usage.collectionLinks.limit}
            showPercentage
          />
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Available Plans</h2>
        <p className="text-muted-foreground mb-6">
          Choose the plan that best fits your needs
        </p>
        
        <div className="grid gap-6 md:grid-cols-3">
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, config]) => (
            <PricingCard
              key={key}
              tier={key as SubscriptionTierKey}
              name={config.name}
              price={config.price}
              features={config.features}
              isCurrentPlan={key === currentTier}
              isPopular={key === "BASIC"}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            See what's included in each plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Free</th>
                  <th className="text-center py-3 px-4 font-medium">Basic</th>
                  <th className="text-center py-3 px-4 font-medium">Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4">Testimonials</td>
                  <td className="text-center py-3 px-4">3</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Widgets</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4">5</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Collection Links</td>
                  <td className="text-center py-3 px-4">2</td>
                  <td className="text-center py-3 px-4">10</td>
                  <td className="text-center py-3 px-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Audio Testimonials</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Video Testimonials</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Remove Branding</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Analytics</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Priority Support</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-muted-foreground">—</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


