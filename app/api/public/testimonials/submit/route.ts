import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testimonialSubmissionSchema } from "@/lib/validations";
import { checkRateLimit, RATE_LIMITS, getClientIP } from "@/lib/rate-limit";
import { checkTestimonialLimit, LimitExceededError } from "@/lib/tier-enforcement";

/**
 * POST /api/public/testimonials/submit
 * Public endpoint for submitting testimonials
 * No authentication required - uses rate limiting for protection
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);
    
    // Check rate limit (3 submissions per hour per IP)
    const rateLimitResult = checkRateLimit(
      `testimonial-submit:${clientIP}`,
      RATE_LIMITS.TESTIMONIAL_SUBMISSION
    );
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: "rate_limit",
          message: rateLimitResult.message,
          resetIn: rateLimitResult.resetIn,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = testimonialSubmissionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "validation_error",
          message: "Please check your submission and try again",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      role,
      company,
      testimonial,
      rating,
      allowPublic,
      showFullName,
      website, // Honeypot field
      slug,
      submissionType = "TEXT",
      mediaUrl,
    } = validationResult.data;

    // Check honeypot field for spam
    if (website && website.length > 0) {
      // Silently reject spam submissions but return success to not reveal detection
      console.log("Spam submission detected from IP:", clientIP);
      return NextResponse.json({
        success: true,
        message: "Thank you for your testimonial!",
      });
    }

    // Find the collection link and verify it's active
    const collectionLink = await db.collectionLink.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        isActive: true,
      },
    });

    if (!collectionLink) {
      return NextResponse.json(
        { 
          error: "not_found",
          message: "Collection link not found",
        },
        { status: 404 }
      );
    }

    if (!collectionLink.isActive) {
      return NextResponse.json(
        { 
          error: "inactive",
          message: "This collection link is no longer accepting submissions",
        },
        { status: 400 }
      );
    }

    // Check if the business owner has reached their testimonial limit
    try {
      await checkTestimonialLimit(collectionLink.userId);
    } catch (error) {
      if (error instanceof LimitExceededError) {
        return NextResponse.json(
          { 
            error: "quota_exceeded",
            message: "The business owner has reached their testimonial limit. Please contact them directly.",
          },
          { status: 403 }
        );
      }
      throw error;
    }

    // Format the client name based on showFullName preference
    const displayName = showFullName ? name : formatInitials(name);

    // Create the testimonial record
    const newTestimonial = await db.testimonial.create({
      data: {
        userId: collectionLink.userId,
        collectionLinkId: collectionLink.id,
        clientName: name,
        clientEmail: email || null,
        clientRole: role || null,
        clientCompany: company || null,
        originalText: testimonial,
        displayText: testimonial, // Same as original for now
        rating,
        status: "PENDING",
        submissionType: submissionType || "TEXT",
        mediaUrl: mediaUrl || null,
        showFullName,
        allowPublic,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for your testimonial! It will be reviewed shortly.",
      testimonialId: newTestimonial.id,
    });
  } catch (error) {
    console.error("Error submitting testimonial:", error);
    return NextResponse.json(
      { 
        error: "server_error",
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}

/**
 * Format name to initials (e.g., "John Doe" -> "J.D.")
 */
function formatInitials(name: string): string {
  return name
    .split(" ")
    .filter(part => part.length > 0)
    .map(part => part[0].toUpperCase() + ".")
    .join("");
}


