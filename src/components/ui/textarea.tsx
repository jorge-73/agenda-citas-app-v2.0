import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-xl border-none bg-muted px-4 py-3 text-sm text-foreground shadow-none",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200 ease-out",
          "resize-none",
          "hover:bg-muted/80",
          "focus:outline-none focus:bg-muted focus:ring-2 focus:ring-ring/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:bg-destructive/5 aria-invalid:ring-destructive/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };