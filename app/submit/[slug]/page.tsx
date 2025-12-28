import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TestimonialForm } from "@/components/public/testimonial-form";
import { Metadata } from "next";

interface SubmitPageProps {
  params: { slug: string };
}

/**
 * Generate metadata for the submission page
 */
export async function generateMetadata({ params }: SubmitPageProps): Promise<Metadata> {
  const { slug } = params;

  const collectionLink = await db.collectionLink.findUnique({
    where: { slug },
    include: {
      user: {
        select: { businessName: true },
      },
    },
  });

  if (!collectionLink || !collectionLink.isActive) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: `${collectionLink.title} - ${collectionLink.user.businessName}`,
    description: collectionLink.description || `Share your experience with ${collectionLink.user.businessName}`,
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Public testimonial submission page
 * Accessible without authentication at /submit/[slug]
 */
export default async function SubmitPage({ params }: SubmitPageProps) {
  const { slug } = params;

  // Fetch collection link with user data
  const collectionLink = await db.collectionLink.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          id: true,
          businessName: true,
          brandingSettings: true,
          subscriptionTier: true,
        },
      },
    },
  });

  // Return 404 if not found
  if (!collectionLink) {
    notFound();
  }

  // Return 404 if link is inactive
  if (!collectionLink.isActive) {
    notFound();
  }

  // Increment click count (fire and forget)
  db.collectionLink.update({
    where: { id: collectionLink.id },
    data: { clickCount: { increment: 1 } },
  }).catch((err) => {
    console.error("Failed to increment click count:", err);
  });

  // Parse branding settings if stored as JSON string
  let brandingSettings = null;
  if (collectionLink.user.brandingSettings) {
    try {
      brandingSettings = typeof collectionLink.user.brandingSettings === "string"
        ? JSON.parse(collectionLink.user.brandingSettings)
        : collectionLink.user.brandingSettings;
    } catch {
      brandingSettings = null;
    }
  }

  // Prepare data for the form
  const formData = {
    slug: collectionLink.slug,
    title: collectionLink.title,
    description: collectionLink.description,
    businessName: collectionLink.user.businessName,
    userId: collectionLink.user.id,
    ownerTier: collectionLink.user.subscriptionTier,
    branding: brandingSettings,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TestimonialForm collectionLink={formData} />
    </div>
  );
}


