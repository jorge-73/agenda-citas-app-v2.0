import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function PremiumCard({ children, className, hover = true }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm overflow-hidden",
        hover && "hover:shadow-lg hover:border-primary/10 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PremiumCardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PremiumCardHeader({ title, description, action, className }: PremiumCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between px-6 py-5 border-b border-border/30", className)}>
      <div className="space-y-0.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface PremiumCardContentProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export function PremiumCardContent({ children, className, padding = true }: PremiumCardContentProps) {
  return (
    <div className={cn(padding && "px-6 py-5", className)}>
      {children}
    </div>
  );
}