"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  format,
  isSameMonth,
  isSameDay,
  eachDayOfInterval
} from "date-fns";
import { es } from "date-fns/locale";
import type { CalendarEvent, AppointmentStatus, Appointment } from "../types";

export type CalendarView = "day" | "week" | "month";

interface UseCalendarOptions {
  onDateChange?: (date: Date) => void;
}

export function useCalendar(options?: UseCalendarOptions) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const navigateNext = useCallback(() => {
    let nextDate: Date;
    switch (view) {
      case "month":
        nextDate = addMonths(currentDate, 1);
        break;
      case "week":
        nextDate = addWeeks(currentDate, 1);
        break;
      case "day":
        nextDate = addDays(currentDate, 1);
        break;
      default:
        nextDate = currentDate;
    }
    setCurrentDate(nextDate);
    options?.onDateChange?.(nextDate);
  }, [currentDate, view, options]);

  const navigatePrevious = useCallback(() => {
    let prevDate: Date;
    switch (view) {
      case "month":
        prevDate = subMonths(currentDate, 1);
        break;
      case "week":
        prevDate = subWeeks(currentDate, 1);
        break;
      case "day":
        prevDate = subDays(currentDate, 1);
        break;
      default:
        prevDate = currentDate;
    }
    setCurrentDate(prevDate);
    options?.onDateChange?.(prevDate);
  }, [currentDate, view, options]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    options?.onDateChange?.(new Date());
  }, [options]);

  const goToDate = useCallback((date: Date) => {
    setCurrentDate(date);
    options?.onDateChange?.(date);
  }, [options]);

  const changeView = useCallback((newView: CalendarView) => {
    setView(newView);
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  }, []);

  const dateRange = useMemo(() => {
    switch (view) {
      case "month":
        return {
          start: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
          end: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
        };
      case "week":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 }),
        };
      case "day":
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
        };
      default:
        return {
          start: currentDate,
          end: currentDate,
        };
    }
  }, [currentDate, view]);

  const title = useMemo(() => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: es });
      case "week":
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
        if (isSameMonth(weekStart, weekEnd)) {
          return `${format(weekStart, "d", { locale: es })} - ${format(weekEnd, "d MMMM yyyy", { locale: es })}`;
        }
        return `${format(weekStart, "d MMM", { locale: es })} - ${format(weekEnd, "d MMM yyyy", { locale: es })}`;
      case "day":
        return format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
      default:
        return "";
    }
  }, [currentDate, view]);

  const days = useMemo(() => {
    return eachDayOfInterval(dateRange);
  }, [dateRange]);

  const hours = useMemo(() => {
    const hoursArray = [];
    for (let i = 8; i <= 20; i++) {
      hoursArray.push(i);
    }
    return hoursArray;
  }, []);

  return {
    currentDate,
    view,
    selectedDate,
    dateRange,
    title,
    days,
    hours,
    navigateNext,
    navigatePrevious,
    goToToday,
    goToDate,
    changeView,
    selectDate,
  };
}

export function useCalendarEvents(
  appointments: Appointment[],
  view: CalendarView
): CalendarEvent[] {
  return useMemo(() => {
    return appointments.map((apt) => ({
      id: apt.id,
      title: apt.patient?.user?.name || "Paciente",
      start: new Date(apt.startTime),
      end: new Date(apt.endTime),
      status: apt.status as AppointmentStatus,
      patientName: apt.patient?.user?.name || "Paciente",
      specialistName: apt.specialist?.user?.name || "Especialista",
      reason: apt.reason ?? undefined,
    }));
  }, [appointments, view]);
}