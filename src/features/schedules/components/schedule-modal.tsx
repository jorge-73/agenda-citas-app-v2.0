"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createSchedule, getSpecialistsWithSchedules } from "../actions";

const scheduleSchema = z.object({
  specialistId: z.string().min(1, "Seleccione un especialista"),
  dayOfWeek: z.string().min(1, "Seleccione un día"),
  startTime: z.string().min(1, "Ingrese hora de inicio"),
  endTime: z.string().min(1, "Ingrese hora de fin"),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface Specialist {
  id: string;
  name: string;
  specialty: string;
}

interface ScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScheduleModal({ open, onOpenChange, onSuccess }: ScheduleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      specialistId: "",
      dayOfWeek: "",
      startTime: "08:00",
      endTime: "18:00",
    },
  });

  useEffect(() => {
    if (open) {
      getSpecialistsWithSchedules().then(setSpecialists);
    }
  }, [open]);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsLoading(true);
    try {
      await createSchedule({
        specialistId: data.specialistId,
        dayOfWeek: parseInt(data.dayOfWeek),
        startTime: data.startTime,
        endTime: data.endTime,
      });
      toast.success("Horario creado correctamente");
      onOpenChange(false);
      onSuccess?.();
      reset();
    } catch (error) {
      toast.error("Error al crear el horario");
    } finally {
      setIsLoading(false);
    }
  };

  const DAYS = [
    { value: "0", label: "Domingo" },
    { value: "1", label: "Lunes" },
    { value: "2", label: "Martes" },
    { value: "3", label: "Miércoles" },
    { value: "4", label: "Jueves" },
    { value: "5", label: "Viernes" },
    { value: "6", label: "Sábado" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Horario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialistId">Especialista</Label>
            <Select
              value={watch("specialistId")}
              onValueChange={(value) => setValue("specialistId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar especialista" />
              </SelectTrigger>
              <SelectContent>
                {specialists.map((specialist) => (
                  <SelectItem key={specialist.id} value={specialist.id}>
                    {specialist.name} - {specialist.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialistId && (
              <p className="text-sm text-red-500">{errors.specialistId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Día de la semana</Label>
            <Select
              value={watch("dayOfWeek")}
              onValueChange={(value) => setValue("dayOfWeek", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar día" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.dayOfWeek && (
              <p className="text-sm text-red-500">{errors.dayOfWeek.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora de inicio</Label>
              <Input type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora de fin</Label>
              <Input type="time" {...register("endTime")} />
              {errors.endTime && (
                <p className="text-sm text-red-500">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}