"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/public/star-rating";
import { SubmissionSuccess } from "@/components/public/submission-success";
import { ImagePreview, AudioPreview, VideoPreview, UploadProgress } from "@/components/public/media-preview";
import { clientValidateFile, UPLOAD_CONFIG, formatFileSize, getAcceptString, MediaType } from "@/lib/upload-validator";
import { cn } from "@/lib/utils";
import { 
  Shield, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  User,
  Mail,
  Briefcase,
  Building2,
  MessageSquare,
  RefreshCw,
  FileText,
  Image,
  Mic,
  Video,
  Upload,
  X,
  Lock,
} from "lucide-react";

interface CollectionLinkData {
  slug: string;
  title: string;
  description: string | null;
  businessName: string;
  userId: string;
  ownerTier: string;
  branding: {
    logoUrl?: string | null;
    primaryColor?: string;
    companyName?: string;
  } | null;
}

interface TestimonialFormProps {
  collectionLink: CollectionLinkData;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  company?: string;
  testimonial?: string;
  rating?: string;
  media?: string;
  general?: string;
}

type SubmissionType = "TEXT" | "IMAGE" | "AUDIO" | "VIDEO";
type SubmissionState = "idle" | "uploading" | "submitting" | "success" | "error";

const SUBMISSION_TYPES = [
  { type: "TEXT" as SubmissionType, label: "Text", icon: FileText, requiredTier: "FREE" },
  { type: "IMAGE" as SubmissionType, label: "Image", icon: Image, requiredTier: "FREE" },
  { type: "AUDIO" as SubmissionType, label: "Audio", icon: Mic, requiredTier: "BASIC" },
  { type: "VIDEO" as SubmissionType, label: "Video", icon: Video, requiredTier: "PRO" },
];

