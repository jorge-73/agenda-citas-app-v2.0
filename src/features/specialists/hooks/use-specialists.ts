"use client";

import { useState, useCallback, useEffect } from "react";
import { specialistService } from "../services/specialist-service";
import { SpecialistFilters, CreateSpecialistInput, UpdateSpecialistInput, type Specialist } from "../types";

interface UseSpecialistsOptions {
  initialFilters?: SpecialistFilters;
  initialPage?: number;
}

export function useSpecialists(options?: UseSpecialistsOptions) {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SpecialistFilters>(options?.initialFilters || {});
  const [pagination, setPagination] = useState({
    page: options?.initialPage || 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchSpecialists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await specialistService.getAll(filters, pagination.page, pagination.limit);
      setSpecialists(result.specialists);
      setPagination((prev) => ({
        ...prev,
        total: result.total,
        totalPages: result.totalPages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar especialistas");
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  const createSpecialist = useCallback(async (input: CreateSpecialistInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const specialist = await specialistService.create(input);
      setSpecialists((prev) => [specialist, ...prev]);
      return specialist;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear especialista";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSpecialist = useCallback(async (input: UpdateSpecialistInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const specialist = await specialistService.update(input);
      setSpecialists((prev) =>
        prev.map((s) => (s.id === specialist.id ? specialist : s))
      );
      return specialist;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al actualizar especialista";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSpecialist = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await specialistService.delete(id);
      setSpecialists((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar especialista";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleAvailability = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const specialist = await specialistService.toggleAvailability(id);
      setSpecialists((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isAvailable: specialist.isAvailable } : s))
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cambiar disponibilidad";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchSpecialists = useCallback(async (query: string) => {
    return specialistService.search(query);
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const applyFilters = useCallback((newFilters: SpecialistFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  return {
    specialists,
    isLoading,
    error,
    filters,
    pagination,
    createSpecialist,
    updateSpecialist,
    deleteSpecialist,
    toggleAvailability,
    searchSpecialists,
    setPage,
    applyFilters,
    clearFilters,
    refetch: fetchSpecialists,
  };
}