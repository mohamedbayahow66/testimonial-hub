"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

/**
 * Auth-aware navigation buttons for the landing page
 * Shows different buttons based on authentication state:
 * - Not logged in: Sign In + Get Started Free
 * - Logged in, onboarding incomplete: Continue Setup
 * - Logged in, onboarding complete: Dashboard
 */
export function AuthButtons() {
  const { data: session, status } = useSession();

  // Loading state - show skeleton buttons
  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <Button variant="ghost" disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
        <Button disabled>
          <Loader2 className="h-4 w-4 animate-spin" />
        </Button>
      </div>
    );
  }

  // Not logged in - show Sign In and Get Started
  if (!session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost">Sign in</Button>
        </Link>
        <Link href="/signup">
          <Button>Get Started Free</Button>
        </Link>
      </div>
    );
  }

  // Logged in but onboarding not complete
  if (!session.user?.onboardingCompleted) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/onboarding/welcome">
          <Button className="gap-2">
            Continue Setup
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // Logged in and onboarding complete - show Dashboard
  return (
    <div className="flex items-center gap-4">
      <Link href="/dashboard">
        <Button className="gap-2">
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

