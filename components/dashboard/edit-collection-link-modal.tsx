"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Info } from "lucide-react";

interface EditCollectionLinkModalProps {
  link: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCollectionLinkModal({ 
  link, 
  open, 
  onOpenChange 
}: EditCollectionLinkModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState(link.title);
  const [description, setDescription] = useState(link.description || "");
  const [isActive, setIsActive] = useState(link.isActive);

  // Reset form when link changes
  useEffect(() => {
    setTitle(link.title);
    setDescription(link.description || "");
    setIsActive(link.isActive);
  }, [link]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = `${baseUrl}/submit/${link.slug}`;

  const handleSave = async () => {
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

    setIsLoading(true);

    try {
      const response = await fetch(`/api/collection-links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(), 
          description: description.trim() || null,
          isActive,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update link");
      }

      toast({
        title: "Link updated!",
        description: "Your collection link has been updated successfully.",
      });

      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setTitle(link.title);
    setDescription(link.description || "");
    setIsActive(link.isActive);
    onOpenChange(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Collection Link</DialogTitle>
          <DialogDescription>
            Update your collection link settings. The URL cannot be changed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Title Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-title">Title *</Label>
              <span className={`text-xs ${title.length > 100 ? "text-red-500" : "text-muted-foreground"}`}>
                {title.length}/100
              </span>
            </div>
            <Input
              id="edit-title"
              placeholder="e.g., Share your experience with us"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <span className={`text-xs ${description.length > 300 ? "text-red-500" : "text-muted-foreground"}`}>
                {description.length}/300
              </span>
            </div>
            <Textarea
              id="edit-description"
              placeholder="Tell customers what kind of feedback you're looking for..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
            />
          </div>

          {/* Slug (Read-only) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="edit-slug">URL Slug</Label>
              <Lock className="h-3 w-3 text-muted-foreground" />
            </div>
            <Input
              id="edit-slug"
              value={link.slug}
              disabled
              className="font-mono text-sm bg-muted"
            />
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              <span>
                The URL slug cannot be changed as it would break any links you've already shared.
              </span>
            </div>
            <div className="rounded-md bg-muted p-2">
              <p className="text-xs text-muted-foreground">Full URL:</p>
              <p className="text-sm font-mono break-all">{fullUrl}</p>
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-active" className="cursor-pointer">Active Status</Label>
              <p className="text-xs text-muted-foreground">
                {isActive 
                  ? "Accepting testimonial submissions" 
                  : "Not accepting submissions"}
              </p>
            </div>
            <Switch
              id="edit-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Timestamps */}
          <div className="rounded-md bg-muted/50 p-3 space-y-1 text-xs text-muted-foreground">
            <p>Created: {formatDate(link.createdAt)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

