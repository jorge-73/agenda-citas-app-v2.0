import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border border-border/60 bg-transparent px-4 py-3 text-sm text-foreground",
          "placeholder:text-muted-foreground/60",
          "transition-all duration-200 ease-out",
          "resize-none",
          "hover:border-border/80 hover:shadow-sm",
          "focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 focus:ring-offset-2 focus:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
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