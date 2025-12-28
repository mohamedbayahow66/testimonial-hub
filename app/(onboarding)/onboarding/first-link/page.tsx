"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { useToast } from "@/hooks/use-toast";
import { 
  Link2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function FirstLinkPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [collectionLink, setCollectionLink] = useState<{
    slug: string;
    title: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = collectionLink ? `${baseUrl}/collect/${collectionLink.slug}` : "";

  // Auto-create collection link on mount
  useEffect(() => {
    if (!collectionLink && !isCreating) {
      createCollectionLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCollectionLink = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/collection-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Share your experience with ${session?.user?.businessName || "us"}`,
          description: "We'd love to hear about your experience. Your feedback helps us improve and helps others make informed decisions.",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create collection link");
      }

      const data = await response.json();
      setCollectionLink(data.collectionLink);
    } catch (error) {
      console.error("Error creating collection link:", error);
      toast({
        title: "Error",
        description: "Failed to create collection link. You can create one from the dashboard.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The collection link has been copied to your clipboard.",
        variant: "success",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      // Update session to reflect completed onboarding
      await update();

      toast({
        title: "Setup complete!",
        description: "Welcome to Testimonial Hub. Let's start collecting testimonials!",
        variant: "success",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/onboarding/branding");
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator currentStep={3} />

      <Card className="border-2">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Link2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Your First Collection Link</CardTitle>
          <CardDescription>
            Share this link with customers to start collecting testimonials
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isCreating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Creating your collection link...</p>
            </div>
          ) : collectionLink ? (
            <>
              {/* Link display */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your collection link:</label>
                <div className="flex gap-2">
                  <Input
                    value={fullUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(fullUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* How it works */}
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How it works
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                    Share this link with your customers via email, social media, or your website
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                    Customers click the link and submit their testimonial through a simple form
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
                    Review and approve testimonials from your dashboard
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">4</span>
                    Display approved testimonials on your website using widgets
                  </li>
                </ol>
              </div>

              {/* Tips */}
              <div className="rounded-lg border bg-card p-4">
                <h3 className="font-medium mb-2">Pro tips:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Send the link to your happiest customers first</li>
                  <li>• Add the link to your email signature</li>
                  <li>• Create different links for different campaigns</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No collection link created yet.
              </p>
              <Button onClick={createCollectionLink}>
                Create Collection Link
              </Button>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleBack}
              disabled={isLoading}
              className="sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={handleComplete}
              disabled={isLoading || isCreating}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finishing...
                </>
              ) : (
                <>
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

