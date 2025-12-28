import { NextRequest, NextResponse } from "next/server";
import { validateUpload, checkTierRequirement, UPLOAD_CONFIG } from "@/lib/upload-validator";
import { saveFile } from "@/lib/upload";
import { db } from "@/lib/db";

/**
 * POST /api/upload/video
 * Upload a video file
 * Requires PRO subscription tier only
 */
export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user's subscription tier
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { subscriptionTier: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check tier requirement (PRO only)
    const tierCheck = checkTierRequirement(user.subscriptionTier, "video");
    if (!tierCheck.valid) {
      return NextResponse.json(
        { 
          error: tierCheck.error,
          errorCode: tierCheck.errorCode,
          upgradeRequired: true,
          requiredTier: "PRO",
        },
        { status: 403 }
      );
    }

    // Validate the file
    const validation = await validateUpload(file, "video", user.subscriptionTier);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: validation.error,
          errorCode: validation.errorCode,
        },
        { status: 400 }
      );
    }

    // Save the file
    const result = await saveFile(file, userId, file.name);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to upload file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: result.filename,
      type: "video",
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/video
 * Get upload configuration for video
 */
export async function GET() {
  const config = UPLOAD_CONFIG.video;
  return NextResponse.json({
    allowedFormats: config.allowedExtensions,
    maxSize: config.maxSize,
    maxSizeLabel: config.maxSizeLabel,
    maxDuration: config.maxDuration,
    maxDurationLabel: config.maxDurationLabel,
    requiredTier: config.requiredTier,
  });
}

