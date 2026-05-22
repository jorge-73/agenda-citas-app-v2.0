"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentFilters,
  AppointmentStatus,
} from "../types";
import {
  getFilteredAppointmentsAction,
  createAppointment as createAppointmentAction,
  updateAppointment as updateAppointmentAction,
} from "../actions";

interface UseAppointmentsOptions {
  initialFilters?: AppointmentFilters;
}

export function useAppointments(options?: UseAppointmentsOptions) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>(
    options?.initialFilters || {}
  );

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFilteredAppointmentsAction(filters);
      setAppointments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar citas"
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const createAppointment = useCallback(
    async (input: CreateAppointmentInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const appointment = await createAppointmentAction(input);
        setAppointments((prev) => [...prev, appointment]);
        return appointment;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al crear cita";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateAppointment = useCallback(
    async (input: UpdateAppointmentInput) => {
      const { id, ...data } = input;
      setIsLoading(true);
      setError(null);
      try {
        const appointment = await updateAppointmentAction(id, data);
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointment.id ? appointment : a))
        );
        return appointment;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al actualizar cita";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const cancelAppointment = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateAppointmentAction(id, { status: "CANCELLED" });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al cancelar cita";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rescheduleAppointment = useCallback(
    async (id: string, startTime: Date, endTime: Date) => {
      setIsLoading(true);
      setError(null);
      try {
        const appointment = await updateAppointmentAction(id, {
          startTime,
          endTime,
        });
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointment.id ? appointment : a))
        );
        return appointment;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error al reagendar cita";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      setIsLoading(true);
      setError(null);
      try {
        await updateAppointmentAction(id, { status });
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Error al actualizar estado";
        setError(message);
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const applyFilters = useCallback(
    (newFilters: AppointmentFilters) => {
      setFilters(newFilters);
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    appointments,
    isLoading,
    error,
    filters,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    rescheduleAppointment,
    updateStatus,
    applyFilters,
    clearFilters,
    refetch: fetchAppointments,
  };
}