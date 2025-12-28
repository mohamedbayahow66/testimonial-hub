"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Copy, 
  ExternalLink, 
  MoreHorizontal,
  LayoutGrid,
  Rows3,
  Square,
  GalleryHorizontal,
  Check,
  Link2
} from "lucide-react";

interface WidgetCardProps {
  widget: {
    id: string;
    name: string;
    widgetType: string;
    embedCode: string;
    isActive: boolean;
    createdAt: Date;
  };
}

const getWidgetIcon = (type: string) => {
  switch (type) {
    case "CAROUSEL":
      return <GalleryHorizontal className="h-5 w-5" />;
    case "GRID":
      return <LayoutGrid className="h-5 w-5" />;
    case "LIST":
      return <Rows3 className="h-5 w-5" />;
    case "SINGLE":
      return <Square className="h-5 w-5" />;
    default:
      return <LayoutGrid className="h-5 w-5" />;
  }
};

export function WidgetCard({ widget }: WidgetCardProps) {
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Generate the public URL for this widget
  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/w/${widget.embedCode}`
    : `/w/${widget.embedCode}`;

  // Generate embed code (iframe)
  const embedCode = `<iframe src="${publicUrl}" width="100%" height="500" frameborder="0"></iframe>`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      toast({
        title: "Link copied!",
        description: "Share this link to show your testimonials",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedCode(true);
      toast({
        title: "Embed code copied!",
        description: "Paste this code into your website",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    window.open(publicUrl, "_blank");
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card">
      {/* Header row */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
          {getWidgetIcon(widget.widgetType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{widget.name}</span>
            <Badge variant={widget.isActive ? "success" : "secondary"}>
              {widget.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{widget.widgetType}</span>
            <span>•</span>
            <span>Created {new Date(widget.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Widget</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>View Analytics</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Public URL display */}
      <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
        <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
        <code className="text-xs text-muted-foreground flex-1 truncate">
          {publicUrl}
        </code>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 shrink-0"
          onClick={handleCopyLink}
        >
          {copiedLink ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5"
          onClick={handleCopyLink}
        >
          {copiedLink ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Link2 className="h-3 w-3" />
          )}
          {copiedLink ? "Copied!" : "Copy Link"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5"
          onClick={handleCopyCode}
        >
          {copiedCode ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copiedCode ? "Copied!" : "Embed Code"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1.5"
          onClick={handlePreview}
        >
          <ExternalLink className="h-3 w-3" />
          Preview
        </Button>
      </div>
    </div>
  );
}

