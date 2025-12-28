import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { canCreateWidget } from "@/lib/subscription";

// Validation schema for creating a widget
const createWidgetSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  widgetType: z.enum(["GRID", "CAROUSEL", "LIST", "SINGLE"]),
  styling: z.object({
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  }).optional(),
});

/**
 * GET /api/widgets
 * Get all widgets for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const widgets = await db.widget.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        widgetType: true,
        embedCode: true,
        styling: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ widgets });
  } catch (error) {
    console.error("Error fetching widgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch widgets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/widgets
 * Create a new widget
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check widget limit
    const canCreate = await canCreateWidget(session.user.id);
    if (!canCreate.allowed) {
      return NextResponse.json(
        { 
          error: "Widget limit reached",
          message: canCreate.message || "You have reached your widget limit. Please upgrade to create more widgets.",
          upgradeRequired: true,
          current: canCreate.current,
          limit: canCreate.limit,
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = createWidgetSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, widgetType, styling } = validationResult.data;

    // Create the widget
    const widget = await db.widget.create({
      data: {
        userId: session.user.id,
        name,
        widgetType,
        styling: styling ? JSON.stringify(styling) : null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      widget,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating widget:", error);
    return NextResponse.json(
      { error: "Failed to create widget" },
      { status: 500 }
    );
  }
}

