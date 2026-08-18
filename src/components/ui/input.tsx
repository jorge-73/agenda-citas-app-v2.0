import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-none bg-muted px-4 py-2.5 text-sm text-foreground shadow-none",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200 ease-out",
          "focus:outline-none",
          "focus:bg-muted focus:ring-2 focus:ring-ring/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:bg-muted/80",
          "aria-invalid:bg-destructive/5 aria-invalid:ring-destructive/30",
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