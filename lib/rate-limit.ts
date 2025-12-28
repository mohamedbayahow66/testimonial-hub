/**
 * Simple in-memory rate limiter
 * Tracks requests by identifier (IP address) with configurable limits
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
let lastCleanup = Date.now();

function cleanupStaleEntries() {
  const now = Date.now();
  
  // Only cleanup once per minute
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }
  
  lastCleanup = now;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in the window */
  remaining: number;
  /** Time in milliseconds until the rate limit resets */
  resetIn: number;
  /** Error message if rate limited */
  message?: string;
}

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier for the client (usually IP address)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupStaleEntries();
  
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);
  
  // No existing entry or entry has expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }
  
  // Entry exists and hasn't expired
  const remaining = Math.max(0, config.maxRequests - entry.count - 1);
  const resetIn = Math.max(0, entry.resetTime - now);
  
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn,
      message: `Too many requests. Please try again in ${Math.ceil(resetIn / 60000)} minutes.`,
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    remaining,
    resetIn,
  };
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // Testimonial submissions: 3 per hour per IP
  TESTIMONIAL_SUBMISSION: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  // API calls: 100 per minute per IP
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Login attempts: 5 per 15 minutes per IP
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
};

/**
 * Get client IP from request headers
 * Handles various proxy configurations
 */
export function getClientIP(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get the first IP in the chain (original client)
    return forwardedFor.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback - in development this might be localhost
  return "127.0.0.1";
}


