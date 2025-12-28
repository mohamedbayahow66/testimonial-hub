"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { SubscriptionTierKey } from "@/lib/config/subscriptions";
import { Plus, Loader2 } from "lucide-react";

interface CreateCollectionLinkButtonProps {
  isAtLimit: boolean;
  tier: SubscriptionTierKey;
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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleClick = () => {
    if (isAtLimit) {
      setShowUpgradePrompt(true);
    } else {
      setIsOpen(true);
    }
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

    setIsLoading(true);

    try {
      const response = await fetch("/api/collection-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a limit error
        if (response.status === 403 && data.limitType) {
          setIsOpen(false);
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(data.error || "Failed to create link");
      }

      toast({
        title: "Link created!",
        description: "Your collection link has been created successfully.",
      });

      setIsOpen(false);
      setTitle("");
      setDescription("");
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleClick}>
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection Link</DialogTitle>
            <DialogDescription>
              Create a new link to share with customers for collecting testimonials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Customer Feedback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this collection link"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
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


