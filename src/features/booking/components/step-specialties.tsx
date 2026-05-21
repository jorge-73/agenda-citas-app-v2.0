"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPECIALTY_ICONS } from "../types";
import { Stethoscope } from "lucide-react";

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

const GRADIENTS: Record<string, string> = {
  "Medicina General": "from-emerald-500/20 to-emerald-600/5",
  "Cardiología": "from-rose-500/20 to-rose-600/5",
  "Neurología": "from-violet-500/20 to-violet-600/5",
  "Oftalmología": "from-sky-500/20 to-sky-600/5",
  "Pediatría": "from-amber-500/20 to-amber-600/5",
  "Dermatología": "from-teal-500/20 to-teal-600/5",
  "Ginecología": "from-pink-500/20 to-pink-600/5",
  "Ortopedia": "from-indigo-500/20 to-indigo-600/5",
  "Endocrinología": "from-orange-500/20 to-orange-600/5",
  "Gastroenterología": "from-lime-500/20 to-lime-600/5",
  "Psiquiatría": "from-purple-500/20 to-purple-600/5",
  "Urología": "from-cyan-500/20 to-cyan-600/5",
  "Oncología": "from-red-500/20 to-red-600/5",
  "Neumología": "from-blue-500/20 to-blue-600/5",
  "Nefrología": "from-yellow-500/20 to-yellow-600/5",
};

export function StepSpecialties({ specialties, selected, onSelect, isLoading }: StepSpecialtiesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/40 p-5 animate-pulse">
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
        const icon = SPECIALTY_ICONS[specialty.name] || "🏥";
        const gradient = GRADIENTS[specialty.name] || "from-primary/20 to-primary/5";
        const isSelected = selected === specialty.name;

        return (
          <motion.button
            key={specialty.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onClick={() => onSelect(specialty.name)}
            className={cn(
              "relative group text-left rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200",
              "hover:shadow-md active:scale-[0.98]",
              isSelected
                ? "border-primary bg-gradient-to-br shadow-lg shadow-primary/10"
                : `${gradient} border-border/40 hover:border-primary/40 bg-card/60`
            )}
          >
            <div className="flex flex-col items-start gap-3">
              <span className="text-3xl sm:text-4xl leading-none">{icon}</span>
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
                <Stethoscope className="h-3 w-3 text-primary-foreground" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}