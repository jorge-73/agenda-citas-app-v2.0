import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border/60 bg-transparent px-4 py-2.5 text-sm text-foreground",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200 ease-out",
          "focus:outline-none",
          "focus:border-ring",
          "focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 focus:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 disabled:hover:border-border/60 disabled:hover:shadow-none",
          "hover:border-border/80",
          "hover:shadow-sm",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };