import Link from "next/link";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquareQuote,
  LayoutGrid,
  Zap,
  Shield,
  Star,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SessionProvider } from "@/components/providers/session-provider";
import { AuthButtons } from "@/components/landing/auth-buttons";

const features = [
  {
    icon: MessageSquareQuote,
    title: "Collect Testimonials",
    description: "Create beautiful collection pages and share links with customers to gather authentic testimonials effortlessly.",
  },
  {
    icon: Zap,
    title: "AI-Powered Cleaning",
    description: "Automatically clean and improve testimonial text while preserving the authentic voice of your customers.",
  },
  {
    icon: Shield,
    title: "Verification Badges",
    description: "Add trust with verified customer badges. Upload proof and show authentic testimonials with confidence.",
  },
  {
    icon: LayoutGrid,
    title: "Embeddable Widgets",
    description: "Create stunning carousels, grids, and lists. Embed anywhere with a simple copy-paste code.",
  },
];

const testimonials = [
  {
    text: "Testimonial Hub increased our landing page conversions by 40%. The social proof is invaluable.",
    author: "Sarah Johnson",
    role: "CEO, TechStartup Inc.",
    rating: 5,
  },
  {
    text: "Finally, a testimonial tool that doesn't require a developer. We set it up in 10 minutes!",
    author: "Michael Chen",
    role: "Marketing Director",
    rating: 5,
  },
  {
    text: "The verification badges give our testimonials so much more credibility. Our customers love it.",
    author: "Emily Rodriguez",
    role: "Founder, DesignCo",
    rating: 5,
  },
];

const stats = [
  { value: "10,000+", label: "Active Users" },
  { value: "500,000+", label: "Testimonials Collected" },
  { value: "40%", label: "Avg. Conversion Lift" },
  { value: "98%", label: "Customer Satisfaction" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">Testimonial Hub</span>
            </Link>
            <SessionProvider>
              <AuthButtons />
            </SessionProvider>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Trusted by 10,000+ businesses
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-in">
              Turn Customer Praise into{" "}
              <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Conversion Power
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in-delay-1">
              Collect, manage, and display stunning testimonials that build trust and drive conversions. 
              No coding required.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in-delay-2">
              <Link href="/signup">
                <Button size="xl" className="gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="xl" variant="outline">
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 pt-8 animate-in-delay-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Free plan available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Setup in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-primary">Build Trust</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed to help you collect, manage, and showcase 
              customer testimonials that convert.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by{" "}
              <span className="text-primary">Businesses Worldwide</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of companies using Testimonial Hub to build trust and drive growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="gradient-primary text-white overflow-hidden">
            <CardContent className="p-12 md:p-16 text-center relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
              <div className="relative space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Ready to Turn Testimonials into Conversions?
                </h2>
                <p className="text-lg text-white/80 max-w-2xl mx-auto">
                  Join 10,000+ businesses already using Testimonial Hub to build trust 
                  and grow their customer base.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/signup">
                    <Button size="xl" variant="secondary" className="gap-2">
                      Get Started Free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Testimonial Hub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Testimonial Hub. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


