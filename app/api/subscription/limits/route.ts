import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTierConfig, SubscriptionTierKey } from "@/lib/config/subscriptions";

/**
 * GET /api/subscription/limits
 * Returns the limits object for the current user's tier
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

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const tier = user.subscriptionTier as SubscriptionTierKey;
    const config = getTierConfig(tier);

    return NextResponse.json({
      tier,
      limits: {
        maxTestimonials: config.maxTestimonials,
        maxWidgets: config.maxWidgets,
        maxCollectionLinks: config.maxCollectionLinks,
      },
      features: {
        allowsVideo: config.allowsVideo,
        allowsAudio: config.allowsAudio,
        allowsBrandingRemoval: config.allowsBrandingRemoval,
        allowsAnalytics: config.allowsAnalytics,
        allowsPrioritySupport: config.allowsPrioritySupport,
        allowsCustomDomain: config.allowsCustomDomain,
        allowsAutoCleanup: config.allowsAutoCleanup,
      },
      featureList: config.features,
    });
  } catch (error) {
    console.error("Error fetching limits:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription limits" },
      { status: 500 }
    );
  }
}


