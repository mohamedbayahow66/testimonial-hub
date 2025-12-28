import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/public/widget/[embedCode]
 * Public endpoint to fetch widget details and approved testimonials
 * No authentication required
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { embedCode: string } }
) {
  try {
    const { embedCode } = params;

    if (!embedCode) {
      return NextResponse.json(
        { error: "Widget code is required" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404 }
      );
    }

    // Return 404 if widget is inactive
    if (!widget.isActive) {
      return NextResponse.json(
        { error: "Widget is inactive" },
        { status: 404 }
      );
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

    // Return widget data and testimonials
    return NextResponse.json({
      widget: {
        id: widget.id,
        name: widget.name,
        widgetType: widget.widgetType,
        embedCode: widget.embedCode,
        styling: widgetStyling,
      },
      business: {
        name: widget.user.businessName,
        branding: brandingSettings,
      },
      testimonials,
      totalCount: testimonials.length,
    });
  } catch (error) {
    console.error("Error fetching widget:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget data" },
      { status: 500 }
    );
  }
}

