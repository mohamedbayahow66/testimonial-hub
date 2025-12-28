import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, FileQuestion } from "lucide-react";

/**
 * 404 page for invalid or inactive widget codes
 */
export default function WidgetNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">Testimonial Hub</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <FileQuestion className="h-10 w-10 text-gray-400" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Widget Not Found
          </h1>
          
          <p className="text-gray-600 mb-6">
            This testimonial widget doesn&apos;t exist or has been deactivated. 
            Please check the link and try again.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/">
              <Button>
                Go to Homepage
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Want to collect and display testimonials for your business?
          </p>
          <Link 
            href="/signup" 
            className="text-sm text-primary hover:underline"
          >
            Get started with Testimonial Hub →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          Powered by Testimonial Hub
        </div>
      </footer>
    </div>
  );
}

