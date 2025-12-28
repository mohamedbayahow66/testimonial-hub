import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TestimonialCard } from "@/components/dashboard/testimonial-card";
import { 
  Plus, 
  Search, 
  MessageSquareQuote,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  ListFilter,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Testimonials - Testimonial Hub",
  description: "Manage your customer testimonials",
};

interface TestimonialsPageProps {
  searchParams: { status?: string };
}

export default async function TestimonialsPage({ searchParams }: TestimonialsPageProps) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  // Get filter from URL
  const statusFilter = searchParams.status?.toUpperCase();
  const validStatuses = ["APPROVED", "PENDING", "REJECTED"];
  const activeFilter = validStatuses.includes(statusFilter || "") ? statusFilter : null;

  // Fetch testimonials (filtered if status param exists) and stats
  const [testimonials, stats] = await Promise.all([
    db.testimonial.findMany({
      where: { 
        userId,
        ...(activeFilter && { status: activeFilter }),
      },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        clientRole: true,
        clientCompany: true,
        originalText: true,
        status: true,
        rating: true,
        verificationBadge: true,
        submittedAt: true,
        submissionType: true,
      },
    }),
    db.testimonial.groupBy({
      by: ["status"],
      where: { userId },
      _count: true,
    }),
  ]);

  // Calculate counts from stats (always show total counts, not filtered)
  const totalCount = stats.reduce((sum, s) => sum + s._count, 0);
  const approvedCount = stats.find(s => s.status === "APPROVED")?._count ?? 0;
  const pendingCount = stats.find(s => s.status === "PENDING")?._count ?? 0;
  const rejectedCount = stats.find(s => s.status === "REJECTED")?._count ?? 0;

  // Filtered count
  const filteredCount = testimonials.length;

  // Filter card configurations
  const filterCards = [
    {
      status: null,
      label: "Total Testimonials",
      count: totalCount,
      icon: ListFilter,
      activeClass: "ring-2 ring-primary ring-offset-2",
      baseClass: "",
      iconClass: "text-muted-foreground",
      countClass: "",
    },
    {
      status: "APPROVED",
      label: "Approved",
      count: approvedCount,
      icon: CheckCircle2,
      activeClass: "ring-2 ring-green-500 ring-offset-2",
      baseClass: "border-green-200 bg-green-50/50 hover:bg-green-100/50",
      iconClass: "text-green-600",
      countClass: "text-green-600",
    },
    {
      status: "PENDING",
      label: "Pending Review",
      count: pendingCount,
      icon: Clock,
      activeClass: "ring-2 ring-yellow-500 ring-offset-2",
      baseClass: "border-yellow-200 bg-yellow-50/50 hover:bg-yellow-100/50",
      iconClass: "text-yellow-600",
      countClass: "text-yellow-600",
    },
    {
      status: "REJECTED",
      label: "Rejected",
      count: rejectedCount,
      icon: XCircle,
      activeClass: "ring-2 ring-red-500 ring-offset-2",
      baseClass: "border-red-200 bg-red-50/50 hover:bg-red-100/50",
      iconClass: "text-red-600",
      countClass: "text-red-600",
    },
  ];

  // Get active filter label
  const activeFilterLabel = filterCards.find(f => f.status === activeFilter)?.label;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage and review your customer testimonials
          </p>
        </div>
        <Link href="/dashboard/collect">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Get More Testimonials
          </Button>
        </Link>
      </div>

      {totalCount === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyState
              icon={MessageSquareQuote}
              title="No testimonials yet"
              description="Share your collection link with customers to start receiving testimonials. The more you ask, the more you'll get!"
              action={{
                label: "Create Collection Link",
                href: "/dashboard/collect",
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search testimonials..." 
                className="pl-10"
              />
            </div>
            {activeFilter && (
              <Link href="/dashboard/testimonials">
                <Button variant="outline" className="gap-2">
                  <X className="h-4 w-4" />
                  Clear Filter
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Cards - Clickable Filters */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {filterCards.map((filter) => {
              const isActive = activeFilter === filter.status || (!activeFilter && filter.status === null);
              const Icon = filter.icon;
              const href = filter.status 
                ? `/dashboard/testimonials?status=${filter.status.toLowerCase()}`
                : "/dashboard/testimonials";

              return (
                <Link key={filter.label} href={href}>
                  <Card className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    filter.baseClass,
                    isActive && filter.activeClass
                  )}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Icon className={cn("h-5 w-5", filter.iconClass)} />
                        <div className={cn("text-2xl font-bold", filter.countClass)}>
                          {filter.count}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{filter.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Testimonials List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {activeFilter ? `${activeFilterLabel}` : "All Testimonials"}
                  </CardTitle>
                  <CardDescription>
                    {activeFilter 
                      ? `Showing ${filteredCount} ${activeFilterLabel?.toLowerCase()} testimonial${filteredCount !== 1 ? 's' : ''}`
                      : "Click on a testimonial to view details or take action"
                    }
                  </CardDescription>
                </div>
                {activeFilter && (
                  <Link href="/dashboard/testimonials">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      Show all
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {testimonials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {activeFilterLabel?.toLowerCase()} testimonials found.</p>
                  <Link href="/dashboard/testimonials">
                    <Button variant="link" className="mt-2">
                      View all testimonials
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <TestimonialCard 
                      key={testimonial.id} 
                      testimonial={testimonial} 
                    />
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
