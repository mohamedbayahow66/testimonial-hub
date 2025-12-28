import Link from "next/link";
import { Sparkles } from "lucide-react";

/**
 * Auth layout - used for login and signup pages
 * Features a split design with branding on the left and form on the right
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <div className="hidden lg:flex flex-col justify-between gradient-mesh p-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold">Testimonial Hub</span>
        </Link>

        <div className="space-y-6">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Testimonial Hub helped us increase conversions by 40%. 
              The social proof we display on our landing pages has been a game changer.&rdquo;
            </p>
            <footer className="text-sm text-muted-foreground">
              — Sarah Johnson, CEO at TechStartup Inc.
            </footer>
          </blockquote>

          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10k+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500k+</div>
              <div className="text-sm text-muted-foreground">Testimonials</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">98%</div>
              <div className="text-sm text-muted-foreground">Satisfaction</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Testimonial Hub. All rights reserved.
        </p>
      </div>

      {/* Right side - Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">Testimonial Hub</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}


