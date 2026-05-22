"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  type?: "card" | "table" | "list" | "detail" | "inline";
  count?: number;
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
};

export function LoadingState({
  type = "list",
  count = 3,
  className,
}: LoadingStateProps) {
  if (type === "inline") {
    return (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-block h-4 w-40 bg-muted/50 rounded animate-pulse"
      />
    );
  }

  if (type === "card") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <motion.div key={i} variants={itemVariants} className="rounded-2xl border border-border/40 bg-card/70 p-5 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === "table") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("rounded-2xl border border-border/40 bg-card/70 overflow-hidden", className)}
      >
        <Skeleton className="h-12 w-full rounded-none" />
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            className="flex items-center gap-4 px-6 py-4 border-t border-border/20"
          >
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (type === "detail") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn("space-y-6 p-6", className)}
      >
        <motion.div variants={itemVariants} className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </motion.div>
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-3", className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div key={i} variants={itemVariants} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
