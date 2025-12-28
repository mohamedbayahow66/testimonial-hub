/**
 * Tier Enforcement Utilities
 * Server-side functions for enforcing subscription limits
 */

import { db } from "@/lib/db";
import { 
  SUBSCRIPTION_TIERS, 
  SubscriptionTierKey, 
  getTierConfig,
  FeatureName,
  getRequiredTierForFeature,
  isTierHigher,
  getNextTier,
} from "@/lib/config/subscriptions";

/**
 * Custom error class for limit exceeded errors
 */
export class LimitExceededError extends Error {
  public readonly limitType: "testimonials" | "widgets" | "collectionLinks";
  public readonly currentCount: number;
  public readonly limit: number;
  public readonly requiredTier: SubscriptionTierKey;

  constructor(
    limitType: "testimonials" | "widgets" | "collectionLinks",
    currentCount: number,
    limit: number,
    requiredTier: SubscriptionTierKey
  ) {
    const messages = {
      testimonials: `You've reached your limit of ${limit} testimonials. Upgrade to ${requiredTier} for more.`,
      widgets: `You've reached your limit of ${limit} widget${limit === 1 ? "" : "s"}. Upgrade to ${requiredTier} for more.`,
      collectionLinks: `You've reached your limit of ${limit} collection links. Upgrade to ${requiredTier} for more.`,
    };
    
    super(messages[limitType]);
    this.name = "LimitExceededError";
    this.limitType = limitType;
    this.currentCount = currentCount;
    this.limit = limit;
    this.requiredTier = requiredTier;
  }
}

/**
 * Custom error class for feature access errors
 */
export class FeatureNotAvailableError extends Error {
  public readonly feature: FeatureName;
  public readonly requiredTier: SubscriptionTierKey;
  public readonly currentTier: SubscriptionTierKey;

  constructor(feature: FeatureName, currentTier: SubscriptionTierKey) {
    const requiredTier = getRequiredTierForFeature(feature);
    const featureNames: Record<FeatureName, string> = {
      video: "Video testimonials",
      audio: "Audio testimonials",
      brandingRemoval: "Branding removal",
      analytics: "Analytics",
      prioritySupport: "Priority support",
      customDomain: "Custom domain",
      autoCleanup: "Auto cleanup",
    };
    
    super(`${featureNames[feature]} requires a ${requiredTier} subscription. You're currently on ${currentTier}.`);
    this.name = "FeatureNotAvailableError";
    this.feature = feature;
    this.requiredTier = requiredTier;
    this.currentTier = currentTier;
  }
}

/**
 * Get user's subscription tier from database
 */
export async function getUserTier(userId: string): Promise<SubscriptionTierKey> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });
  
  if (!user) {
    throw new Error("User not found");
  }
  
  return user.subscriptionTier as SubscriptionTierKey;
}

/**
 * Check if user can add more testimonials
 * Throws LimitExceededError if limit is reached
 */
