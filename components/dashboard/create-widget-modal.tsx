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
import { 
  Plus, 
  LayoutGrid, 
  Rows3, 
  Square, 
  GalleryHorizontal,
  Loader2,
  Check,
  Copy,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const widgetTypes = [
  {
    type: "CAROUSEL",
    name: "Carousel",
    description: "Sliding testimonials with navigation",
    icon: GalleryHorizontal,
  },
  {
    type: "GRID",
    name: "Grid",
    description: "Card grid layout",
    icon: LayoutGrid,
  },
  {
    type: "LIST",
    name: "List",
    description: "Vertical list view",
    icon: Rows3,
  },
  {
    type: "SINGLE",
    name: "Single",
    description: "Featured testimonial",
    icon: Square,
  },
];

interface CreateWidgetModalProps {
  children?: React.ReactNode;
}

export function CreateWidgetModal({ children }: CreateWidgetModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<string>("GRID");
  const [createdWidget, setCreatedWidget] = useState<{
    id: string;
    name: string;
    embedCode: string;
    widgetType: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your widget",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          widgetType: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.upgradeRequired) {
          toast({
            title: "Widget limit reached",
            description: data.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to create widget",
            variant: "destructive",
          });
        }
        return;
      }

      setCreatedWidget(data.widget);
      setStep("success");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create widget. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset form after animation
    setTimeout(() => {
      setStep("form");
      setName("");
      setSelectedType("GRID");
      setCreatedWidget(null);
      setCopied(false);
    }, 200);
  };

  const getPublicUrl = () => {
    if (!createdWidget) return "";
    return typeof window !== "undefined"
      ? `${window.location.origin}/w/${createdWidget.embedCode}`
      : `/w/${createdWidget.embedCode}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPublicUrl());
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link to display your testimonials",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    if (createdWidget) {
      window.open(getPublicUrl(), "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Widget
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create New Widget</DialogTitle>
              <DialogDescription>
                Create a widget to display your testimonials publicly. Choose a layout style and give it a name.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Widget Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Widget Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Homepage Testimonials"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  This name is for your reference only
                </p>
              </div>

              {/* Widget Type Selection */}
              <div className="space-y-2">
                <Label>Layout Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {widgetTypes.map((widget) => (
                    <button
                      key={widget.type}
                      type="button"
                      onClick={() => setSelectedType(widget.type)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                        selectedType === widget.type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        selectedType === widget.type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}>
                        <widget.icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sm">{widget.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {widget.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Widget"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                Widget Created!
              </DialogTitle>
              <DialogDescription>
                Your widget &quot;{createdWidget?.name}&quot; is ready. Share the link below to display your testimonials.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Public URL */}
              <div className="space-y-2">
                <Label>Public Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={getPublicUrl()}
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
                <p className="text-xs text-muted-foreground">
                  Share this link with potential clients to show your testimonials
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handlePreview}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

