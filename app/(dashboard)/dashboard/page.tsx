import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUsageStats, shouldShowUpgradePrompt } from "@/lib/tier-enforcement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { UsageProgressCompact } from "@/components/dashboard/usage-progress";
import Link from "next/link";
import { 
  MessageSquareQuote, 
  LayoutGrid, 
  Link2, 
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Crown,
  Zap,
  AlertTriangle,
} from "lucide-react";

export const metadata = {
  title: "Dashboard - Testimonial Hub",
  description: "Manage your testimonials and widgets",
};

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return null;
  }

  // Fetch real stats and usage data from database
  const [
    totalTestimonials,
    approvedTestimonials,
    pendingTestimonials,
    totalWidgets,
    recentTestimonials,
    usage,
    upgradePrompt,
  ] = await Promise.all([
    db.testimonial.count({ where: { userId: user.id } }),
    db.testimonial.count({ where: { userId: user.id, status: "APPROVED" } }),
    db.testimonial.count({ where: { userId: user.id, status: "PENDING" } }),
    db.widget.count({ where: { userId: user.id } }),
    db.testimonial.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
      take: 5,
      select: {
        id: true,
        clientName: true,
        originalText: true,
        status: true,
        submittedAt: true,
      },
    }),
    getUsageStats(user.id),
    shouldShowUpgradePrompt(user.id),
  ]);

  const hasNoData = totalTestimonials === 0;
  const isFreeTier = usage.tier === "FREE";

  const getTierIcon = () => {
    switch (usage.tier) {
      case "FREE":
        return <Zap className="h-4 w-4" />;
      case "BASIC":
        return <Sparkles className="h-4 w-4" />;
      case "PRO":
        return <Crown className="h-4 w-4" />;
    }
  };

  const stats = [
    {
      title: "Total Testimonials",
      value: totalTestimonials.toString(),
      icon: MessageSquareQuote,
      usage: {
        used: usage.testimonials.used,
        limit: usage.testimonials.limit,
      },
    },
    {
      title: "Approved",
      value: approvedTestimonials.toString(),
      icon: CheckCircle2,
    },
    {
      title: "Pending Review",
      value: pendingTestimonials.toString(),
      icon: Clock,
    },
    {
      title: "Active Widgets",
      value: totalWidgets.toString(),
      icon: LayoutGrid,
      usage: {
        used: usage.widgets.used,
        limit: usage.widgets.limit,
      },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section with Plan Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            {hasNoData 
              ? "Let's get started by collecting your first testimonial"
              : "Here's an overview of your testimonial performance"
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isFreeTier ? "secondary" : "default"} className="gap-1">
            {getTierIcon()}
            {usage.tierConfig.name} Plan
          </Badge>
          {isFreeTier && (
            <Link href="/dashboard/settings/subscription">
              <Button size="sm" variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Upgrade Prompt Banner */}
      {upgradePrompt.show && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">{upgradePrompt.reason}</p>
                  <p className="text-sm text-amber-700">
                    Upgrade to {upgradePrompt.suggestedTier} for more capacity
                  </p>
                </div>
              </div>
              <Link href={`/dashboard/settings/upgrade?tier=${upgradePrompt.suggestedTier}`}>
                <Button size="sm" className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid with Usage Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.usage && (
                <UsageProgressCompact 
                  used={stat.usage.used} 
                  limit={stat.usage.limit}
                  className="mt-2"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Usage Overview Card for Free Users */}
      {isFreeTier && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Unlock More with Basic
            </CardTitle>
            <CardDescription>
              Upgrade to get unlimited testimonials, audio support, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold text-primary">Unlimited</p>
                <p className="text-xs text-muted-foreground">Testimonials</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold text-primary">5</p>
                <p className="text-xs text-muted-foreground">Widgets</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-background/50">
                <p className="text-2xl font-bold text-primary">Audio</p>
                <p className="text-xs text-muted-foreground">Testimonials</p>
              </div>
            </div>
            <Link href="/dashboard/settings/subscription">
              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                View Plans - Starting at $9/mo
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {hasNoData ? (
        /* Empty State - Getting Started */
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={MessageSquareQuote}
              title="No testimonials yet"
              description="Create a collection link and share it with your customers to start gathering testimonials."
              action={{
                label: "Create Collection Link",
                href: "/dashboard/collect",
              }}
              secondaryAction={{
                label: "Learn More",
                href: "#",
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/testimonials">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquareQuote className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">View Testimonials</CardTitle>
                      <CardDescription>Review and manage your testimonials</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/widgets">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <LayoutGrid className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Create Widget</CardTitle>
                      <CardDescription>Design embeddable testimonial displays</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard/collect">
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Link2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Collection Link</CardTitle>
                      <CardDescription>Create a link to collect testimonials</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Testimonials</CardTitle>
                <CardDescription>Latest testimonial submissions</CardDescription>
              </div>
              <Link href="/dashboard/testimonials">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentTestimonials.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No testimonials yet
                </p>
              ) : (
                <div className="space-y-4">
                  {recentTestimonials.map((testimonial) => (
                    <div 
                      key={testimonial.id} 
                      className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquareQuote className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="text-sm font-medium">{testimonial.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {testimonial.originalText.substring(0, 80)}...
                        </p>
                      </div>
                      <Badge variant={
                        testimonial.status === "APPROVED" ? "success" :
                        testimonial.status === "PENDING" ? "warning" : "destructive"
                      }>
                        {testimonial.status === "APPROVED" ? "Approved" :
                         testimonial.status === "PENDING" ? "Pending" : "Rejected"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
