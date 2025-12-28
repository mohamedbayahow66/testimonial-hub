import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SessionProvider } from "@/components/providers/session-provider";

/**
 * Onboarding layout - used for the onboarding flow pages
 * Requires authentication but allows access even if onboarding not completed
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // If onboarding is already completed, redirect to dashboard
  if (session.user.onboardingCompleted) {
    redirect("/dashboard");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen gradient-mesh">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Testimonial Hub</span>
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto px-4 py-12">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}

