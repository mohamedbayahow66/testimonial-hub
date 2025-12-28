import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

/**
 * Extend NextAuth types to include custom user properties
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      businessName: string;
      subscriptionTier: string;
      onboardingCompleted: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    businessName: string;
    subscriptionTier: string;
    onboardingCompleted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    businessName: string;
    subscriptionTier: string;
    onboardingCompleted: boolean;
  }
}

