"use client";

import { useState, useCallback, useEffect } from "react";
import { scheduleService } from "../services/schedule-service";
import type { Schedule } from "../types";

export function useSchedule(specialistId?: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    if (!specialistId) {
      setSchedules([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await scheduleService.getSpecialistSchedule(specialistId);
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar horarios");
    } finally {
      setIsLoading(false);
    }
  }, [specialistId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const createSchedule = useCallback(async (
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ) => {
    if (!specialistId) throw new Error("ID de especialista requerido");
    
    setIsLoading(true);
    setError(null);
    try {
      const schedule = await scheduleService.create(specialistId, dayOfWeek, startTime, endTime);
      setSchedules((prev) => {
        const existing = prev.find((s) => s.dayOfWeek === dayOfWeek);
        if (existing) {
          return prev.map((s) => (s.dayOfWeek === dayOfWeek ? schedule : s));
        }
        return [...prev, schedule];
      });
      return schedule;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear horario";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, [specialistId]);

  const updateSchedule = useCallback(async (id: string, data: Partial<Schedule>) => {
    setIsLoading(true);
    setError(null);
    try {
      const schedule = await scheduleService.update(id, data);
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? schedule : s))
      );
      return schedule;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar horario";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await scheduleService.delete(id);
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: false } : s))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar horario";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getScheduleForDay = useCallback((dayOfWeek: number) => {
    return schedules.find((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  }, [schedules]);

  const isWorkingDay = useCallback((dayOfWeek: number) => {
    return schedules.some((s) => s.dayOfWeek === dayOfWeek && s.isActive);
  }, [schedules]);

  return {
    schedules,
    isLoading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleForDay,
    isWorkingDay,
    refetch: fetchSchedules,
  };
}