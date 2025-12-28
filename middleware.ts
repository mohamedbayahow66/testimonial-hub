import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Middleware configuration for route protection
 * - Protects /dashboard/* routes (requires authentication)
 * - Redirects authenticated users away from auth pages
 * - Redirects users with incomplete onboarding to /onboarding/welcome
 */
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  
  // Define route patterns
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || 
                      nextUrl.pathname.startsWith("/signup");
  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
  const isOnboardingRoute = nextUrl.pathname.startsWith("/onboarding");
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isPublicRoute = nextUrl.pathname === "/" || 
                        nextUrl.pathname.startsWith("/collect/") ||
                        nextUrl.pathname.startsWith("/submit/") ||
                        nextUrl.pathname.startsWith("/w/");

  // Allow API routes to pass through
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    // Check if onboarding is completed
    if (user && !user.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding/welcome", nextUrl));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard routes - redirect to login if not authenticated
  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in but hasn't completed onboarding
  // and is trying to access dashboard, redirect to onboarding
  if (isDashboardRoute && isLoggedIn && user && !user.onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding/welcome", nextUrl));
  }

  // Protect onboarding routes - redirect to login if not authenticated
  if (isOnboardingRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // If user has completed onboarding and tries to access onboarding pages
  // redirect to dashboard
  if (isOnboardingRoute && isLoggedIn && user?.onboardingCompleted) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    // Match all routes except static files and _next
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
