"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { SubscriptionTierKey } from "@/lib/config/subscriptions";
import { Plus, Loader2, Check, X, Copy } from "lucide-react";

interface CreateCollectionLinkButtonProps {
  isAtLimit: boolean;
  tier: SubscriptionTierKey;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Generate slug from title
function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 30);
}

export function CreateCollectionLinkButton({ 
  isAtLimit, 
  tier 
}: CreateCollectionLinkButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [isActiveByDefault, setIsActiveByDefault] = useState(true);
  
  // Slug validation
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  
  // Success state
  const [createdLink, setCreatedLink] = useState<{ slug: string; url: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const debouncedSlug = useDebounce(customSlug, 500);

  // Get the preview slug (custom or auto-generated)
  const previewSlug = customSlug || (title ? generateSlugFromTitle(title) : "your-link");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = `${baseUrl}/submit/${previewSlug}`;

  // Check slug availability
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      setSlugError(null);
      return;
    }

    // Validate format first
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    if (!slugRegex.test(slug)) {
      setSlugAvailable(false);
      setSlugError("Use lowercase letters, numbers, and hyphens only (3-50 chars)");
      return;
    }

    setIsCheckingSlug(true);
    setSlugError(null);

    try {
      const response = await fetch(`/api/collection-links/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();

      if (data.error && !data.available) {
        setSlugAvailable(false);
        setSlugError(data.error);
      } else {
        setSlugAvailable(data.available);
        setSlugError(data.available ? null : "This slug is already taken");
      }
    } catch {
      setSlugError("Failed to check availability");
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Check slug when debounced value changes
  useEffect(() => {
    if (debouncedSlug) {
      checkSlugAvailability(debouncedSlug);
    } else {
      setSlugAvailable(null);
      setSlugError(null);
    }
  }, [debouncedSlug, checkSlugAvailability]);

  const handleClick = () => {
    if (isAtLimit) {
      setShowUpgradePrompt(true);
    } else {
      setIsOpen(true);
    }
  };

  const handleSlugChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setCustomSlug(sanitized);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your collection link.",
        variant: "destructive",
      });
      return;
    }

    if (title.length > 100) {
      toast({
        title: "Title too long",
        description: "Title must be 100 characters or less.",
        variant: "destructive",
      });
      return;
    }

    if (description.length > 300) {
      toast({
        title: "Description too long",
        description: "Description must be 300 characters or less.",
        variant: "destructive",
      });
      return;
    }

    // If custom slug is provided, validate it
    if (customSlug && (slugAvailable === false || slugError)) {
      toast({
        title: "Invalid slug",
        description: slugError || "Please fix the slug before creating.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/collection-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description,
          customSlug: customSlug || undefined,
          isActive: isActiveByDefault,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.limitType) {
          setIsOpen(false);
          setShowUpgradePrompt(true);
          return;
        }
        if (response.status === 429) {
          throw new Error(data.error || "Rate limit exceeded. Please try again later.");
        }
        throw new Error(data.error || "Failed to create link");
      }

      // Show success with the created link
      const createdUrl = `${baseUrl}/submit/${data.collectionLink.slug}`;
      setCreatedLink({
        slug: data.collectionLink.slug,
        url: createdUrl,
      });

      toast({
        title: "Link created!",
        description: "Your collection link has been created successfully.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create collection link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdLink) return;
    
    try {
      await navigator.clipboard.writeText(createdLink.url);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset form after a delay
    setTimeout(() => {
      setTitle("");
      setDescription("");
      setCustomSlug("");
      setIsActiveByDefault(true);
      setSlugAvailable(null);
      setSlugError(null);
      setCreatedLink(null);
      setCopied(false);
    }, 200);
  };

  const handleCreateAnother = () => {
    setTitle("");
    setDescription("");
    setCustomSlug("");
    setIsActiveByDefault(true);
    setSlugAvailable(null);
    setSlugError(null);
    setCreatedLink(null);
    setCopied(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => open ? setIsOpen(true) : handleClose()}>
        <DialogTrigger asChild>
          <Button onClick={handleClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          {createdLink ? (
            // Success state
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  Link Created Successfully!
                </DialogTitle>
                <DialogDescription>
                  Share this link with your customers to collect testimonials.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Your Collection Link</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={createdLink.url}
                      className="font-mono text-sm"
                    />
                    <Button
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
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCopyLink}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {copied ? "Copied!" : "Copy Link to Clipboard"}
                </Button>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Done
                </Button>
                <Button variant="secondary" onClick={handleCreateAnother}>
                  Create Another Link
                </Button>
              </DialogFooter>
            </>
          ) : (
            // Create form
            <>
              <DialogHeader>
                <DialogTitle>Create Collection Link</DialogTitle>
                <DialogDescription>
                  Create a new link to share with customers for collecting testimonials.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Title Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="title">Title *</Label>
                    <span className={`text-xs ${title.length > 100 ? "text-red-500" : "text-muted-foreground"}`}>
                      {title.length}/100
                    </span>
                  </div>
                  <Input
                    id="title"
                    placeholder="e.g., Share your experience with us"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    This title appears at the top of the submission page
                  </p>
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <span className={`text-xs ${description.length > 300 ? "text-red-500" : "text-muted-foreground"}`}>
                      {description.length}/300
                    </span>
                  </div>
                  <Textarea
                    id="description"
                    placeholder="Tell customers what kind of feedback you're looking for..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={300}
                    rows={3}
                  />
                </div>

                {/* Custom Slug Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slug">Custom URL Slug (Optional)</Label>
                    {customSlug && (
                      <span className="flex items-center gap-1 text-xs">
                        {isCheckingSlug ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : slugAvailable === true ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">Available</span>
                          </>
                        ) : slugAvailable === false ? (
                          <>
                            <X className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">Taken</span>
                          </>
                        ) : null}
                      </span>
                    )}
                  </div>
                  <Input
                    id="slug"
                    placeholder="my-custom-link"
                    value={customSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    maxLength={50}
                  />
                  {slugError && (
                    <p className="text-xs text-red-500">{slugError}</p>
                  )}
                  <div className="rounded-md bg-muted p-2">
                    <p className="text-xs text-muted-foreground">Preview:</p>
                    <p className="text-sm font-mono break-all">{fullUrl}</p>
                  </div>
                </div>

                {/* Active by Default Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={isActiveByDefault}
                    onCheckedChange={(checked: boolean | "indeterminate") => setIsActiveByDefault(checked === true)}
                  />
                  <Label htmlFor="active" className="text-sm font-normal cursor-pointer">
                    Active by default (link will accept submissions immediately)
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={isLoading || (!!customSlug && slugAvailable === false)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Link"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        currentTier={tier}
        limitType="collectionLinks"
        reason="You've reached your collection link limit"
      />
    </>
  );
}
