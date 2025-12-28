import { db } from "@/lib/db";

// Subscription tier type
export type SubscriptionTier = "FREE" | "BASIC" | "PRO";

/**
 * Subscription tier limits configuration
 */
export interface SubscriptionLimits {
  maxTestimonials: number | null; // null = unlimited
  maxWidgets: number; // -1 = unlimited
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsBrandingRemoval: boolean;
  allowsCustomDomain: boolean;
  allowsAnalytics: boolean;
  allowsPrioritySupport: boolean;
}

const TIER_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  FREE: {
    maxTestimonials: 10,
    maxWidgets: 1,
    allowsVideo: false,
    allowsAudio: false,
    allowsBrandingRemoval: false,
    allowsCustomDomain: false,
    allowsAnalytics: false,
    allowsPrioritySupport: false,
  },
  BASIC: {
    maxTestimonials: 100,
    maxWidgets: 5,
    allowsVideo: true,
    allowsAudio: true,
    allowsBrandingRemoval: false,
    allowsCustomDomain: false,
    allowsAnalytics: true,
    allowsPrioritySupport: false,
  },
  PRO: {
    maxTestimonials: null, // Unlimited
    maxWidgets: -1, // Unlimited
    allowsVideo: true,
    allowsAudio: true,
    allowsBrandingRemoval: true,
    allowsCustomDomain: true,
    allowsAnalytics: true,
    allowsPrioritySupport: true,
  },
};

/**
 * Get subscription limits for a given tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return TIER_LIMITS[tier] || TIER_LIMITS.FREE;
}

/**
 * Get the display name for a subscription tier
 */
export function getTierDisplayName(tier: SubscriptionTier): string {
  const names: Record<SubscriptionTier, string> = {
    FREE: "Free",
    BASIC: "Basic",
    PRO: "Pro",
  };
  return names[tier] || "Free";
}

/**
 * Get tier pricing (for display purposes)
 */
export function getTierPricing(tier: SubscriptionTier): { monthly: number; annual: number } {
  const pricing: Record<SubscriptionTier, { monthly: number; annual: number }> = {
    FREE: { monthly: 0, annual: 0 },
    BASIC: { monthly: 29, annual: 290 },
    PRO: { monthly: 79, annual: 790 },
  };
  return pricing[tier] || pricing.FREE;
}

/**
 * Check if a user can add more testimonials based on their subscription
 */
export async function canAddTestimonial(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number | null;
  message?: string;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: {
        select: { testimonials: true },
      },
    },
  });

  if (!user) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: "User not found",
    };
  }

  const limits = getSubscriptionLimits(user.subscriptionTier as SubscriptionTier);
  const currentCount = user._count.testimonials;

  // Unlimited testimonials
  if (limits.maxTestimonials === null) {
    return {
      allowed: true,
      current: currentCount,
      limit: null,
    };
  }

  const allowed = currentCount < limits.maxTestimonials;

  return {
    allowed,
    current: currentCount,
    limit: limits.maxTestimonials,
    message: allowed
      ? undefined
      : `You've reached your limit of ${limits.maxTestimonials} testimonials. Upgrade to add more.`,
  };
}

/**
 * Check if a user can create more widgets based on their subscription
 */
export async function canCreateWidget(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: {
        select: { widgets: true },
      },
    },
  });

  if (!user) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: "User not found",
    };
  }

  const limits = getSubscriptionLimits(user.subscriptionTier as SubscriptionTier);
  const currentCount = user._count.widgets;

  // Unlimited widgets
  if (limits.maxWidgets === -1) {
    return {
      allowed: true,
      current: currentCount,
      limit: -1,
    };
  }

  const allowed = currentCount < limits.maxWidgets;

  return {
    allowed,
    current: currentCount,
    limit: limits.maxWidgets,
    message: allowed
      ? undefined
      : `You've reached your limit of ${limits.maxWidgets} widget${limits.maxWidgets === 1 ? "" : "s"}. Upgrade to create more.`,
  };
}

/**
 * Check if a user can create collection links based on their subscription
 */
export async function canCreateCollectionLink(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  message?: string;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      _count: {
        select: { collectionLinks: true },
      },
    },
  });

  if (!user) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: "User not found",
    };
  }

  // Collection link limits: FREE = 2, BASIC = 10, PRO = unlimited
  const linkLimits: Record<SubscriptionTier, number> = {
    FREE: 2,
    BASIC: 10,
    PRO: -1, // Unlimited
  };

  const currentCount = user._count.collectionLinks;
  const tier = user.subscriptionTier as SubscriptionTier;
  const limit = linkLimits[tier] || linkLimits.FREE;

  // Unlimited links
  if (limit === -1) {
    return {
      allowed: true,
      current: currentCount,
      limit: -1,
    };
  }

  const allowed = currentCount < limit;

  return {
    allowed,
    current: currentCount,
    limit,
    message: allowed
      ? undefined
      : `You've reached your limit of ${limit} collection links. Upgrade to create more.`,
  };
}

/**
 * Check if a submission type is allowed for the user's tier
 */
export function canUseSubmissionType(
  tier: SubscriptionTier,
  type: "TEXT" | "IMAGE" | "AUDIO" | "VIDEO"
): boolean {
  const limits = getSubscriptionLimits(tier);
  
  switch (type) {
    case "TEXT":
    case "IMAGE":
      return true; // Always allowed
    case "AUDIO":
      return limits.allowsAudio;
    case "VIDEO":
      return limits.allowsVideo;
    default:
      return false;
  }
}

/**
 * Get user's subscription usage summary
 */
export async function getUsageSummary(userId: string): Promise<{
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  usage: {
    testimonials: { current: number; limit: number | null };
    widgets: { current: number; limit: number };
    collectionLinks: { current: number; limit: number };
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

  const tier = user.subscriptionTier as SubscriptionTier;
  const limits = getSubscriptionLimits(tier);
  const linkLimits: Record<SubscriptionTier, number> = {
    FREE: 2,
    BASIC: 10,
    PRO: -1,
  };

  return {
    tier,
    limits,
    usage: {
      testimonials: {
        current: user._count.testimonials,
        limit: limits.maxTestimonials,
      },
      widgets: {
        current: user._count.widgets,
        limit: limits.maxWidgets,
      },
      collectionLinks: {
        current: user._count.collectionLinks,
        limit: linkLimits[tier],
      },
    },
  };
}
