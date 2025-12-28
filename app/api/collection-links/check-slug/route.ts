import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * GET /api/collection-links/check-slug
 * Check if a slug is available for use
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only (3-50 characters)",
      });
    }

    // Check if slug already exists
    const existingLink = await db.collectionLink.findUnique({
      where: { slug },
      select: { id: true },
    });

    return NextResponse.json({
      available: !existingLink,
      slug,
    });
  } catch (error) {
    console.error("Error checking slug:", error);
    return NextResponse.json(
      { error: "Failed to check slug availability" },
      { status: 500 }
    );
  }
}

