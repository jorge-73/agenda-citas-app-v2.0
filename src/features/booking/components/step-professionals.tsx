"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getInitials } from "@/lib/utils";
import { Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Specialist {
  id: string;
  name: string;
  specialty: string;
  price?: number | null;
  bio?: string | null;
}

interface StepProfessionalsProps {
  specialists: Specialist[];
  selected: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function StepProfessionals({ specialists, selected, onSelect, isLoading }: StepProfessionalsProps) {
  const [search, setSearch] = useState("");

  const filtered = specialists.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.specialty.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 p-5 animate-pulse flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (specialists.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay especialistas disponibles para esta especialidad.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar especialista..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-12 bg-card/60 border-border/40"
        />
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto -mx-1 px-1">
        <AnimatePresence mode="popLayout">
          {filtered.map((specialist, index) => {
            const isSelected = selected === specialist.id;
            return (
              <motion.button
                key={specialist.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ delay: index * 0.03, duration: 0.2 }}
                onClick={() => onSelect(specialist.id)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-4 transition-all duration-200",
                  "hover:-translate-y-0.5 hover:shadow-md hover:border-primary/20 active:scale-[0.99]",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                    : "border-border/40 hover:border-primary/30 bg-card/60"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {getInitials(specialist.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{specialist.name}</p>
                    <p className="text-sm text-muted-foreground">{specialist.specialty}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {specialist.price && (
                        <span className="text-xs font-medium text-success">
                          ${specialist.price.toLocaleString("es-CL")}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No se encontraron especialistas con ese nombre.</p>
        </div>
      )}
    </div>
  );
}