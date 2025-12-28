"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, Search } from "lucide-react";

/**
 * Custom 404 page for invalid or inactive collection links
 */
export default function SubmitNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <FileQuestion className="h-10 w-10 text-gray-400" />
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Collection Link Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          This testimonial collection link doesn't exist or is no longer accepting submissions.
        </p>

        {/* Possible reasons */}
        <div className="bg-white rounded-xl p-6 mb-8 text-left border">
          <h2 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            This could have happened because:
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              The link URL is incorrect or has a typo
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              The collection link has been deactivated
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              The business is no longer accepting testimonials
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            If you received this link from a business, please contact them for assistance.
          </p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-400">
          Powered by Testimonial Hub
        </p>
      </div>
    </div>
  );
}


