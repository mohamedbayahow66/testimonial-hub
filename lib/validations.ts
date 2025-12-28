import { z } from "zod";

/**
 * Signup form validation schema
 */
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),
});

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Testimonial creation schema
 */
export const testimonialSchema = z.object({
  originalText: z
    .string()
    .min(10, "Testimonial must be at least 10 characters")
    .max(2000, "Testimonial must be less than 2000 characters"),
  clientName: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be less than 100 characters"),
  clientEmail: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
  clientRole: z
    .string()
    .max(100, "Role must be less than 100 characters")
    .optional(),
});

/**
 * Widget creation schema
 */
export const widgetSchema = z.object({
  name: z
    .string()
    .min(2, "Widget name must be at least 2 characters")
    .max(100, "Widget name must be less than 100 characters"),
  widgetType: z.enum(["GRID", "CAROUSEL", "LIST", "SINGLE"]),
  styling: z.object({
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    fontFamily: z.string().optional(),
    borderRadius: z.string().optional(),
  }).optional(),
});

/**
 * Collection link schema
 */
export const collectionLinkSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

/**
 * Public testimonial submission schema
 * Used for the public submission form
 */
export const testimonialSubmissionSchema = z.object({
  // Required fields
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  testimonial: z
    .string()
    .min(20, "Testimonial must be at least 20 characters")
    .max(500, "Testimonial must be less than 500 characters"),
  rating: z
    .number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating must be at most 5 stars"),
  
  // Optional fields
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  role: z
    .string()
    .max(100, "Role must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  
  // Permission flags
  allowPublic: z.boolean().default(true),
  showFullName: z.boolean().default(true),
  
  // Spam prevention (honeypot field - must be empty)
  website: z
    .string()
    .max(0, "This field should be empty")
    .optional()
    .or(z.literal("")),
  
  // Collection link reference
  slug: z.string().min(1, "Collection link is required"),
  
  // Media fields for image/audio/video testimonials
  submissionType: z
    .enum(["TEXT", "IMAGE", "AUDIO", "VIDEO"])
    .default("TEXT"),
  mediaUrl: z
    .union([
      z.string().url("Invalid media URL"),
      z.string().length(0),
      z.null(),
      z.undefined(),
    ])
    .optional(),
});

// Type exports for use in forms
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type WidgetInput = z.infer<typeof widgetSchema>;
export type CollectionLinkInput = z.infer<typeof collectionLinkSchema>;
export type TestimonialSubmissionInput = z.infer<typeof testimonialSubmissionSchema>;

