"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, Loader2, CheckCircle2 } from "lucide-react";
import type { TimeSlot } from "../types";

interface StepDateTimeProps {
  availableDates: Date[];
  availableSlots: TimeSlot[];
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
  isLoadingSlots: boolean;
}

export function StepDateTime({
  availableDates,
  availableSlots,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  isLoadingSlots,
}: StepDateTimeProps) {
  const AM_SLOTS = availableSlots.filter((s) => {
    const h = parseInt(s.time.split(":")[0]);
    return h < 12;
  });
  const PM_SLOTS = availableSlots.filter((s) => {
    const h = parseInt(s.time.split(":")[0]);
    return h >= 12;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Selecciona una fecha
        </p>

        <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-1 px-1">
          {availableDates.slice(0, 21).map((date, index) => {
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const dayName = format(date, "EEE", { locale: es });
            const dayNum = format(date, "d");

            return (
              <motion.button
                key={date.toISOString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelectDate(date)}
                className={cn(
                  "snap-start shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border-2 transition-all duration-200 min-w-[72px]",
                  "hover:shadow-sm active:scale-95",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border/40 hover:border-primary/40 bg-card/60"
                )}
              >
                <span className="text-xs font-medium opacity-70">{dayName}</span>
                <span className="text-xl font-bold leading-none">{dayNum}</span>
                {isToday && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Hoy</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoadingSlots ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-12"
          >
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </motion.div>
        ) : selectedDate && availableSlots.length > 0 ? (
          <motion.div
            key="slots"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Horarios disponibles
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({availableSlots.filter((s) => s.available).length} disponibles)
              </span>
            </p>

            {AM_SLOTS.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Mañana</p>
                <div className="flex flex-wrap gap-2">
                  {AM_SLOTS.map((slot, i) => (
                    <motion.button
                      key={slot.time}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.015 }}
                      disabled={!slot.available}
                      onClick={() => slot.available && onSelectTime(slot.time)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 min-w-[80px] text-center",
                        "active:scale-95",
                        !slot.available
                          ? "border-border/20 bg-muted/30 text-muted-foreground/40 line-through cursor-not-allowed"
                          : selectedTime === slot.time
                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "border-border/40 hover:border-primary/40 bg-card/60 hover:shadow-sm cursor-pointer"
                      )}
                    >
                      {slot.time}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {PM_SLOTS.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Tarde</p>
                <div className="flex flex-wrap gap-2">
                  {PM_SLOTS.map((slot, i) => (
                    <motion.button
                      key={slot.time}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.015 }}
                      disabled={!slot.available}
                      onClick={() => slot.available && onSelectTime(slot.time)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 min-w-[80px] text-center",
                        "active:scale-95",
                        !slot.available
                          ? "border-border/20 bg-muted/30 text-muted-foreground/40 line-through cursor-not-allowed"
                          : selectedTime === slot.time
                            ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "border-border/40 hover:border-primary/40 bg-card/60 hover:shadow-sm cursor-pointer"
                      )}
                    >
                      {slot.time}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {selectedTime && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <span className="text-foreground">
                  Cita programada para el{" "}
                  <strong>{selectedDate && format(selectedDate, "d 'de' MMMM", { locale: es })}</strong> a las{" "}
                  <strong>{selectedTime}</strong>
                </span>
              </motion.div>
            )}
          </motion.div>
        ) : selectedDate ? (
          <motion.div
            key="no-slots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No hay horarios disponibles para esta fecha.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Selecciona otra fecha.</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}