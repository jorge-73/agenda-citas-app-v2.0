"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

function Calendar({
  selected,
  onSelect,
  disabled,
  minDate,
  maxDate,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected || new Date()
  );

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const isDateDisabled = (date: Date) => {
    if (disabled && disabled(date)) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <button
          onClick={nextMonth}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = selected && isSameDay(day, selected);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDisabled = isDateDisabled(day);

          return (
            <button
              key={index}
              onClick={() => !isDisabled && onSelect?.(day)}
              disabled={isDisabled}
              className={cn(
                "h-8 w-8 rounded-md text-sm transition-colors",
                !isCurrentMonth && "text-zinc-300",
                isDisabled && "opacity-50 cursor-not-allowed",
                isSelected &&
                  "bg-zinc-900 text-white hover:bg-zinc-900",
                !isSelected &&
                  !isDisabled &&
                  "hover:bg-zinc-100",
                !isSelected && isCurrentMonth && "text-zinc-700"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Calendar };