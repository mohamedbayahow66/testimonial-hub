"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Copy, 
  ExternalLink, 
  MoreHorizontal, 
  MousePointerClick,
  Trash2,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Check,
  Loader2
} from "lucide-react";

interface CollectionLinkCardProps {
  link: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    isActive: boolean;
    clickCount: number;
    createdAt: Date;
  };
}

export function CollectionLinkCard({ link }: CollectionLinkCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = `${baseUrl}/collect/${link.slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The collection link has been copied to your clipboard.",
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

  const handleOpenLink = () => {
    window.open(fullUrl, "_blank");
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const response = await fetch(`/api/collection-links/${link.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !link.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update link");
      }

      toast({
        title: link.isActive ? "Link deactivated" : "Link activated",
        description: link.isActive 
          ? "Customers can no longer submit testimonials through this link."
          : "Customers can now submit testimonials through this link.",
      });

      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update link status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/collection-links/${link.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      toast({
        title: "Link deleted",
        description: "The collection link has been permanently deleted.",
      });

      setShowDeleteDialog(false);
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-4 rounded-lg border bg-card space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{link.title}</span>
              <Badge variant={link.isActive ? "success" : "secondary"}>
                {link.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {link.description && (
              <p className="text-sm text-muted-foreground">
                {link.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenLink}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <Edit className="mr-2 h-4 w-4" />
                Edit Link
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Eye className="mr-2 h-4 w-4" />
                View Submissions
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleToggleActive}
                disabled={isToggling}
              >
                {link.isActive ? (
                  <>
                    <ToggleLeft className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <ToggleRight className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            readOnly 
            value={fullUrl}
            className="font-mono text-sm"
          />
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleOpenLink}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MousePointerClick className="h-4 w-4" />
            {link.clickCount} clicks
          </span>
          <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection Link?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              collection link and customers will no longer be able to submit
              testimonials through it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

