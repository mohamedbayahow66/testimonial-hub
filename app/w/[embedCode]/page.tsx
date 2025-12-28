import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { WidgetDisplay } from "@/components/public/widget-display";
import { Metadata } from "next";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface WidgetPageProps {
  params: { embedCode: string };
}

/**
 * Generate metadata for the widget display page
 */
export async function generateMetadata({ params }: WidgetPageProps): Promise<Metadata> {
  const { embedCode } = params;

  const widget = await db.widget.findUnique({
    where: { embedCode },
    include: {
      user: {
        select: { businessName: true },
      },
    },
  });

  if (!widget || !widget.isActive) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${widget.name} - ${widget.user.businessName} Testimonials`,
    description: `See what customers are saying about ${widget.user.businessName}`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Public widget display page
 * Accessible without authentication at /w/[embedCode]
 * Displays approved testimonials in the widget's configured layout
 */
export default async function WidgetPage({ params }: WidgetPageProps) {
  const { embedCode } = params;

  // Fetch widget with user data
  const widget = await db.widget.findUnique({
    where: { embedCode },
    include: {
      user: {
        select: {
          id: true,
          businessName: true,
          brandingSettings: true,
        },
      },
    },
  });

  // Return 404 if not found
  if (!widget) {
    notFound();
  }

  // Return 404 if widget is inactive
  if (!widget.isActive) {
    notFound();
  }

  // Fetch approved testimonials for this user that allow public display
  const testimonials = await db.testimonial.findMany({
    where: {
      userId: widget.user.id,
      status: "APPROVED",
      allowPublic: true,
    },
    orderBy: { approvedAt: "desc" },
    select: {
      id: true,
      displayText: true,
      originalText: true,
      clientName: true,
      clientRole: true,
      clientCompany: true,
      rating: true,
      showFullName: true,
      verificationBadge: true,
      submittedAt: true,
    },
  });

  // Parse branding settings
  let brandingSettings = null;
  if (widget.user.brandingSettings) {
    try {
      brandingSettings = typeof widget.user.brandingSettings === "string"
        ? JSON.parse(widget.user.brandingSettings)
        : widget.user.brandingSettings;
    } catch {
      brandingSettings = null;
    }
  }

  // Parse widget styling
  let widgetStyling = null;
  if (widget.styling) {
    try {
      widgetStyling = typeof widget.styling === "string"
        ? JSON.parse(widget.styling)
        : widget.styling;
    } catch {
      widgetStyling = null;
    }
  }

  // Get primary color from branding
  const primaryColor = brandingSettings?.primaryColor || "#8b5cf6";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {brandingSettings?.logoUrl ? (
                <img 
                  src={brandingSettings.logoUrl} 
                  alt={widget.user.businessName}
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <div 
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <span className="text-white font-bold text-lg">
                    {widget.user.businessName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-semibold text-lg">{widget.user.businessName}</h1>
                <p className="text-sm text-muted-foreground">Customer Testimonials</p>
              </div>
            </div>
            <div 
              className="text-sm px-3 py-1 rounded-full"
              style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
            >
              {testimonials.length} {testimonials.length === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {testimonials.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div 
              className="flex h-16 w-16 mx-auto items-center justify-center rounded-full mb-4"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Sparkles className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-xl font-semibold mb-2">No testimonials yet</h2>
            <p className="text-muted-foreground">
              Check back soon for customer reviews!
            </p>
          </div>
        ) : (
          <WidgetDisplay
            testimonials={testimonials}
            widgetType={widget.widgetType}
            primaryColor={primaryColor}
            styling={widgetStyling}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Testimonials for {widget.user.businessName}
            </p>
            <Link 
              href="/"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Sparkles className="h-4 w-4" style={{ color: primaryColor }} />
              <span>Powered by Testimonial Hub</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

