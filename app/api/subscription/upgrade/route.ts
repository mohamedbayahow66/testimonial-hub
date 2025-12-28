import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  SubscriptionTierKey, 
  getTierConfig, 
  isTierHigher,
  SUBSCRIPTION_TIERS 
} from "@/lib/config/subscriptions";

/**
 * POST /api/subscription/upgrade
 * Upgrades user's subscription tier (mock payment for now)
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

    const body = await request.json();
    const { tier: targetTier } = body;

    // Validate target tier
    if (!targetTier || !["FREE", "BASIC", "PRO"].includes(targetTier)) {
      return NextResponse.json(
        { error: "Invalid subscription tier" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        email: true,
        subscriptionTier: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const currentTier = user.subscriptionTier as SubscriptionTierKey;
    const newTier = targetTier as SubscriptionTierKey;

    // Check if this is actually an upgrade
    if (currentTier === newTier) {
      return NextResponse.json(
        { error: "You're already on this plan" },
        { status: 400 }
      );
    }

    // For now, allow both upgrades and downgrades
    // In production, downgrades would have different handling
    const isUpgrade = isTierHigher(newTier, currentTier);
    const tierConfig = getTierConfig(newTier);

    // TODO: Integrate with Stripe for actual payment processing
    // For now, we'll just update the database directly
    
    // Log the subscription change for audit purposes
    console.log(`Subscription change: User ${user.email} (${user.id}) - ${currentTier} -> ${newTier} (${isUpgrade ? "upgrade" : "downgrade"})`);

    // Update user's subscription tier
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        subscriptionTier: newTier,
      },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: isUpgrade 
        ? `Successfully upgraded to ${tierConfig.name} plan!`
        : `Successfully changed to ${tierConfig.name} plan`,
      user: {
        ...updatedUser,
        tierConfig: {
          name: tierConfig.name,
          price: tierConfig.price,
          features: tierConfig.features,
        },
      },
      isUpgrade,
      previousTier: currentTier,
      newTier,
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return NextResponse.json(
      { error: "Failed to upgrade subscription" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/subscription/upgrade
 * Returns available upgrade options for the current user
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

    const currentTier = user.subscriptionTier as SubscriptionTierKey;

    // Build upgrade options
    const upgradeOptions = Object.entries(SUBSCRIPTION_TIERS)
      .filter(([key]) => isTierHigher(key as SubscriptionTierKey, currentTier))
      .map(([key, config]) => ({
        tier: key,
        name: config.name,
        price: config.price,
        features: config.features,
        limits: {
          maxTestimonials: config.maxTestimonials,
          maxWidgets: config.maxWidgets,
          maxCollectionLinks: config.maxCollectionLinks,
        },
      }));

    return NextResponse.json({
      currentTier,
      currentTierConfig: getTierConfig(currentTier),
      upgradeOptions,
      canUpgrade: upgradeOptions.length > 0,
    });
  } catch (error) {
    console.error("Error fetching upgrade options:", error);
    return NextResponse.json(
      { error: "Failed to fetch upgrade options" },
      { status: 500 }
    );
  }
}


