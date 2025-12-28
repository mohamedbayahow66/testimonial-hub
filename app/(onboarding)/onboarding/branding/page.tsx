"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressIndicator } from "@/components/onboarding/progress-indicator";
import { ColorPicker } from "@/components/onboarding/color-picker";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  X
} from "lucide-react";

export default function BrandingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [logoUrl, setLogoUrl] = useState("");

  // Pre-fill business name from session
  useEffect(() => {
    if (session?.user?.businessName) {
      setBusinessName(session.user.businessName);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/onboarding/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          primaryColor,
          logoUrl: logoUrl || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save branding");
      }

      toast({
        title: "Branding saved!",
        description: "Your brand settings have been updated.",
        variant: "success",
      });

      router.push("/onboarding/first-link");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/first-link");
  };

  const handleBack = () => {
    router.push("/onboarding/welcome");
  };

  return (
    <div className="space-y-8">
      <ProgressIndicator currentStep={2} />

      <Card className="border-2">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Palette className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Customize Your Brand</CardTitle>
          <CardDescription>
            Make your testimonials match your brand identity
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Company Name"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will appear on your collection pages and widgets
              </p>
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <ColorPicker
                label="Primary Brand Color"
                value={primaryColor}
                onChange={setPrimaryColor}
              />
            </div>

            {/* Logo URL (optional) */}
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="logoUrl"
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://yoursite.com/logo.png"
                  disabled={isLoading}
                  className="flex-1"
                />
                {logoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setLogoUrl("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a URL to your logo image, or skip this step
              </p>
              
              {/* Logo preview */}
              {logoUrl && (
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

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
                type="submit"
                size="lg"
                className="flex-1 gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={handleSkip}
                disabled={isLoading}
                className="sm:w-auto"
              >
                Skip
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

