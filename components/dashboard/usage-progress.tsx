"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Infinity } from "lucide-react";

interface UsageProgressProps {
  label: string;
  used: number;
  limit: number | null;
  className?: string;
  showPercentage?: boolean;
}

export function UsageProgress({ 
  label, 
  used, 
  limit, 
  className,
  showPercentage = false,
}: UsageProgressProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0;
  const isAtLimit = !isUnlimited && used >= limit;
  const isNearLimit = !isUnlimited && percentage >= 80 && percentage < 100;

  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-amber-500";
    return "bg-primary";
  };

  const getStatusIcon = () => {
    if (isAtLimit) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (isNearLimit) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          {isUnlimited ? (
            <>
              <span>{used}</span>
              <Infinity className="h-4 w-4" />
              <span className="text-xs">(Unlimited)</span>
            </>
          ) : (
            <>
              <span className={cn(isAtLimit && "text-red-500 font-medium")}>
                {used}
              </span>
              <span>/</span>
              <span>{limit}</span>
              {showPercentage && (
                <span className="text-xs ml-1">({percentage}%)</span>
              )}
            </>
          )}
        </div>
      </div>
      
      {!isUnlimited && (
        <Progress 
          value={percentage} 
          className="h-2"
          indicatorClassName={getProgressColor()}
        />
      )}

      {isAtLimit && (
        <p className="text-xs text-red-500">
          You've reached your limit. Upgrade to add more.
        </p>
      )}
      {isNearLimit && (
        <p className="text-xs text-amber-500">
          Approaching limit. Consider upgrading soon.
        </p>
      )}
    </div>
  );
}

/**
 * Compact version for dashboard cards
 */
export function UsageProgressCompact({ 
  used, 
  limit, 
  className,
}: Omit<UsageProgressProps, 'label'> & { className?: string }) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : limit > 0 ? Math.round((used / limit) * 100) : 0;
  const isAtLimit = !isUnlimited && used >= limit;
  const isNearLimit = !isUnlimited && percentage >= 80 && percentage < 100;

  const getProgressColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-amber-500";
    return "bg-primary";
  };

  if (isUnlimited) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <Infinity className="h-3 w-3" />
        <span>Unlimited</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Progress 
        value={percentage} 
        className="h-1.5"
        indicatorClassName={getProgressColor()}
      />
      <p className={cn(
        "text-xs",
        isAtLimit ? "text-red-500" : isNearLimit ? "text-amber-500" : "text-muted-foreground"
      )}>
        {used} of {limit} used
      </p>
    </div>
  );
}


