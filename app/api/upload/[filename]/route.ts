import { NextRequest, NextResponse } from "next/server";
import { deleteFile, parseUploadUrl } from "@/lib/upload";

/**
 * DELETE /api/upload/[filename]
 * Delete an uploaded file (cleanup)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    // Get userId from query string or body
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Delete the file
    const result = await deleteFile(userId, filename);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

