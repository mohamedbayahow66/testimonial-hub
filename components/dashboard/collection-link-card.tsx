"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { EditCollectionLinkModal } from "./edit-collection-link-modal";
import { 
  Copy, 
  ExternalLink, 
  MoreHorizontal, 
  MousePointerClick,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  Check,
  Loader2,
  MessageSquare,
  TrendingUp,
  Mail,
  Share2,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Twitter/X icon component
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// WhatsApp icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

interface CollectionLinkCardProps {
  link: {
    id: string;
    slug: string;
    title: string;
    description: string | null;
    isActive: boolean;
    clickCount: number;
    createdAt: Date;
    testimonialCount?: number;
    lastSubmissionAt?: Date | null;
  };
}

export function CollectionLinkCard({ link }: CollectionLinkCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullUrl = `${baseUrl}/submit/${link.slug}`;

  // Calculate conversion rate
  const testimonialCount = link.testimonialCount || 0;
  const conversionRate = link.clickCount > 0 
    ? Math.round((testimonialCount / link.clickCount) * 100) 
    : 0;

  // Format relative date
  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

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
    // If deactivating, show confirmation dialog
    if (link.isActive) {
      setShowDeactivateDialog(true);
      return;
    }
    
    // If activating, proceed directly
    await performToggle();
  };

  const performToggle = async () => {
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

      setShowDeactivateDialog(false);
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

  const handleDelete = async (type: "soft" | "hard") => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/collection-links/${link.id}?deleteType=${type}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      toast({
        title: type === "soft" ? "Link deactivated" : "Link deleted",
        description: type === "soft" 
          ? "The link has been deactivated but data is preserved."
          : "The collection link has been permanently deleted.",
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

  // Share handlers
  const handleShareEmail = () => {
    const subject = encodeURIComponent("Share your testimonial");
    const body = encodeURIComponent(`Hi,\n\nI'd love to hear your feedback! Please share your experience using this link:\n\n${fullUrl}\n\nThank you!`);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`Hi! I'd love to hear your feedback. Please share your experience here: ${fullUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Share your testimonial with us! ${fullUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  return (
    <>
      <div className={`p-4 rounded-lg border bg-card space-y-3 transition-opacity ${!link.isActive ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium truncate">{link.title}</span>
              <Badge variant={link.isActive ? "success" : "secondary"}>
                {link.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {link.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {link.description.length > 100 
                  ? `${link.description.substring(0, 100)}...` 
                  : link.description}
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
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
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Link
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
        
        {/* URL with copy button */}
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

        {/* Analytics section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <MousePointerClick className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">{link.clickCount} clicks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">{testimonialCount} testimonials</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-muted-foreground">{conversionRate}% conversion</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-muted-foreground">
              {link.lastSubmissionAt 
                ? formatRelativeDate(link.lastSubmissionAt)
                : "Never used"}
            </span>
          </div>
        </div>

        {/* Conversion progress bar */}
        {link.clickCount > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conversion Rate</span>
              <span>{conversionRate}%</span>
            </div>
            <Progress value={conversionRate} className="h-1.5" />
          </div>
        )}

        {/* Footer with date and share buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            Created {formatRelativeDate(link.createdAt)}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">Share:</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShareEmail}
              title="Share via Email"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShareWhatsApp}
              title="Share via WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShareTwitter}
              title="Share via X/Twitter"
            >
              <TwitterIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCollectionLinkModal
        link={link}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />

      {/* Deactivate Confirmation Dialog */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Deactivate Collection Link?
            </AlertDialogTitle>
            <AlertDialogDescription>
              New testimonial submissions will be blocked while this link is inactive.
              Customers visiting this link will see a message that submissions are currently closed.
              You can reactivate it at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performToggle}
              disabled={isToggling}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isToggling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate Link"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection Link?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This link has collected <strong>{testimonialCount} testimonials</strong> and received <strong>{link.clickCount} clicks</strong>.</p>
                <p>Choose how you want to proceed:</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div 
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${deleteType === "soft" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50"}`}
              onClick={() => setDeleteType("soft")}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deleteType === "soft" ? "border-primary" : "border-muted-foreground"}`}>
                  {deleteType === "soft" && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="font-medium">Deactivate Only (Recommended)</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-6">
                Keep all testimonials and data. Link will stop accepting new submissions.
              </p>
            </div>
            <div 
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${deleteType === "hard" ? "border-destructive bg-destructive/5" : "border-muted hover:border-muted-foreground/50"}`}
              onClick={() => setDeleteType("hard")}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${deleteType === "hard" ? "border-destructive" : "border-muted-foreground"}`}>
                  {deleteType === "hard" && <div className="w-2 h-2 rounded-full bg-destructive" />}
                </div>
                <span className="font-medium text-destructive">Delete Permanently</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-6">
                <strong className="text-destructive">Warning:</strong> This action cannot be undone. The link and associated tracking data will be permanently removed.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deleteType)}
              disabled={isDeleting}
              className={deleteType === "hard" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {deleteType === "soft" ? "Deactivating..." : "Deleting..."}
                </>
              ) : (
                deleteType === "soft" ? "Deactivate" : "Delete Permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
