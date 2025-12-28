"use client";

import { useState, useRef, useEffect } from "react";
import { X, Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface BasePreviewProps {
  onRemove?: () => void;
  className?: string;
}

// ============================================
// IMAGE PREVIEW COMPONENT
// ============================================

interface ImagePreviewProps extends BasePreviewProps {
  src: string;
  alt?: string;
}

export function ImagePreview({ src, alt = "Preview", onRemove, className }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      )}
      
      {error ? (
        <div className="flex items-center justify-center h-48 text-zinc-500">
          Failed to load image
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={cn(
            "w-full h-auto max-h-[300px] object-contain transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setError(true);
          }}
        />
      )}
      
      {onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

// ============================================
// AUDIO PREVIEW COMPONENT
// ============================================

interface AudioPreviewProps extends BasePreviewProps {
  src: string;
  filename?: string;
}

export function AudioPreview({ src, filename, onRemove, className }: AudioPreviewProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn(
      "relative p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-200/50 dark:border-violet-800/50",
      className
    )}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Header with filename */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <Volume2 className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
            {filename || "Audio Recording"}
          </span>
        </div>
        
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-red-500"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={togglePlay}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        {/* Progress */}
        <div className="flex-1 space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// VIDEO PREVIEW COMPONENT
// ============================================

interface VideoPreviewProps extends BasePreviewProps {
  src: string;
  poster?: string;
}

export function VideoPreview({ src, poster, onRemove, className }: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isPlaying, showControls]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!videoRef.current) return;
    const newVolume = value[0];
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMuted = !isMuted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-xl overflow-hidden bg-black group",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        preload="metadata"
        className="w-full max-h-[400px] object-contain"
        onClick={togglePlay}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && !isLoading && (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
          onClick={togglePlay}
        >
          <div className="p-4 rounded-full bg-white/90 hover:bg-white transition-colors">
            <Play className="h-8 w-8 text-zinc-900 ml-1" />
          </div>
        </button>
      )}

      {/* Remove button */}
      {onRemove && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Controls */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
        showControls || !isPlaying ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress bar */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer mb-2"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />

            <span className="text-xs text-white/80 ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// UPLOAD PROGRESS COMPONENT
// ============================================

interface UploadProgressProps {
  progress: number;
  filename: string;
  fileSize: string;
  onCancel?: () => void;
}

export function UploadProgress({ progress, filename, fileSize, onCancel }: UploadProgressProps) {
  return (
    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
            {filename}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{fileSize}</span>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-zinc-400 hover:text-red-500"
              onClick={onCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mt-1 text-xs text-zinc-500 text-right">
        {progress}% uploaded
      </div>
    </div>
  );
}

