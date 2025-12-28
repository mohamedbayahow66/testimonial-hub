import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SessionProvider } from "@/components/providers/session-provider";

/**
 * Dashboard layout with sidebar and header
 * Requires authentication - redirects to login if not authenticated
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <div className="min-h-screen bg-muted/30">
        <Sidebar />
        <div className="pl-[240px] transition-all duration-300">
          <Header user={session.user} />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
