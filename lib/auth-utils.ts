import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Get the current session on the server side
 * Returns null if no session exists
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user from the session
 * Returns null if no user is logged in
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Require authentication for a server component or action
 * Redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  return session.user;
}

/**
 * Check if user is authenticated without redirecting
 */
export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscription() {
  const user = await getCurrentUser();
  return user?.subscriptionTier ?? "FREE";
}


