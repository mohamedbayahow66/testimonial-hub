"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const containerSizeClasses = {
    sm: "gap-1",
    md: "gap-2",
    lg: "gap-3",
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rating: number) => {
    if (disabled) return;
    
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onChange(rating);
    } else if (e.key === "ArrowRight" && rating < 5) {
      e.preventDefault();
      onChange(rating + 1);
    } else if (e.key === "ArrowLeft" && rating > 1) {
      e.preventDefault();
      onChange(rating - 1);
    }
  };

  return (
    <div 
      className={cn("flex items-center", containerSizeClasses[size], className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= displayValue;
        
        return (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={rating === value}
            aria-label={`${rating} star${rating !== 1 ? "s" : ""}`}
            tabIndex={rating === value || (value === 0 && rating === 1) ? 0 : -1}
            disabled={disabled}
            className={cn(
              "relative cursor-pointer transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm",
              "touch-manipulation", // Better touch handling
              "min-w-[44px] min-h-[44px] flex items-center justify-center", // Large touch target
              disabled && "cursor-not-allowed opacity-50"
            )}
            onClick={() => handleClick(rating)}
            onKeyDown={(e) => handleKeyDown(e, rating)}
            onMouseEnter={() => !disabled && setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(null)}
            onFocus={() => !disabled && setHoverValue(rating)}
            onBlur={() => setHoverValue(null)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-all duration-150",
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300 hover:text-amber-300",
                hoverValue !== null && rating <= hoverValue && "scale-110"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Display-only star rating (no interaction)
 */
export function StarRatingDisplay({
  value,
  size = "sm",
  className,
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const containerSizeClasses = {
    sm: "gap-0.5",
    md: "gap-1",
    lg: "gap-1.5",
  };

  return (
    <div 
      className={cn("flex items-center", containerSizeClasses[size], className)}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <Star
          key={rating}
          className={cn(
            sizeClasses[size],
            rating <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-gray-300"
          )}
        />
      ))}
    </div>
  );
}


