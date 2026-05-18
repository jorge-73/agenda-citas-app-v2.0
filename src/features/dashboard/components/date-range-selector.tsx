"use client";

import { useState } from "react";
import { format, subDays, subWeeks, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "../hooks/use-dashboard-stats";

type PresetRange = {
  label: string;
  getValue: () => DateRange;
};

const PRESETS: PresetRange[] = [
  {
    label: "Hoy",
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    }
  },
  {
    label: "Últimos 7 días",
    getValue: () => {
      const today = new Date();
      const weekAgo = subDays(today, 7);
      return { from: weekAgo, to: today };
    }
  },
  {
    label: "Últimas 2 semanas",
    getValue: () => {
      const today = new Date();
      const twoWeeksAgo = subWeeks(today, 2);
      return { from: twoWeeksAgo, to: today };
    }
  },
  {
    label: "Último mes",
    getValue: () => {
      const today = new Date();
      const monthAgo = subMonths(today, 1);
      return { from: monthAgo, to: today };
    }
  },
  {
    label: "Últimos 3 meses",
    getValue: () => {
      const today = new Date();
      const threeMonthsAgo = subMonths(today, 3);
      return { from: threeMonthsAgo, to: today };
    }
  },
  {
    label: "Este mes",
    getValue: () => {
      const today = new Date();
      return { from: startOfMonth(today), to: endOfMonth(today) };
    }
  },
  {
    label: "Este año",
    getValue: () => {
      const today = new Date();
      return { from: startOfYear(today), to: endOfYear(today) };
    }
  }
];

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: PresetRange) => {
    const range = preset.getValue();
    onChange(range);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange) => {
    return `${format(range.from, "d MMM", { locale: es })} - ${format(range.to, "d MMM yyyy", { locale: es })}`;
  };

  const isPresetActive = (preset: PresetRange) => {
    const presetRange = preset.getValue();
    return (
      format(presetRange.from, "yyyy-MM-dd") === format(value.from, "yyyy-MM-dd") &&
      format(presetRange.to, "yyyy-MM-dd") === format(value.to, "yyyy-MM-dd")
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? formatDateRange(value) : "Seleccionar rango"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <div className="space-y-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                  isPresetActive(preset)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}