import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUsageStats } from "@/lib/tier-enforcement";

/**
 * GET /api/subscription/usage
 * Returns current usage statistics for the authenticated user
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

    const usage = await getUsageStats(session.user.id);

    return NextResponse.json({
      tier: usage.tier,
      tierName: usage.tierConfig.name,
      price: usage.tierConfig.price,
      testimonials: {
        used: usage.testimonials.used,
        limit: usage.testimonials.limit,
        remaining: usage.testimonials.remaining,
        percentage: usage.testimonials.percentage,
        isUnlimited: usage.testimonials.limit === null,
        isAtLimit: usage.testimonials.isAtLimit,
        isNearLimit: usage.testimonials.isNearLimit,
      },
      widgets: {
        used: usage.widgets.used,
        limit: usage.widgets.limit,
        remaining: usage.widgets.remaining,
        percentage: usage.widgets.percentage,
        isUnlimited: usage.widgets.limit === null,
        isAtLimit: usage.widgets.isAtLimit,
        isNearLimit: usage.widgets.isNearLimit,
      },
      collectionLinks: {
        used: usage.collectionLinks.used,
        limit: usage.collectionLinks.limit,
        remaining: usage.collectionLinks.remaining,
        percentage: usage.collectionLinks.percentage,
        isUnlimited: usage.collectionLinks.limit === null,
        isAtLimit: usage.collectionLinks.isAtLimit,
        isNearLimit: usage.collectionLinks.isNearLimit,
      },
      features: {
        allowsVideo: usage.tierConfig.allowsVideo,
        allowsAudio: usage.tierConfig.allowsAudio,
        allowsBrandingRemoval: usage.tierConfig.allowsBrandingRemoval,
        allowsAnalytics: usage.tierConfig.allowsAnalytics,
        allowsPrioritySupport: usage.tierConfig.allowsPrioritySupport,
        allowsCustomDomain: usage.tierConfig.allowsCustomDomain,
        allowsAutoCleanup: usage.tierConfig.allowsAutoCleanup,
      },
    });
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage statistics" },
      { status: 500 }
    );
  }
}


