import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUsageStats } from "@/lib/tier-enforcement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CollectionLinkCard } from "@/components/dashboard/collection-link-card";
import { UsageProgressCompact } from "@/components/dashboard/usage-progress";
import { CreateCollectionLinkButton } from "@/components/dashboard/create-collection-link-button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  Link2,
  MousePointerClick,
  MessageSquare,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Collection Links - Testimonial Hub",
  description: "Create links to collect customer testimonials",
};

export default async function CollectPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  // Fetch collection links, stats, and usage data
  const [collectionLinks, totalClicks, totalSubmissions, usage] = await Promise.all([
    db.collectionLink.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        isActive: true,
        clickCount: true,
        createdAt: true,
      },
    }),
    db.collectionLink.aggregate({
      where: { userId },
      _sum: { clickCount: true },
    }),
    db.testimonial.count({ where: { userId } }),
    getUsageStats(userId),
  ]);

  const activeLinks = collectionLinks.filter(l => l.isActive).length;
  const isAtLimit = usage.collectionLinks.isAtLimit;
  const isNearLimit = usage.collectionLinks.isNearLimit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection Links</h1>
          <p className="text-muted-foreground">
            Create shareable links to collect testimonials from your customers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Usage indicator */}
          <div className="hidden sm:block text-sm text-muted-foreground">
            {usage.collectionLinks.limit === null ? (
              <span className="flex items-center gap-1">
                <span className="text-green-500">Unlimited</span> links
              </span>
            ) : (
              <span className={isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : ""}>
                {usage.collectionLinks.used}/{usage.collectionLinks.limit} links
              </span>
            )}
          </div>
          <CreateCollectionLinkButton 
            isAtLimit={isAtLimit}
            tier={usage.tier}
          />
        </div>
      </div>

      {/* Limit Warning Banner */}
      {isAtLimit && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-900">Collection link limit reached</p>
                  <p className="text-sm text-red-700">
                    Upgrade your plan to create more collection links
                  </p>
                </div>
              </div>
              <Link href="/dashboard/settings/subscription">
                <Badge className="cursor-pointer gap-1 bg-red-600 hover:bg-red-700">
                  <Sparkles className="h-3 w-3" />
                  Upgrade Now
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {isNearLimit && !isAtLimit && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">Approaching link limit</p>
                  <p className="text-sm text-amber-700">
                    You've used {usage.collectionLinks.used} of {usage.collectionLinks.limit} collection links
                  </p>
                </div>
              </div>
              <Link href="/dashboard/settings/subscription">
                <Badge variant="outline" className="cursor-pointer gap-1 border-amber-400 text-amber-700 hover:bg-amber-100">
                  <Sparkles className="h-3 w-3" />
                  View Plans
                </Badge>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{activeLinks}</div>
                <p className="text-xs text-muted-foreground">Active Links</p>
                <UsageProgressCompact
                  used={usage.collectionLinks.used}
                  limit={usage.collectionLinks.limit}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <MousePointerClick className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalClicks._sum.clickCount || 0}</div>
                <p className="text-xs text-muted-foreground">Total Clicks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Links List */}
      {collectionLinks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={Link2}
              title="No collection links yet"
              description="Create your first collection link and share it with customers to start gathering testimonials."
              action={{
                label: "Create Collection Link",
                href: "#",
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Collection Links</CardTitle>
            <CardDescription>
              Share these links with customers to collect testimonials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collectionLinks.map((link) => (
                <CollectionLinkCard 
                  key={link.id} 
                  link={link} 
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
