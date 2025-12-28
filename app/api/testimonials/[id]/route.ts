import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
});

/**
 * PATCH /api/testimonials/[id]
 * Update a testimonial's status (approve/reject)
 */
export async function PATCH(
  request: NextRequest,
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

    const { id } = params;

    // Verify the testimonial belongs to the user
    const testimonial = await db.testimonial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validationResult = updateStatusSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // Update the testimonial
    const updatedTestimonial = await db.testimonial.update({
      where: { id },
      data: {
        status,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    return NextResponse.json({
      message: `Testimonial ${status.toLowerCase()} successfully`,
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/testimonials/[id]
 * Delete a testimonial permanently
 */
export async function DELETE(
  request: NextRequest,
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

    const { id } = params;

    // Verify the testimonial belongs to the user
    const testimonial = await db.testimonial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // Delete the testimonial
    await db.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/testimonials/[id]
 * Get a single testimonial details
 */
export async function GET(
  request: NextRequest,
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

    const { id } = params;

    const testimonial = await db.testimonial.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        collectionLink: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    if (!testimonial) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ testimonial });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonial" },
      { status: 500 }
    );
  }
}


