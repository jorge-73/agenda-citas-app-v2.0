import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm shadow-primary/20",
        secondary: "bg-secondary/60 text-secondary-foreground",
        destructive: "bg-destructive/90 text-destructive-foreground shadow-sm shadow-destructive/20",
        success: "bg-green-500/15 text-green-600 dark:text-green-400",
        warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        info: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
        outline: "border border-border/60 text-foreground/80",
        soft: "bg-primary/10 text-primary",
        subtle: "bg-muted/50 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };