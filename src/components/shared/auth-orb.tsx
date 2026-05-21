"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthOrbProps {
  className: string;
  delay?: number;
}

export function AuthOrb({ className, delay = 0 }: AuthOrbProps) {
  return (
    <motion.div
      className={cn("absolute rounded-full blur-3xl pointer-events-none", className)}
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -50, 30, 0],
        scale: [1, 1.15, 0.9, 1],
      }}
      transition={{
        duration: 15 + delay,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}
