"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

/**
 * Custom 404 Not Found page
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
            It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

