"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  MoreHorizontal,
  CheckCircle2,
  Clock,
  XCircle,
  Star,
  Loader2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Mail,
  Briefcase,
  Building2,
  Calendar,
} from "lucide-react";
import { StarRatingDisplay } from "@/components/public/star-rating";

interface TestimonialCardProps {
  testimonial: {
    id: string;
    clientName: string;
    clientEmail?: string | null;
    clientRole?: string | null;
    clientCompany?: string | null;
    originalText: string;
    status: string;
    rating?: number | null;
    verificationBadge: boolean;
    submittedAt: Date;
    submissionType: string;
  };
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleStatusChange = async (newStatus: "APPROVED" | "REJECTED" | "PENDING") => {
    setIsLoading(newStatus);
    
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update testimonial");
      }

      toast({
        title: newStatus === "APPROVED" 
          ? "Testimonial Approved! ✓" 
          : newStatus === "REJECTED"
          ? "Testimonial Rejected"
          : "Moved to Pending",
        description: newStatus === "APPROVED" 
          ? "This testimonial can now appear in your widgets."
          : newStatus === "REJECTED"
          ? "This testimonial has been rejected and won't be shown publicly."
          : "This testimonial has been moved back to pending for review.",
        variant: newStatus === "REJECTED" ? "destructive" : "default",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading("DELETE");
    
    try {
      const response = await fetch(`/api/testimonials/${testimonial.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete testimonial");
      }

      toast({
        title: "Testimonial Deleted",
        description: "The testimonial has been permanently removed.",
      });

      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete testimonial. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <>
      <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:border-primary/30 transition-colors">
        {/* Avatar/Icon */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span className="text-sm font-medium text-primary">
            {testimonial.clientName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{testimonial.clientName}</span>
                {getStatusBadge(testimonial.status)}
                {testimonial.verificationBadge && (
                  <Badge variant="outline" className="gap-1 text-blue-600 border-blue-300">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
              {(testimonial.clientRole || testimonial.clientCompany) && (
                <p className="text-sm text-muted-foreground">
                  {testimonial.clientRole}
                  {testimonial.clientRole && testimonial.clientCompany && " at "}
                  {testimonial.clientCompany}
                </p>
              )}
            </div>

            {/* Rating */}
            {testimonial.rating && (
              <StarRatingDisplay value={testimonial.rating} size="sm" />
            )}
          </div>

          {/* Testimonial Text */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            "{testimonial.originalText}"
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(testimonial.submittedAt).toLocaleDateString('en-GB')}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Quick Actions for Pending */}
              {testimonial.status === "PENDING" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => handleStatusChange("APPROVED")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "APPROVED" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleStatusChange("REJECTED")}
                    disabled={isLoading !== null}
                  >
                    {isLoading === "REJECTED" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Reject
                      </>
                    )}
                  </Button>
                </>
              )}

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  
                  {testimonial.status !== "APPROVED" && (
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange("APPROVED")}
                      disabled={isLoading !== null}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </DropdownMenuItem>
                  )}
                  
                  {testimonial.status !== "REJECTED" && (
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange("REJECTED")}
                      disabled={isLoading !== null}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </DropdownMenuItem>
                  )}
                  
                  {testimonial.status !== "PENDING" && (
                    <DropdownMenuItem 
                      onClick={() => handleStatusChange("PENDING")}
                      disabled={isLoading !== null}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Mark as Pending
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
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
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              testimonial from {testimonial.clientName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading === "DELETE"}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading === "DELETE"}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading === "DELETE" ? (
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

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
            <DialogDescription>
              Full details of this testimonial
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              {getStatusBadge(testimonial.status)}
              {testimonial.verificationBadge && (
                <Badge variant="outline" className="gap-1 text-blue-600 border-blue-300">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>

            {/* Customer Info */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">{testimonial.clientName}</h4>
              
              {testimonial.clientEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {testimonial.clientEmail}
                </div>
              )}
              
              {testimonial.clientRole && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {testimonial.clientRole}
                </div>
              )}
              
              {testimonial.clientCompany && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {testimonial.clientCompany}
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(testimonial.submittedAt).toLocaleString('en-GB')}
              </div>
            </div>

            {/* Rating */}
            {testimonial.rating && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rating:</span>
                <StarRatingDisplay value={testimonial.rating} size="md" />
              </div>
            )}

            {/* Full Testimonial */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Testimonial:</span>
              <p className="text-sm p-4 bg-muted/50 rounded-lg italic">
                "{testimonial.originalText}"
              </p>
            </div>

            {/* Actions */}
            {testimonial.status === "PENDING" && (
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleStatusChange("APPROVED");
                    setShowDetailsDialog(false);
                  }}
                  disabled={isLoading !== null}
                >
                  {isLoading === "APPROVED" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    handleStatusChange("REJECTED");
                    setShowDetailsDialog(false);
                  }}
                  disabled={isLoading !== null}
                >
                  {isLoading === "REJECTED" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


