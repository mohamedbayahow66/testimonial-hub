import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * DELETE /api/collection-links/[id]
 * Delete a collection link
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
        { error: "You don't have permission to delete this link" },
        { status: 403 }
      );
    }

    // Delete the collection link
    await db.collectionLink.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Collection link deleted successfully" },
      { status: 200 }
    );
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


