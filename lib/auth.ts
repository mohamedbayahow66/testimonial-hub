import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";

/**
 * NextAuth.js v5 configuration
 * Using JWT strategy with credentials provider for email/password authentication
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate credentials
        const validatedFields = loginSchema.safeParse(credentials);
        
        if (!validatedFields.success) {
          return null;
        }

        const { email, password } = validatedFields.data;

        // Find user by email
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            businessName: true,
            passwordHash: true,
            subscriptionTier: true,
            onboardingCompleted: true,
          },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          return null;
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          businessName: user.businessName,
          subscriptionTier: user.subscriptionTier,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id as string;
        token.email = user.email as string;
        token.name = user.name as string;
        // Cast to access custom fields from credentials provider
        const customUser = user as typeof user & { 
          businessName: string; 
          subscriptionTier: string;
          onboardingCompleted: boolean;
        };
        token.businessName = customUser.businessName;
        token.subscriptionTier = customUser.subscriptionTier;
        token.onboardingCompleted = customUser.onboardingCompleted;
      }
      
      // Refresh onboarding status when session is updated
      if (trigger === "update" && token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { onboardingCompleted: true },
        });
        if (dbUser) {
          token.onboardingCompleted = dbUser.onboardingCompleted;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.businessName = token.businessName as string;
        session.user.subscriptionTier = token.subscriptionTier as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

