/**
 * Local File Storage Utility
 * Handles file uploads to local storage with unique naming and directory structure
 */

import { writeFile, mkdir, unlink, access } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Base upload directory
const UPLOAD_BASE_DIR = "public/uploads/testimonials";

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Generate a unique filename
 * Format: timestamp-uuid.extension
 */
export function generateUniqueFilename(originalFilename: string): string {
  const ext = path.extname(originalFilename).toLowerCase();
  const timestamp = Date.now();
  const uuid = uuidv4().split("-")[0]; // Use first segment for shorter name
  return `${timestamp}-${uuid}${ext}`;
}

/**
 * Get the upload directory for a user
 */
export function getUserUploadDir(userId: string): string {
  return path.join(process.cwd(), UPLOAD_BASE_DIR, userId);
}

/**
 * Ensure the upload directory exists
 */
export async function ensureUploadDir(userId: string): Promise<void> {
  const dir = getUserUploadDir(userId);
  try {
    await access(dir);
  } catch {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Save a file to local storage
 */
export async function saveFile(
  file: File | Buffer,
  userId: string,
  originalFilename: string
): Promise<UploadResult> {
  try {
    // Ensure directory exists
    await ensureUploadDir(userId);
    
    // Generate unique filename
    const filename = generateUniqueFilename(originalFilename);
    const filePath = path.join(getUserUploadDir(userId), filename);
    
    // Convert File to Buffer if needed
    let buffer: Buffer;
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }
    
    // Write file
    await writeFile(filePath, buffer);
    
    // Return public URL
    const publicUrl = `/uploads/testimonials/${userId}/${filename}`;
    
    return {
      success: true,
      url: publicUrl,
      filename,
    };
  } catch (error) {
    console.error("Error saving file:", error);
    return {
      success: false,
      error: "Failed to save file",
    };
  }
}

/**
 * Delete a file from local storage
 */
export async function deleteFile(
  userId: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const filePath = path.join(getUserUploadDir(userId), filename);
    await unlink(filePath);
    return { success: true };
  } catch (error) {
    console.error("Error deleting file:", error);
    return {
      success: false,
      error: "Failed to delete file",
    };
  }
}

/**
 * Get the full file path for a file
 */
export function getFilePath(userId: string, filename: string): string {
  return path.join(getUserUploadDir(userId), filename);
}

/**
 * Extract userId and filename from a public URL
 */
export function parseUploadUrl(url: string): { userId: string; filename: string } | null {
  const match = url.match(/\/uploads\/testimonials\/([^\/]+)\/([^\/]+)$/);
  if (!match) return null;
  return {
    userId: match[1],
    filename: match[2],
  };
}

/**
 * Check if a file exists
 */
export async function fileExists(userId: string, filename: string): Promise<boolean> {
  try {
    await access(getFilePath(userId, filename));
    return true;
  } catch {
    return false;
  }
}

