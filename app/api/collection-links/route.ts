import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collectionLinkSchema } from "@/lib/validations";
import { 
  checkCollectionLinkLimit, 
  LimitExceededError,
  getUsageStats 
} from "@/lib/tier-enforcement";

/**
 * Generate a unique slug for collection links
 */
function generateSlug(businessName: string): string {
  const baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 20);
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * GET /api/collection-links
 * Get all collection links for the current user
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [collectionLinks, usage] = await Promise.all([
      db.collectionLink.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      }),
      getUsageStats(session.user.id),
    ]);

    return NextResponse.json({ 
      collectionLinks,
      usage: {
        used: usage.collectionLinks.used,
        limit: usage.collectionLinks.limit,
        remaining: usage.collectionLinks.remaining,
        isAtLimit: usage.collectionLinks.isAtLimit,
      },
    });
  } catch (error) {
    console.error("Error fetching collection links:", error);
    return NextResponse.json(
      { error: "Failed to fetch collection links" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/collection-links
 * Create a new collection link
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's onboarding status and current collection link count
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        _count: { select: { collectionLinks: true } },
      },
    });

    // Allow first collection link during onboarding regardless of limits
    const isFirstLinkDuringOnboarding = 
      user && !user.onboardingCompleted && user._count.collectionLinks === 0;

    if (!isFirstLinkDuringOnboarding) {
      // Check subscription limits using new tier enforcement
      try {
        await checkCollectionLinkLimit(session.user.id);
      } catch (error) {
        if (error instanceof LimitExceededError) {
          return NextResponse.json(
            { 
              error: error.message,
              limitType: error.limitType,
              currentCount: error.currentCount,
              limit: error.limit,
              requiredTier: error.requiredTier,
            },
            { status: 403 }
          );
        }
        throw error;
      }
    }

    const body = await request.json();
    const validatedFields = collectionLinkSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { title, description } = validatedFields.data;

    // Generate unique slug
    const slug = generateSlug(session.user.businessName);

    // Check if slug already exists (very unlikely but just in case)
    const existingLink = await db.collectionLink.findUnique({
      where: { slug },
    });

    const finalSlug = existingLink 
      ? `${slug}-${Date.now().toString(36)}`
      : slug;

    // Create collection link
    const collectionLink = await db.collectionLink.create({
      data: {
        userId: session.user.id,
        slug: finalSlug,
        title,
        description,
        isActive: true,
      },
    });

    return NextResponse.json(
      { 
        message: "Collection link created successfully",
        collectionLink 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating collection link:", error);
    return NextResponse.json(
      { error: "Failed to create collection link" },
      { status: 500 }
    );
  }
}
