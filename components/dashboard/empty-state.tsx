import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Link href={secondaryAction.href}>
              <Button variant="outline">{secondaryAction.label}</Button>
            </Link>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}


