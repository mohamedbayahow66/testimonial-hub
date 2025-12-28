"use client";

import { cn } from "@/lib/utils";

interface FormSkeletonProps {
  className?: string;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}

export function FormSkeleton({ className }: FormSkeletonProps) {
  return (
    <div className={cn("w-full max-w-2xl mx-auto px-4 py-8", className)}>
      {/* Header skeleton */}
      <div className="text-center mb-8 space-y-4">
        {/* Logo placeholder */}
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        
        {/* Business name */}
        <Skeleton className="h-6 w-48 mx-auto" />
        
        {/* Title */}
        <Skeleton className="h-8 w-72 mx-auto" />
        
        {/* Description */}
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-6 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border">
        {/* Name field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Role/Title field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-11 w-full" />
        </div>

        {/* Rating field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </div>

        {/* Testimonial textarea */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-full" />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Submit button */}
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>

      {/* Trust indicator skeleton */}
      <div className="mt-6 text-center">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}


