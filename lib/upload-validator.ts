/**
 * File Upload Validation Utility
 * Validates file type, size, and format for image, audio, and video uploads
 */

// File type configurations
export const UPLOAD_CONFIG = {
  image: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    maxSize: 5 * 1024 * 1024, // 5 MB
    maxSizeLabel: "5 MB",
    maxDimensions: { width: 4000, height: 4000 },
    requiredTier: "FREE" as const,
  },
  audio: {
    allowedMimeTypes: ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a"],
    allowedExtensions: [".mp3", ".wav", ".m4a"],
    maxSize: 10 * 1024 * 1024, // 10 MB
    maxSizeLabel: "10 MB",
    maxDuration: 5 * 60, // 5 minutes in seconds
    maxDurationLabel: "5 minutes",
    requiredTier: "BASIC" as const,
  },
  video: {
    allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
    allowedExtensions: [".mp4", ".webm", ".mov"],
    maxSize: 50 * 1024 * 1024, // 50 MB
    maxSizeLabel: "50 MB",
    maxDuration: 2 * 60, // 2 minutes in seconds
    maxDurationLabel: "2 minutes",
    requiredTier: "PRO" as const,
  },
} as const;

export type MediaType = keyof typeof UPLOAD_CONFIG;

// Magic number signatures for file type validation
const MAGIC_NUMBERS: Record<string, string[]> = {
  // Images
  "image/jpeg": ["ffd8ff"],
  "image/png": ["89504e47"],
  "image/webp": ["52494646"], // RIFF header, need to check for WEBP
  // Audio
  "audio/mpeg": ["494433", "fffb", "fff3", "fff2"], // ID3 or MPEG frames
  "audio/wav": ["52494646"], // RIFF header
  "audio/x-wav": ["52494646"],
  "audio/mp4": ["00000"], // ftyp box
  "audio/x-m4a": ["00000"],
  // Video
  "video/mp4": ["00000"], // ftyp box
  "video/webm": ["1a45dfa3"],
  "video/quicktime": ["00000"], // ftyp box with qt brand
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: 
    | "INVALID_TYPE"
    | "FILE_TOO_LARGE"
    | "INVALID_FORMAT"
    | "TIER_REQUIRED"
    | "DURATION_TOO_LONG"
    | "DIMENSIONS_TOO_LARGE";
}

/**
 * Validate file extension
 */
export function validateExtension(filename: string, mediaType: MediaType): boolean {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
  return UPLOAD_CONFIG[mediaType].allowedExtensions.includes(ext);
}

/**
 * Validate MIME type
 */
export function validateMimeType(mimeType: string, mediaType: MediaType): boolean {
  return UPLOAD_CONFIG[mediaType].allowedMimeTypes.includes(mimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(size: number, mediaType: MediaType): ValidationResult {
  const config = UPLOAD_CONFIG[mediaType];
  if (size > config.maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed (${config.maxSizeLabel})`,
      errorCode: "FILE_TOO_LARGE",
    };
  }
  return { valid: true };
}

/**
 * Check subscription tier requirement
 */
export function checkTierRequirement(
  userTier: string,
  mediaType: MediaType
): ValidationResult {
  const requiredTier = UPLOAD_CONFIG[mediaType].requiredTier;
  
  const tierOrder = ["FREE", "BASIC", "PRO"];
  const userTierIndex = tierOrder.indexOf(userTier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  
  if (userTierIndex < requiredTierIndex) {
    const tierNames: Record<string, string> = {
      FREE: "Free",
      BASIC: "Basic",
      PRO: "Pro",
    };
    return {
      valid: false,
      error: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploads require ${tierNames[requiredTier]} plan or higher`,
      errorCode: "TIER_REQUIRED",
    };
  }
  
  return { valid: true };
}

/**
 * Validate file headers (magic numbers) for security
 * This validates the actual file content, not just the extension
 */
export async function validateFileHeaders(
  file: File | Buffer,
  expectedMimeType: string
): Promise<boolean> {
  try {
    let buffer: ArrayBuffer;
    
    if (file instanceof File) {
      // Read first 12 bytes for magic number check
      buffer = await file.slice(0, 12).arrayBuffer();
    } else {
      buffer = file.slice(0, 12).buffer;
    }
    
    const hex = Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    
    const signatures = MAGIC_NUMBERS[expectedMimeType];
    if (!signatures) return true; // No signature to check
    
    return signatures.some((sig) => hex.startsWith(sig));
  } catch {
    return false;
  }
}

/**
 * Comprehensive file validation for uploads
 */
export async function validateUpload(
  file: File,
  mediaType: MediaType,
  userTier?: string
): Promise<ValidationResult> {
  // 1. Check file extension
  if (!validateExtension(file.name, mediaType)) {
    const config = UPLOAD_CONFIG[mediaType];
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${config.allowedExtensions.join(", ")}`,
      errorCode: "INVALID_TYPE",
    };
  }
  
  // 2. Check MIME type
  if (!validateMimeType(file.type, mediaType)) {
    const config = UPLOAD_CONFIG[mediaType];
    return {
      valid: false,
      error: `Invalid file format. Allowed: ${config.allowedExtensions.join(", ")}`,
      errorCode: "INVALID_FORMAT",
    };
  }
  
  // 3. Check file size
  const sizeResult = validateFileSize(file.size, mediaType);
  if (!sizeResult.valid) {
    return sizeResult;
  }
  
  // 4. Check subscription tier (if userTier provided)
  if (userTier) {
    const tierResult = checkTierRequirement(userTier, mediaType);
    if (!tierResult.valid) {
      return tierResult;
    }
  }
  
  // 5. Validate file headers
  const headersValid = await validateFileHeaders(file, file.type);
  if (!headersValid) {
    return {
      valid: false,
      error: "File appears to be corrupted or has invalid format",
      errorCode: "INVALID_FORMAT",
    };
  }
  
  return { valid: true };
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get accept string for file input
 */
export function getAcceptString(mediaType: MediaType): string {
  const config = UPLOAD_CONFIG[mediaType];
  return [...config.allowedMimeTypes, ...config.allowedExtensions].join(",");
}

/**
 * Client-side validation (for immediate feedback)
 */
export function clientValidateFile(
  file: File,
  mediaType: MediaType
): ValidationResult {
  // Check extension
  if (!validateExtension(file.name, mediaType)) {
    const config = UPLOAD_CONFIG[mediaType];
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${config.allowedExtensions.join(", ")}`,
      errorCode: "INVALID_TYPE",
    };
  }
  
  // Check size
  const sizeResult = validateFileSize(file.size, mediaType);
  if (!sizeResult.valid) {
    return sizeResult;
  }
  
  return { valid: true };
}

