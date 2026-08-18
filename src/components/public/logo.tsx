import Link from "next/link";
import { motion } from "framer-motion";
import { HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: { box: "h-9 w-9 rounded-xl", icon: "h-5 w-5", text: "text-lg" },
  md: { box: "h-10 w-10 rounded-xl", icon: "h-5.5 w-5.5", text: "text-xl" },
  lg: { box: "h-12 w-12 rounded-xl", icon: "h-6 w-6", text: "text-2xl" },
} as const;

export function Logo({
  href = "/",
  size = "md",
  showWordmark = true,
  className,
}: LogoProps) {
  const classes = SIZE_CLASSES[size];

  return (
    <Link href={href} className={cn("flex items-center gap-3 group", className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm shadow-primary/20 shrink-0",
          classes.box
        )}
      >
        <HeartPulse className={cn("text-primary-foreground", classes.icon)} />
      </motion.div>
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight text-foreground",
            classes.text
          )}
        >
          CitasMed
        </span>
      )}
    </Link>
  );
}