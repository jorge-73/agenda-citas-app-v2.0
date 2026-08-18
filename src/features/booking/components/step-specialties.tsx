"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPECIALTY_ICONS } from "../types";
import { Stethoscope, Check } from "lucide-react";

interface Specialty {
  name: string;
  count: number;
}

interface StepSpecialtiesProps {
  specialties: Specialty[];
  selected: string | null;
  onSelect: (specialty: string) => void;
  isLoading: boolean;
}

export function StepSpecialties({ specialties, selected, onSelect, isLoading }: StepSpecialtiesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 p-5 animate-pulse">
            <div className="h-10 w-10 rounded-xl bg-muted mb-3" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {specialties.map((specialty, index) => {
        const Icon = SPECIALTY_ICONS[specialty.name] || Stethoscope;
        const isSelected = selected === specialty.name;

        return (
          <motion.button
            key={specialty.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onClick={() => onSelect(specialty.name)}
            className={cn(
              "relative group text-left rounded-xl border-2 p-4 sm:p-5 transition-all duration-200 cursor-pointer",
              "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border/40 hover:border-primary/40 bg-card/60"
            )}
          >
            <div className="flex flex-col items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Icon className="h-5.5 w-5.5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-foreground">{specialty.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {specialty.count} {specialty.count === 1 ? "especialista" : "especialistas"}
                </p>
              </div>
            </div>
            {isSelected && (
              <motion.div
                layoutId="specialty-check"
                className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Check className="h-3.5 w-3.5 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}