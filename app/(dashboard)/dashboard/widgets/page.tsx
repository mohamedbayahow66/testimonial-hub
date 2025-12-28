import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetCard } from "@/components/dashboard/widget-card";
import { CreateWidgetModal } from "@/components/dashboard/create-widget-modal";
import { 
  LayoutGrid,
  Rows3,
  Square,
  GalleryHorizontal,
  Sparkles
} from "lucide-react";

export const metadata = {
  title: "Widgets - Testimonial Hub",
  description: "Create and manage your testimonial widgets",
};

export default async function WidgetsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  // Fetch widgets
  const widgets = await db.widget.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      widgetType: true,
      embedCode: true,
      isActive: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Widgets</h1>
          <p className="text-muted-foreground">
            Create embeddable widgets to display testimonials on your website
          </p>
        </div>
        <CreateWidgetModal />
      </div>

      {/* Widget Types */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <GalleryHorizontal className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-medium">Carousel</h3>
            <p className="text-xs text-muted-foreground">Sliding testimonials</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <LayoutGrid className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-medium">Grid</h3>
            <p className="text-xs text-muted-foreground">Card grid layout</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Rows3 className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-medium">List</h3>
            <p className="text-xs text-muted-foreground">Vertical list</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Square className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h3 className="font-medium">Single</h3>
            <p className="text-xs text-muted-foreground">Featured testimonial</p>
          </CardContent>
        </Card>
      </div>

      {/* Widgets List */}
      {widgets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No widgets yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Create your first widget to display testimonials publicly. Share the link with potential clients to showcase your social proof.
              </p>
              <CreateWidgetModal />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your Widgets</CardTitle>
            <CardDescription>
              Manage your existing widgets and share public links to display testimonials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {widgets.map((widget) => (
                <WidgetCard key={widget.id} widget={widget} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
