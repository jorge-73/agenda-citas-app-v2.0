import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 
          "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95",
        destructive: 
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/95",
        outline: 
          "border border-border/60 bg-transparent hover:bg-accent/40 hover:border-accent/60 active:bg-accent/60",
        secondary: 
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
        ghost: 
          "hover:bg-accent/50 hover:text-accent-foreground active:bg-accent/60",
        link: 
          "text-primary underline-offset-4 hover:underline",
        gradient: 
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 active:bg-primary/95",
        soft: 
          "bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/30",
        subtle:
          "bg-muted/50 text-foreground hover:bg-muted/70 active:bg-muted",
        surface:
          "bg-card border border-border/50 text-foreground hover:bg-muted/50 hover:border-border active:bg-muted",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-xl px-4 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        xl: "h-12 rounded-2xl px-8 text-lg",
        icon: "h-10 w-10 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-xl",
        "icon-lg": "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };