"use client";

import { useState, useCallback, useEffect } from "react";
import { patientService } from "../services/patient-service";
import { PatientFilters, CreatePatientInput, UpdatePatientInput, type Patient } from "../types";

interface UsePatientsOptions {
  initialFilters?: PatientFilters;
  initialPage?: number;
}

export function usePatients(options?: UsePatientsOptions) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PatientFilters>(options?.initialFilters || {});
  const [pagination, setPagination] = useState({
    page: options?.initialPage || 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await patientService.getAll(filters, pagination.page, pagination.limit);
      setPatients(result.patients);
      setPagination((prev) => ({
        ...prev,
        total: result.total,
        totalPages: result.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar pacientes");
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPatients();
  }, [fetchPatients]);

  const createPatient = useCallback(async (input: CreatePatientInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const patient = await patientService.create(input);
      setPatients((prev) => [patient, ...prev]);
      return patient;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear paciente";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePatient = useCallback(async (input: UpdatePatientInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const patient = await patientService.update(input);
      setPatients((prev) =>
        prev.map((p) => (p.id === patient.id ? patient : p))
      );
      return patient;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar paciente";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletePatient = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await patientService.delete(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar paciente";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchPatients = useCallback(async (query: string) => {
    return patientService.search(query);
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const applyFilters = useCallback((newFilters: PatientFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    patients,
    isLoading,
    error,
    filters,
    pagination,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    setPage,
    applyFilters,
    clearFilters,
    refetch: fetchPatients,
  };
}