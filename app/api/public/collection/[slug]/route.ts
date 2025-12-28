import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/public/collection/[slug]
 * Public endpoint to load collection link details
 * No authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: "Collection link slug is required" },
        { status: 400 }
      );
    }

    // Find the collection link with user details
    const collectionLink = await db.collectionLink.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            businessName: true,
            brandingSettings: true,
            subscriptionTier: true,
          },
        },
      },
    });

    // Return 404 if not found
    if (!collectionLink) {
      return NextResponse.json(
        { error: "Collection link not found" },
        { status: 404 }
      );
    }

    // Return 404 if link is inactive
    if (!collectionLink.isActive) {
      return NextResponse.json(
        { error: "This collection link is no longer active" },
        { status: 404 }
      );
    }

    // Increment click count (fire and forget - don't await)
    db.collectionLink.update({
      where: { id: collectionLink.id },
      data: { clickCount: { increment: 1 } },
    }).catch((err) => {
      console.error("Failed to increment click count:", err);
    });

    // Parse branding settings if stored as JSON string
    let brandingSettings = null;
    if (collectionLink.user.brandingSettings) {
      try {
        brandingSettings = typeof collectionLink.user.brandingSettings === "string"
          ? JSON.parse(collectionLink.user.brandingSettings)
          : collectionLink.user.brandingSettings;
      } catch {
        brandingSettings = null;
      }
    }

    // Return public collection link data
    return NextResponse.json({
      slug: collectionLink.slug,
      title: collectionLink.title,
      description: collectionLink.description,
      businessName: collectionLink.user.businessName,
      branding: brandingSettings,
      userId: collectionLink.user.id,
      ownerTier: collectionLink.user.subscriptionTier,
    });
  } catch (error) {
    console.error("Error fetching collection link:", error);
    return NextResponse.json(
      { error: "Failed to load collection link" },
      { status: 500 }
    );
  }
}


