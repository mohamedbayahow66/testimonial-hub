import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const brandingSchema = z.object({
  businessName: z.string().min(2).max(100),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  logoUrl: z.string().url().nullable().optional(),
});

/**
 * POST /api/onboarding/branding
 * Save user's branding settings during onboarding
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
    const validatedFields = brandingSchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validatedFields.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { businessName, primaryColor, logoUrl } = validatedFields.data;

    // Update user with branding settings
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        businessName,
        brandingSettings: {
          logoUrl: logoUrl || null,
          primaryColor,
          companyName: businessName,
        },
      },
      select: {
        id: true,
        businessName: true,
        brandingSettings: true,
      },
    });

    return NextResponse.json({
      message: "Branding settings saved successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error saving branding:", error);
    return NextResponse.json(
      { error: "Failed to save branding settings" },
      { status: 500 }
    );
  }
}

