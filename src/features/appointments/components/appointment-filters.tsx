"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from "../types";
import { getSpecialistsList } from "../actions";

interface AppointmentFiltersProps {
  filters: {
    specialistId?: string;
    status?: string;
  };
  onFilterChange: (filters: { specialistId?: string; status?: string }) => void;
}

interface SpecialistData {
  id: string;
  name: string;
  specialty: string;
}

export function AppointmentFilters({ filters, onFilterChange }: AppointmentFiltersProps) {
  const [specialists, setSpecialists] = useState<SpecialistData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchSpecialists() {
      const data = await getSpecialistsList();
      setSpecialists(data);
    }
    fetchSpecialists();
  }, []);

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value === "all" ? undefined : value });
  };

  const handleSpecialistChange = (value: string) => {
    onFilterChange({ ...filters, specialistId: value === "all" ? undefined : value });
  };

  const clearFilters = () => {
    onFilterChange({ specialistId: undefined, status: undefined });
  };

  const hasActiveFilters = filters.specialistId || filters.status;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              1
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 border-border/50 shadow-xl" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filtros</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Especialista</Label>
            <Select
              value={filters.specialistId || "all"}
              onValueChange={handleSpecialistChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los especialistas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {specialists.map((specialist) => (
                  <SelectItem key={specialist.id} value={specialist.id}>
                    {specialist.name || specialist.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {(Object.keys(APPOINTMENT_STATUS_LABELS) as AppointmentStatus[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {APPOINTMENT_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}