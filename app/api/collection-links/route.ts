import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collectionLinkSchema } from "@/lib/validations";
import { 
  checkCollectionLinkLimit, 
  LimitExceededError,
  getUsageStats 
} from "@/lib/tier-enforcement";

// In-memory rate limiting store (for production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 10; // Max 10 links per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check rate limit for creating collection links
 */
function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize
    rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  userLimit.count++;
  return { allowed: true };
}

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
 * Validate custom slug format
 */
function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]{3,50}$/;
  return slugRegex.test(slug);
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

    // Check rate limit
    const rateLimit = checkRateLimit(session.user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: `Rate limit exceeded. You can create up to ${RATE_LIMIT_MAX} links per hour. Try again later.`,
          retryAfter: rateLimit.retryAfter,
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
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
    const { customSlug, isActive = true } = body;

    // Determine the slug to use
    let finalSlug: string;

    if (customSlug) {
      // Validate custom slug format
      if (!isValidSlug(customSlug)) {
        return NextResponse.json(
          { error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only (3-50 characters)" },
          { status: 400 }
        );
      }

      // Check if custom slug is already taken
      const existingLink = await db.collectionLink.findUnique({
        where: { slug: customSlug },
      });

      if (existingLink) {
        return NextResponse.json(
          { error: "This slug is already taken. Please choose a different one." },
          { status: 400 }
        );
      }

      finalSlug = customSlug;
    } else {
      // Auto-generate slug from business name
      const baseSlug = generateSlug(session.user.businessName);

      // Check if slug already exists
      const existingLink = await db.collectionLink.findUnique({
        where: { slug: baseSlug },
      });

      finalSlug = existingLink 
        ? `${baseSlug}-${Date.now().toString(36)}`
        : baseSlug;
    }

    // Create collection link
    const collectionLink = await db.collectionLink.create({
      data: {
        userId: session.user.id,
        slug: finalSlug,
        title,
        description,
        isActive: Boolean(isActive),
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
