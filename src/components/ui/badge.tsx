import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-md shadow-primary/20",
        secondary: "border-transparent bg-secondary/60 text-secondary-foreground",
        destructive: "border-transparent bg-destructive/90 text-destructive-foreground shadow-md shadow-destructive/20",
        success: "border-transparent bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
        warning: "border-transparent bg-amber-500/20 text-amber-600 dark:text-amber-400",
        info: "border-transparent bg-sky-500/20 text-sky-600 dark:text-sky-400",
        outline: "text-foreground/80 border-border/60",
        soft: "border-transparent bg-primary/10 text-primary",
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