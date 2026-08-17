"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import type { CalendarView } from "../hooks/use-calendar";

interface CalendarToolbarProps {
  title: string;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function CalendarToolbar({
  title,
  view,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
}: CalendarToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onToday}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Hoy
        </Button>
        <div className="flex items-center border rounded-md">
          <Button variant="ghost" size="icon" onClick={onPrevious} aria-label="Periodo anterior">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} aria-label="Periodo siguiente">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold ml-2">{title}</h2>
      </div>

      <Select value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Día</SelectItem>
          <SelectItem value="week">Semana</SelectItem>
          <SelectItem value="month">Mes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}