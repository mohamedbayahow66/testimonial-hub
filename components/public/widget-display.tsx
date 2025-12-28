"use client";

import { useState, useEffect } from "react";
import { Star, BadgeCheck, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  displayText: string | null;
  originalText: string;
  clientName: string;
  clientRole: string | null;
  clientCompany: string | null;
  rating: number | null;
  showFullName: boolean;
  verificationBadge: boolean;
  submittedAt: Date;
}

interface WidgetDisplayProps {
  testimonials: Testimonial[];
  widgetType: string;
  primaryColor: string;
  styling?: {
    backgroundColor?: string;
    textColor?: string;
    cardStyle?: string;
  } | null;
}

/**
 * Get display name based on showFullName setting
 */
function getDisplayName(name: string, showFullName: boolean): string {
  if (showFullName) return name;
  const parts = name.split(" ");
  if (parts.length === 1) return `${parts[0].charAt(0)}.`;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

/**
 * Individual testimonial card component
 */
function TestimonialCard({ 
  testimonial, 
  primaryColor,
  variant = "default"
}: { 
  testimonial: Testimonial; 
  primaryColor: string;
  variant?: "default" | "compact" | "featured";
}) {
  const displayName = getDisplayName(testimonial.clientName, testimonial.showFullName);
  const text = testimonial.displayText || testimonial.originalText;

  return (
    <div 
      className={cn(
        "bg-white rounded-xl border shadow-sm transition-all hover:shadow-md",
        variant === "featured" && "p-8",
        variant === "compact" && "p-4",
        variant === "default" && "p-6"
      )}
    >
      {/* Quote icon */}
      <div className="mb-4">
        <Quote 
          className={cn(
            "text-opacity-20",
            variant === "featured" ? "h-10 w-10" : "h-6 w-6"
          )}
          style={{ color: primaryColor }}
          fill={primaryColor}
          fillOpacity={0.1}
        />
      </div>

      {/* Rating */}
      {testimonial.rating && (
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < testimonial.rating! 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "fill-gray-200 text-gray-200"
              )}
            />
          ))}
        </div>
      )}

      {/* Testimonial text */}
      <p className={cn(
        "text-gray-700 leading-relaxed mb-4",
        variant === "featured" && "text-lg",
        variant === "compact" && "text-sm line-clamp-4"
      )}>
        &ldquo;{text}&rdquo;
      </p>

      {/* Author info */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-900 truncate">{displayName}</span>
            {testimonial.verificationBadge && (
              <BadgeCheck 
                className="h-4 w-4 shrink-0" 
                style={{ color: primaryColor }}
              />
            )}
          </div>
          {(testimonial.clientRole || testimonial.clientCompany) && (
            <p className="text-sm text-gray-500 truncate">
              {testimonial.clientRole}
              {testimonial.clientRole && testimonial.clientCompany && " at "}
              {testimonial.clientCompany}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid layout - 2-3 column responsive grid
 */
function GridLayout({ testimonials, primaryColor }: { testimonials: Testimonial[]; primaryColor: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          primaryColor={primaryColor}
        />
      ))}
    </div>
  );
}

/**
 * List layout - Vertical stack
 */
function ListLayout({ testimonials, primaryColor }: { testimonials: Testimonial[]; primaryColor: string }) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          primaryColor={primaryColor}
          variant="default"
        />
      ))}
    </div>
  );
}

/**
 * Carousel layout - Sliding cards with navigation
 */
function CarouselLayout({ testimonials, primaryColor }: { testimonials: Testimonial[]; primaryColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, testimonials.length]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Main card */}
      <div className="overflow-hidden">
        <div 
          className="transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          <div className="flex">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                <TestimonialCard
                  testimonial={testimonial}
                  primaryColor={primaryColor}
                  variant="featured"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {testimonials.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-white shadow-lg"
            onClick={goToPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-white shadow-lg"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {testimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "w-6" 
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              style={index === currentIndex ? { backgroundColor: primaryColor } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Single/Featured layout - One prominent testimonial with rotation
 */
function SingleLayout({ testimonials, primaryColor }: { testimonials: Testimonial[]; primaryColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const testimonial = testimonials[currentIndex];

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div 
        className="bg-white rounded-2xl border shadow-lg p-8 md:p-12"
        style={{ borderColor: `${primaryColor}30` }}
      >
        {/* Large quote */}
        <Quote 
          className="h-12 w-12 mx-auto mb-6 opacity-20"
          style={{ color: primaryColor }}
          fill={primaryColor}
          fillOpacity={0.1}
        />

        {/* Rating */}
        {testimonial.rating && (
          <div className="flex justify-center gap-1 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-6 w-6",
                  i < testimonial.rating! 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "fill-gray-200 text-gray-200"
                )}
              />
            ))}
          </div>
        )}

        {/* Testimonial text */}
        <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
          &ldquo;{testimonial.displayText || testimonial.originalText}&rdquo;
        </p>

        {/* Author */}
        <div className="flex flex-col items-center gap-3">
          <div 
            className="flex h-14 w-14 items-center justify-center rounded-full text-white font-semibold text-lg"
            style={{ backgroundColor: primaryColor }}
          >
            {getDisplayName(testimonial.clientName, testimonial.showFullName).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-semibold text-gray-900">
                {getDisplayName(testimonial.clientName, testimonial.showFullName)}
              </span>
              {testimonial.verificationBadge && (
                <BadgeCheck 
                  className="h-5 w-5" 
                  style={{ color: primaryColor }}
                />
              )}
            </div>
            {(testimonial.clientRole || testimonial.clientCompany) && (
              <p className="text-gray-500">
                {testimonial.clientRole}
                {testimonial.clientRole && testimonial.clientCompany && " at "}
                {testimonial.clientCompany}
              </p>
            )}
          </div>
        </div>

        {/* Pagination indicator */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-8 pt-6 border-t">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex 
                    ? "w-8" 
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                style={index === currentIndex ? { backgroundColor: primaryColor } : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main widget display component
 * Renders testimonials based on the widget type
 */
export function WidgetDisplay({ 
  testimonials, 
  widgetType, 
  primaryColor,
  styling 
}: WidgetDisplayProps) {
  switch (widgetType) {
    case "CAROUSEL":
      return <CarouselLayout testimonials={testimonials} primaryColor={primaryColor} />;
    case "LIST":
      return <ListLayout testimonials={testimonials} primaryColor={primaryColor} />;
    case "SINGLE":
      return <SingleLayout testimonials={testimonials} primaryColor={primaryColor} />;
    case "GRID":
    default:
      return <GridLayout testimonials={testimonials} primaryColor={primaryColor} />;
  }
}

