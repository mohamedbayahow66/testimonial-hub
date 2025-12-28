import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema for updating a widget
const updateWidgetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  widgetType: z.enum(["GRID", "CAROUSEL", "LIST", "SINGLE"]).optional(),
  isActive: z.boolean().optional(),
  styling: z.object({
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
  }).optional(),
});

/**
 * GET /api/widgets/[id]
 * Get a specific widget
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const widget = await db.widget.findUnique({
      where: { id: params.id },
    });

    if (!widget) {
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404 }
      );
    }

    // Check ownership
    if (widget.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      widget: {
        ...widget,
        styling: widget.styling ? JSON.parse(widget.styling) : null,
      },
    });
  } catch (error) {
    console.error("Error fetching widget:", error);
    return NextResponse.json(
      { error: "Failed to fetch widget" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/widgets/[id]
 * Update a widget
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if widget exists and belongs to user
    const existingWidget = await db.widget.findUnique({
      where: { id: params.id },
    });

    if (!existingWidget) {
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404 }
      );
    }

    if (existingWidget.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateWidgetSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, widgetType, isActive, styling } = validationResult.data;

    // Update the widget
    const updatedWidget = await db.widget.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(widgetType !== undefined && { widgetType }),
        ...(isActive !== undefined && { isActive }),
        ...(styling !== undefined && { styling: JSON.stringify(styling) }),
      },
    });

    return NextResponse.json({
      success: true,
      widget: {
        ...updatedWidget,
        styling: updatedWidget.styling ? JSON.parse(updatedWidget.styling) : null,
      },
    });
  } catch (error) {
    console.error("Error updating widget:", error);
    return NextResponse.json(
      { error: "Failed to update widget" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/widgets/[id]
 * Delete a widget
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if widget exists and belongs to user
    const existingWidget = await db.widget.findUnique({
      where: { id: params.id },
    });

    if (!existingWidget) {
      return NextResponse.json(
        { error: "Widget not found" },
        { status: 404 }
      );
    }

    if (existingWidget.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the widget
    await db.widget.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Widget deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting widget:", error);
    return NextResponse.json(
      { error: "Failed to delete widget" },
      { status: 500 }
    );
  }
}

