"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { 
  MessageSquareQuote, 
  LayoutGrid, 
  Link2, 
  Sparkles,
  ArrowRight,
  Zap,
  LogOut
} from "lucide-react";

const features = [
  {
    icon: MessageSquareQuote,
    title: "Collect Testimonials",
    description: "Create shareable links to gather authentic customer feedback",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Cleaning",
    description: "Automatically polish testimonials while keeping them authentic",
  },
  {
    icon: LayoutGrid,
    title: "Beautiful Widgets",
    description: "Display testimonials with customizable carousels and grids",
  },
  {
    icon: Zap,
    title: "Boost Conversions",
    description: "Turn social proof into higher conversion rates",
  },
];

export default function WelcomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding/branding");
  };

  const handleSkip = async () => {
    // Skip to dashboard by completing onboarding
    try {
      await fetch("/api/onboarding/complete", { method: "POST" });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator currentStep={1} />

      <Card className="border-2">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to Testimonial Hub!</CardTitle>
          <CardDescription className="text-lg">
            Let&apos;s get you set up to start collecting and displaying testimonials
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-4">
          {/* Features grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* What's next */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-medium mb-2">What&apos;s next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Set up your brand colors and logo
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Create your first collection link
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Start collecting testimonials!
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleGetStarted}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          </div>

          {/* Sign out option */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Not your account?
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-2"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              Sign out and use a different account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