export async function checkTestimonialLimit(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: { select: { testimonials: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = user.subscriptionTier as SubscriptionTierKey;
  const config = getTierConfig(tier);
  const currentCount = user._count.testimonials;

  // If unlimited (null), no limit check needed
  if (config.maxTestimonials === null) {
    return;
  }

  if (currentCount >= config.maxTestimonials) {
    const nextTier = getNextTier(tier);
    throw new LimitExceededError(
      "testimonials",
      currentCount,
      config.maxTestimonials,
      nextTier || "PRO"
    );
  }
}

/**
 * Check if user can create more widgets
 * Throws LimitExceededError if limit is reached
 */
export async function checkWidgetLimit(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: { select: { widgets: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = user.subscriptionTier as SubscriptionTierKey;
  const config = getTierConfig(tier);
  const currentCount = user._count.widgets;

  // If unlimited (null), no limit check needed
  if (config.maxWidgets === null) {
    return;
  }

  if (currentCount >= config.maxWidgets) {
    const nextTier = getNextTier(tier);
    throw new LimitExceededError(
      "widgets",
      currentCount,
      config.maxWidgets,
      nextTier || "PRO"
    );
  }
}

/**
 * Check if user can create more collection links
 * Throws LimitExceededError if limit is reached
 */
export async function checkCollectionLinkLimit(userId: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: { select: { collectionLinks: true } },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = user.subscriptionTier as SubscriptionTierKey;
  const config = getTierConfig(tier);
  const currentCount = user._count.collectionLinks;

  // If unlimited (null), no limit check needed
  if (config.maxCollectionLinks === null) {
    return;
  }

  if (currentCount >= config.maxCollectionLinks) {
    const nextTier = getNextTier(tier);
    throw new LimitExceededError(
      "collectionLinks",
      currentCount,
      config.maxCollectionLinks,
      nextTier || "PRO"
    );
  }
}

/**
 * Check if user can use a specific feature
 * Returns true/false based on subscription tier
 */
export async function canUseFeature(userId: string, feature: FeatureName): Promise<boolean> {
  const tier = await getUserTier(userId);
  const config = getTierConfig(tier);

  const featureMap: Record<FeatureName, boolean> = {
    video: config.allowsVideo,
    audio: config.allowsAudio,
    brandingRemoval: config.allowsBrandingRemoval,
    analytics: config.allowsAnalytics,
    prioritySupport: config.allowsPrioritySupport,
    customDomain: config.allowsCustomDomain,
    autoCleanup: config.allowsAutoCleanup,
  };

  return featureMap[feature];
}

/**
 * Require a specific feature - throws if not available
 */
export async function requireFeature(userId: string, feature: FeatureName): Promise<void> {
  const tier = await getUserTier(userId);
  const hasFeature = await canUseFeature(userId, feature);
  
  if (!hasFeature) {
    throw new FeatureNotAvailableError(feature, tier);
  }
}

/**
 * Get remaining quota information for a user
 */
export async function getRemainingQuota(userId: string): Promise<{
  testimonials: { used: number; limit: number | null; remaining: number | null };
  widgets: { used: number; limit: number | null; remaining: number | null };
  collectionLinks: { used: number; limit: number | null; remaining: number | null };
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: {
        select: {
          testimonials: true,
          widgets: true,
          collectionLinks: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = user.subscriptionTier as SubscriptionTierKey;
  const config = getTierConfig(tier);

  const calculateRemaining = (used: number, limit: number | null): number | null => {
    if (limit === null) return null; // Unlimited
    return Math.max(0, limit - used);
  };

  return {
    testimonials: {
      used: user._count.testimonials,
      limit: config.maxTestimonials,
      remaining: calculateRemaining(user._count.testimonials, config.maxTestimonials),
    },
    widgets: {
      used: user._count.widgets,
      limit: config.maxWidgets,
      remaining: calculateRemaining(user._count.widgets, config.maxWidgets),
    },
    collectionLinks: {
      used: user._count.collectionLinks,
      limit: config.maxCollectionLinks,
      remaining: calculateRemaining(user._count.collectionLinks, config.maxCollectionLinks),
    },
  };
}

/**
 * Get detailed usage statistics for a user
 */
export async function getUsageStats(userId: string): Promise<{
  tier: SubscriptionTierKey;
  tierConfig: typeof SUBSCRIPTION_TIERS.FREE;
  testimonials: {
    used: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
    isAtLimit: boolean;
    isNearLimit: boolean;
  };
  widgets: {
    used: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
    isAtLimit: boolean;
    isNearLimit: boolean;
  };
  collectionLinks: {
    used: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
    isAtLimit: boolean;
    isNearLimit: boolean;
  };
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: {
        select: {
          testimonials: true,
          widgets: true,
          collectionLinks: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const tier = user.subscriptionTier as SubscriptionTierKey;
  const tierConfig = getTierConfig(tier);

  const calculateStats = (used: number, limit: number | null) => {
    if (limit === null) {
      return {
        used,
        limit: null,
        remaining: null,
        percentage: 0,
        isAtLimit: false,
        isNearLimit: false,
      };
    }

    const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;
    
    return {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      percentage,
      isAtLimit: used >= limit,
      isNearLimit: percentage >= 80 && percentage < 100,
    };
  };

  return {
    tier,
    tierConfig,
    testimonials: calculateStats(user._count.testimonials, tierConfig.maxTestimonials),
    widgets: calculateStats(user._count.widgets, tierConfig.maxWidgets),
    collectionLinks: calculateStats(user._count.collectionLinks, tierConfig.maxCollectionLinks),
  };
}

/**
 * Check if user is on free tier
 */
export async function isFreeTier(userId: string): Promise<boolean> {
  const tier = await getUserTier(userId);
  return tier === "FREE";
}

/**
 * Check if user should see upgrade prompts
 */
export async function shouldShowUpgradePrompt(userId: string): Promise<{
  show: boolean;
  reason?: string;
  suggestedTier?: SubscriptionTierKey;
}> {
  const stats = await getUsageStats(userId);

  // Always show for free tier users
  if (stats.tier === "FREE") {
    if (stats.testimonials.isAtLimit) {
      return {
        show: true,
        reason: "You've reached your testimonial limit",
        suggestedTier: "BASIC",
      };
    }
    if (stats.widgets.isAtLimit) {
      return {
        show: true,
        reason: "You've reached your widget limit",
        suggestedTier: "BASIC",
      };
    }
    if (stats.testimonials.isNearLimit || stats.widgets.isNearLimit) {
      return {
        show: true,
        reason: "You're approaching your usage limits",
        suggestedTier: "BASIC",
      };
    }
  }

  // Show for BASIC tier users hitting limits
  if (stats.tier === "BASIC") {
    if (stats.widgets.isAtLimit) {
      return {
        show: true,
        reason: "You've reached your widget limit",
        suggestedTier: "PRO",
      };
    }
  }

  return { show: false };
}


