import { auth } from "@/lib/auth";
import { getUsageStats } from "@/lib/tier-enforcement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UsageProgress } from "@/components/dashboard/usage-progress";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  User,
  Building2,
  Palette,
  CreditCard,
  Shield,
  Bell,
  ArrowRight,
  Crown,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "Settings - Testimonial Hub",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    redirect("/login");
  }

  const usage = await getUsageStats(user.id);
  const isFreeTier = usage.tier === "FREE";

  const getTierIcon = () => {
    switch (usage.tier) {
      case "FREE":
        return <Zap className="h-4 w-4" />;
      case "BASIC":
        return <Sparkles className="h-4 w-4" />;
      case "PRO":
        return <Crown className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue={user?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Business Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Business Information</CardTitle>
          </div>
          <CardDescription>
            Update your business details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" defaultValue={user?.businessName || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input id="website" type="url" placeholder="https://yourwebsite.com" />
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Branding Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Branding</CardTitle>
          </div>
          <CardDescription>
            Customize how your testimonials appear
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input id="logo" type="url" placeholder="https://yourwebsite.com/logo.png" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input id="primaryColor" defaultValue="#7c3aed" />
                <div className="h-9 w-9 rounded-md bg-primary border" />
              </div>
            </div>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Subscription</CardTitle>
          </div>
          <CardDescription>
            Manage your subscription plan and view usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Plan */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Plan</span>
                <Badge variant={isFreeTier ? "secondary" : "default"} className="gap-1">
                  {getTierIcon()}
                  {usage.tierConfig.name}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {usage.tierConfig.price === 0 
                  ? "Free forever - limited features"
                  : `$${usage.tierConfig.price}/month`}
              </p>
            </div>
            <Link href="/dashboard/settings/subscription">
              <Button variant={isFreeTier ? "default" : "outline"} className="gap-1">
                {isFreeTier ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Upgrade Plan
                  </>
                ) : (
                  <>
                    Manage Plan
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </Link>
          </div>

          {/* Usage Overview */}
          <div className="space-y-4">
            <h4 className="font-medium">Usage Overview</h4>
            <UsageProgress
              label="Testimonials"
              used={usage.testimonials.used}
              limit={usage.testimonials.limit}
            />
            <UsageProgress
              label="Widgets"
              used={usage.widgets.used}
              limit={usage.widgets.limit}
            />
            <UsageProgress
              label="Collection Links"
              used={usage.collectionLinks.used}
              limit={usage.collectionLinks.limit}
            />
          </div>

          {isFreeTier && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Unlock More Features</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Upgrade to Basic for unlimited testimonials, audio support, and more widgets.
              </p>
              <Link href="/dashboard/settings/subscription">
                <Button size="sm" className="gap-1">
                  View Plans
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email when new testimonials are submitted
              </p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Get weekly summary of your testimonial performance
              </p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Change your password
              </p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
