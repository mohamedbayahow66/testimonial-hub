import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/onboarding/complete
 * Mark user's onboarding as completed
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

    // Update user to mark onboarding as completed
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        onboardingCompleted: true,
      },
      select: {
        id: true,
        email: true,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({
      message: "Onboarding completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}


