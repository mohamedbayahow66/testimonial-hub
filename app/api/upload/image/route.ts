import { NextRequest, NextResponse } from "next/server";
import { validateUpload, UPLOAD_CONFIG } from "@/lib/upload-validator";
import { saveFile } from "@/lib/upload";

/**
 * POST /api/upload/image
 * Upload an image file
 * No tier restriction - available to all users
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

    // Validate the file
    const validation = await validateUpload(file, "image");
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
      type: "image",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload/image
 * Get upload configuration for images
 */
export async function GET() {
  const config = UPLOAD_CONFIG.image;
  return NextResponse.json({
    allowedFormats: config.allowedExtensions,
    maxSize: config.maxSize,
    maxSizeLabel: config.maxSizeLabel,
    maxDimensions: config.maxDimensions,
    requiredTier: config.requiredTier,
  });
}