export function TestimonialForm({ collectionLink }: TestimonialFormProps) {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [testimonial, setTestimonial] = useState("");
  const [rating, setRating] = useState(0);
  const [allowPublic, setAllowPublic] = useState(true);
  const [showFullName, setShowFullName] = useState(true);
  const [honeypot, setHoneypot] = useState(""); // Spam prevention
  
  // Upload state
  const [submissionType, setSubmissionType] = useState<SubmissionType>("TEXT");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedMediaUrl, setUploadedMediaUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // UI state
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const characterCount = testimonial.length;
  const minChars = submissionType === "TEXT" ? 50 : 20; // Less text required with media
  const maxChars = 500;

  // Primary color from branding or default
  const primaryColor = collectionLink.branding?.primaryColor || "#7c3aed";

  // Check if tier allows media type
  const canUseTier = (requiredTier: string): boolean => {
    const tierOrder = ["FREE", "BASIC", "PRO"];
    const ownerTierIndex = tierOrder.indexOf(collectionLink.ownerTier || "FREE");
    const requiredTierIndex = tierOrder.indexOf(requiredTier);
    return ownerTierIndex >= requiredTierIndex;
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    // Determine media type from submission type
    const mediaType = submissionType.toLowerCase() as MediaType;
    if (mediaType === "text") return;

    // Validate file client-side
    const validation = clientValidateFile(file, mediaType);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, media: validation.error }));
      return;
    }

    setSelectedFile(file);
    setErrors(prev => ({ ...prev, media: undefined }));

    // Create preview URL for local display
    const previewUrl = URL.createObjectURL(file);
    setUploadedMediaUrl(previewUrl);
  }, [submissionType]);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearMedia = () => {
    setSelectedFile(null);
    if (uploadedMediaUrl) {
      URL.revokeObjectURL(uploadedMediaUrl);
    }
    setUploadedMediaUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Upload file to server
  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    const mediaType = submissionType.toLowerCase();
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", collectionLink.userId);

    try {
      setSubmissionState("uploading");
      
      // Simulate progress (since fetch doesn't support progress natively)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`/api/upload/${mediaType}`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      return data.url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setErrors(prev => ({ ...prev, media: message }));
      return null;
    }
  };

  // Client-side validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim() || name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (testimonial.length < minChars) {
      newErrors.testimonial = `Testimonial must be at least ${minChars} characters`;
    } else if (testimonial.length > maxChars) {
      newErrors.testimonial = `Testimonial must be less than ${maxChars} characters`;
    }

    if (rating === 0) {
      newErrors.rating = "Please select a rating";
    }

    // Validate media for non-text submissions
    if (submissionType !== "TEXT" && !selectedFile && !uploadedMediaUrl) {
      newErrors.media = `Please upload ${submissionType === "IMAGE" ? "an image" : submissionType === "AUDIO" ? "an audio file" : "a video"}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setErrorMessage("");

    let mediaUrl: string | null = null;

    // Upload media if selected
    if (submissionType !== "TEXT" && selectedFile) {
      mediaUrl = await uploadFile();
      if (!mediaUrl) {
        setSubmissionState("error");
        setErrorMessage("Failed to upload media. Please try again.");
        return;
      }
    }

    setSubmissionState("submitting");

    try {
      const response = await fetch("/api/public/testimonials/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || undefined,
          role: role || undefined,
          company: company || undefined,
          testimonial,
          rating,
          allowPublic,
          showFullName,
          submissionType,
          mediaUrl,
          website: honeypot, // Honeypot field
          slug: collectionLink.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "rate_limit") {
          setErrorMessage(data.message || "Too many submissions. Please try again later.");
          setSubmissionState("error");
        } else if (data.error === "validation_error") {
          setErrors(data.details || {});
          setSubmissionState("idle");
        } else if (data.error === "quota_exceeded") {
          setErrorMessage(data.message || "Unable to accept submissions at this time.");
          setSubmissionState("error");
        } else {
          setErrorMessage(data.message || "Something went wrong. Please try again.");
          setSubmissionState("error");
        }
        return;
      }

      setSubmissionState("success");
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
      setSubmissionState("error");
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("");
    setCompany("");
    setTestimonial("");
    setRating(0);
    setAllowPublic(true);
    setShowFullName(true);
    setSubmissionType("TEXT");
    clearMedia();
    setErrors({});
    setErrorMessage("");
    setSubmissionState("idle");
  };

  // Show success state
  if (submissionState === "success") {
    return (
      <SubmissionSuccess
        businessName={collectionLink.businessName}
        onSubmitAnother={resetForm}
      />
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        {/* Business Logo */}
        {collectionLink.branding?.logoUrl && (
          <div className="mb-4">
            <img
              src={collectionLink.branding.logoUrl}
              alt={collectionLink.businessName}
              className="h-16 w-auto mx-auto object-contain"
            />
          </div>
        )}

        {/* Business Name */}
        <p className="text-sm font-medium text-gray-500 mb-2">
          {collectionLink.businessName}
        </p>

        {/* Collection Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {collectionLink.title}
        </h1>

        {/* Description */}
        {collectionLink.description && (
          <p className="text-gray-600 max-w-md mx-auto">
            {collectionLink.description}
          </p>
        )}

        {/* Trust Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4 text-green-600" />
          <span>Your testimonial will be reviewed before publishing</span>
        </div>
      </div>

      {/* Error Banner */}
      {submissionState === "error" && errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Submission Failed</p>
            <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSubmissionState("idle")}
            className="text-red-600 hover:text-red-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border space-y-6">
          {/* Honeypot field (hidden) */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute opacity-0 pointer-events-none h-0 w-0"
            aria-hidden="true"
          />

          {/* Submission Type Selector */}
          <div className="space-y-3">
            <Label>Testimonial Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {SUBMISSION_TYPES.map(({ type, label, icon: Icon, requiredTier }) => {
                const isAvailable = canUseTier(requiredTier);
                const isSelected = submissionType === type;
                
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      if (isAvailable) {
                        setSubmissionType(type);
                        clearMedia();
                      }
                    }}
                    disabled={!isAvailable || submissionState === "submitting" || submissionState === "uploading"}
                    className={cn(
                      "relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : isAvailable
                          ? "border-gray-200 hover:border-gray-300 text-gray-600"
                          : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {!isAvailable && (
                      <Lock className="absolute top-1 right-1 h-3 w-3 text-gray-400" />
                    )}
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Tier restriction messages */}
            {submissionType === "AUDIO" && !canUseTier("BASIC") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Audio testimonials require Basic plan or higher
              </p>
            )}
            {submissionType === "VIDEO" && !canUseTier("PRO") && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Video testimonials require Pro plan
              </p>
            )}
          </div>

          {/* Media Upload Section */}
          {submissionType !== "TEXT" && (
            <div className="space-y-3">
              <Label>
                Upload {submissionType === "IMAGE" ? "Image" : submissionType === "AUDIO" ? "Audio" : "Video"}
                <span className="text-red-500 ml-1">*</span>
              </Label>

              {/* Upload Progress */}
              {submissionState === "uploading" && selectedFile && (
                <UploadProgress
                  progress={uploadProgress}
                  filename={selectedFile.name}
                  fileSize={formatFileSize(selectedFile.size)}
                  onCancel={() => {
                    clearMedia();
                    setSubmissionState("idle");
                  }}
                />
              )}

              {/* Media Preview */}
              {uploadedMediaUrl && submissionState !== "uploading" && (
                <div className="space-y-2">
                  {submissionType === "IMAGE" && (
                    <ImagePreview
                      src={uploadedMediaUrl}
                      alt="Preview"
                      onRemove={clearMedia}
                    />
                  )}
                  {submissionType === "AUDIO" && (
                    <AudioPreview
                      src={uploadedMediaUrl}
                      filename={selectedFile?.name}
                      onRemove={clearMedia}
                    />
                  )}
                  {submissionType === "VIDEO" && (
                    <VideoPreview
                      src={uploadedMediaUrl}
                      onRemove={clearMedia}
                    />
                  )}
                </div>
              )}

              {/* Drag and Drop Zone */}
              {!uploadedMediaUrl && submissionState !== "uploading" && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 text-center transition-all",
                    isDragging
                      ? "border-violet-500 bg-violet-50"
                      : errors.media
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptString(submissionType.toLowerCase() as MediaType)}
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Drag and drop or{" "}
                        <span className="text-violet-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {submissionType === "IMAGE" && "JPEG, PNG, WebP • Max 5 MB"}
                        {submissionType === "AUDIO" && "MP3, WAV, M4A • Max 10 MB • Max 5 min"}
                        {submissionType === "VIDEO" && "MP4, WebM, MOV • Max 50 MB • Max 2 min"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.media && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.media}
                </p>
              )}
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              Your Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
              disabled={submissionState === "submitting" || submissionState === "uploading"}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              Email Address <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
              disabled={submissionState === "submitting" || submissionState === "uploading"}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Role & Company - Two columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-gray-400" />
                Your Role <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input
                id="role"
                placeholder="Marketing Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={submissionState === "submitting" || submissionState === "uploading"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                Company <span className="text-gray-400 text-xs">(optional)</span>
              </Label>
              <Input
                id="company"
                placeholder="Acme Inc"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={submissionState === "submitting" || submissionState === "uploading"}
              />
            </div>
          </div>

          {/* Rating Field */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              Rating <span className="text-red-500">*</span>
            </Label>
            <StarRating
              value={rating}
              onChange={setRating}
              size="lg"
              disabled={submissionState === "submitting" || submissionState === "uploading"}
            />
            {errors.rating && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.rating}
              </p>
            )}
          </div>

          {/* Testimonial Field */}
          <div className="space-y-2">
            <Label htmlFor="testimonial" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-400" />
              Your Testimonial <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="testimonial"
              placeholder={submissionType !== "TEXT" 
                ? "Add a brief description to accompany your media..."
                : "Share your experience... What did you enjoy most? How did it help you?"
              }
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              rows={submissionType !== "TEXT" ? 3 : 5}
              className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
                errors.testimonial && "border-red-500 focus-visible:ring-red-500"
              )}
              disabled={submissionState === "submitting" || submissionState === "uploading"}
            />
            <div className="flex items-center justify-between text-sm">
              {errors.testimonial ? (
                <p className="text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.testimonial}
                </p>
              ) : (
                <span className="text-gray-400">
                  {characterCount < minChars
                    ? `${minChars - characterCount} more characters needed`
                    : <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" /> Looking good!</span>
                  }
                </span>
              )}
              <span className={cn(
                "tabular-nums",
                characterCount > maxChars ? "text-red-500" : 
                characterCount >= minChars ? "text-green-600" : "text-gray-400"
              )}>
                {characterCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Permission Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowPublic}
                onChange={(e) => setAllowPublic(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={submissionState === "submitting" || submissionState === "uploading"}
              />
              <span className="text-sm text-gray-600">
                I give permission to use this testimonial publicly
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showFullName}
                onChange={(e) => setShowFullName(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={submissionState === "submitting" || submissionState === "uploading"}
              />
              <span className="text-sm text-gray-600">
                Display my full name (uncheck to show initials only)
              </span>
            </label>
          </div>
        </div>

        {/* Submit Button - Sticky on mobile */}
        <div className="sticky bottom-4 bg-gradient-to-t from-gray-50 pt-4">
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium"
            style={{ backgroundColor: primaryColor }}
            disabled={submissionState === "submitting" || submissionState === "uploading"}
          >
            {submissionState === "uploading" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : submissionState === "submitting" ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Testimonial"
            )}
          </Button>
        </div>
      </form>

      {/* Footer Trust Indicators */}
      <div className="mt-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Secure & Private
          </span>
          <span>•</span>
          <span>Powered by Testimonial Hub</span>
        </div>
      </div>
    </div>
  );
}
