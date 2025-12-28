import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * DELETE /api/collection-links/[id]
 * Delete a collection link (soft or hard delete)
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
    const { searchParams } = new URL(request.url);
    const deleteType = searchParams.get("deleteType") || "hard";

    // Find the collection link and verify ownership
    const collectionLink = await db.collectionLink.findUnique({
      where: { id },
      select: { 
        userId: true,
        _count: {
          select: { testimonials: true }
        }
      },
    });

    if (!collectionLink) {
      return NextResponse.json(
        { error: "Collection link not found" },
        { status: 404 }
      );
    }

    if (collectionLink.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this link" },
        { status: 403 }
      );
    }

    if (deleteType === "soft") {
      // Soft delete: just deactivate the link
      await db.collectionLink.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json(
        { 
          message: "Collection link deactivated successfully",
          deleteType: "soft",
        },
        { status: 200 }
      );
    } else {
      // Hard delete: remove from database
      // Note: Testimonials have onDelete: SetNull, so they won't be deleted
      await db.collectionLink.delete({
        where: { id },
      });

      return NextResponse.json(
        { 
          message: "Collection link deleted successfully",
          deleteType: "hard",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error deleting collection link:", error);
    return NextResponse.json(
      { error: "Failed to delete collection link" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/collection-links/[id]
 * Update a collection link (toggle active status, edit title/description)
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
    const body = await request.json();

    // Find the collection link and verify ownership
    const collectionLink = await db.collectionLink.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!collectionLink) {
      return NextResponse.json(
        { error: "Collection link not found" },
        { status: 404 }
      );
    }

    if (collectionLink.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this link" },
        { status: 403 }
      );
    }

    // Validate title length if provided
    if (body.title !== undefined && body.title.length > 100) {
      return NextResponse.json(
        { error: "Title must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Validate description length if provided
    if (body.description !== undefined && body.description && body.description.length > 300) {
      return NextResponse.json(
        { error: "Description must be 300 characters or less" },
        { status: 400 }
      );
    }

    // Update the collection link
    const updatedLink = await db.collectionLink.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json({
      message: "Collection link updated successfully",
      collectionLink: updatedLink,
    });
  } catch (error) {
    console.error("Error updating collection link:", error);
    return NextResponse.json(
      { error: "Failed to update collection link" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/collection-links/[id]
 * Get a single collection link with its statistics
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

    const collectionLink = await db.collectionLink.findUnique({
      where: { id },
      include: {
        _count: {
          select: { testimonials: true }
        },
        testimonials: {
          orderBy: { submittedAt: "desc" },
          take: 1,
          select: { submittedAt: true }
        }
      },
    });

    if (!collectionLink) {
      return NextResponse.json(
        { error: "Collection link not found" },
        { status: 404 }
      );
    }

    if (collectionLink.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to view this link" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ...collectionLink,
      testimonialCount: collectionLink._count.testimonials,
      lastSubmissionAt: collectionLink.testimonials[0]?.submittedAt || null,
    });
  } catch (error) {
    console.error("Error fetching collection link:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection link" },
      { status: 500 }
    );
  }
}
