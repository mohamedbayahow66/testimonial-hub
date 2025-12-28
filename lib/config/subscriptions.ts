/**
 * Subscription Tiers Configuration
 * Central configuration for all subscription tier limits and features
 */

export type SubscriptionTierKey = "FREE" | "BASIC" | "PRO";

export interface SubscriptionTier {
  name: string;
  price: number;
  maxTestimonials: number | null; // null = unlimited
  maxWidgets: number | null; // null = unlimited
  maxCollectionLinks: number | null; // null = unlimited
  allowsVideo: boolean;
  allowsAudio: boolean;
  allowsBrandingRemoval: boolean;
  allowsAnalytics: boolean;
  allowsPrioritySupport: boolean;
  allowsCustomDomain: boolean;
  allowsAutoCleanup: boolean;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTierKey, SubscriptionTier> = {
  FREE: {
    name: "Free",
    price: 0,
    maxTestimonials: 3,
    maxWidgets: 1,
    maxCollectionLinks: 2,
    allowsVideo: false,
    allowsAudio: false,
    allowsBrandingRemoval: false,
    allowsAnalytics: false,
    allowsPrioritySupport: false,
    allowsCustomDomain: false,
    allowsAutoCleanup: false,
    features: [
      "Up to 3 testimonials",
      "1 embeddable widget",
      "2 collection links",
      "Text testimonials only",
      "Basic testimonial display",
      "Platform branding included",
    ],
  },
  BASIC: {
    name: "Basic",
    price: 9,
    maxTestimonials: null, // Unlimited
    maxWidgets: 5,
    maxCollectionLinks: 10,
    allowsVideo: false,
    allowsAudio: true,
    allowsBrandingRemoval: false,
    allowsAnalytics: true,
    allowsPrioritySupport: false,
    allowsCustomDomain: false,
    allowsAutoCleanup: true,
    features: [
      "Unlimited text testimonials",
      "Audio testimonials",
      "Up to 5 widgets",
      "10 collection links",
      "Auto cleanup & formatting",
      "Basic analytics",
      "Email support",
    ],
  },
  PRO: {
    name: "Pro",
    price: 19,
    maxTestimonials: null, // Unlimited
    maxWidgets: null, // Unlimited
    maxCollectionLinks: null, // Unlimited
    allowsVideo: true,
    allowsAudio: true,
    allowsBrandingRemoval: true,
    allowsAnalytics: true,
    allowsPrioritySupport: true,
    allowsCustomDomain: true,
    allowsAutoCleanup: true,
    features: [
      "Unlimited testimonials",
      "Video & audio testimonials",
      "Unlimited widgets",
      "Unlimited collection links",
      "Remove platform branding",
      "Advanced analytics",
      "Priority support",
      "Custom domain support",
      "API access",
    ],
  },
};

/**
 * Get tier configuration by key
 */
export function getTierConfig(tier: SubscriptionTierKey): SubscriptionTier {
  return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.FREE;
}

/**
 * Get all tiers as an array for display
 */
export function getAllTiers(): Array<SubscriptionTier & { key: SubscriptionTierKey }> {
  return Object.entries(SUBSCRIPTION_TIERS).map(([key, value]) => ({
    key: key as SubscriptionTierKey,
    ...value,
  }));
}

/**
 * Check if a tier is higher than another
 */
export function isTierHigher(tier: SubscriptionTierKey, compareTo: SubscriptionTierKey): boolean {
  const tierOrder: Record<SubscriptionTierKey, number> = {
    FREE: 0,
    BASIC: 1,
    PRO: 2,
  };
  return tierOrder[tier] > tierOrder[compareTo];
}

/**
 * Get the next upgrade tier
 */
export function getNextTier(currentTier: SubscriptionTierKey): SubscriptionTierKey | null {
  const tierOrder: SubscriptionTierKey[] = ["FREE", "BASIC", "PRO"];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
    return null;
  }
  
  return tierOrder[currentIndex + 1];
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `$${price}/mo`;
}

/**
 * Get feature names that require specific tiers
 */
export type FeatureName = 
  | "video" 
  | "audio" 
  | "brandingRemoval" 
  | "analytics" 
  | "prioritySupport" 
  | "customDomain"
  | "autoCleanup";

export function getRequiredTierForFeature(feature: FeatureName): SubscriptionTierKey {
  const featureRequirements: Record<FeatureName, SubscriptionTierKey> = {
    video: "PRO",
    audio: "BASIC",
    brandingRemoval: "PRO",
    analytics: "BASIC",
    prioritySupport: "PRO",
    customDomain: "PRO",
    autoCleanup: "BASIC",
  };
  
  return featureRequirements[feature];
}


