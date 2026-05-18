"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addMinutes } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AppointmentStatus, APPOINTMENT_STATUS_LABELS } from "../types";
import { toast } from "sonner";
import { getPatientsList, getSpecialistsList, createAppointment, updateAppointment } from "../actions";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Seleccione un paciente"),
  specialistId: z.string().min(1, "Seleccione un especialista"),
  date: z.string().min(1, "Seleccione una fecha"),
  startTime: z.string().min(1, "Seleccione una hora"),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    id?: string;
    patientId?: string;
    specialistId?: string;
    startTime?: Date;
    endTime?: Date;
    reason?: string;
    notes?: string;
    status?: AppointmentStatus;
  };
  isEdit?: boolean;
}

export function AppointmentModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
  isEdit = false,
}: AppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<{ id: string; name: string; email: string }[]>([]);
  const [specialists, setSpecialists] = useState<{ id: string; name: string; specialty: string }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: initialData?.patientId || "",
      specialistId: initialData?.specialistId || "",
      date: initialData?.startTime ? format(initialData.startTime, "yyyy-MM-dd") : "",
      startTime: initialData?.startTime ? format(initialData.startTime, "HH:mm") : "",
      reason: initialData?.reason || "",
      notes: initialData?.notes || "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      const [patientsData, specialistsData] = await Promise.all([
        getPatientsList(),
        getSpecialistsList(),
      ]);
      setPatients(patientsData);
      setSpecialists(specialistsData);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue("patientId", initialData.patientId || "");
        setValue("specialistId", initialData.specialistId || "");
        setValue("date", initialData.startTime ? format(initialData.startTime, "yyyy-MM-dd") : "");
        setValue("startTime", initialData.startTime ? format(initialData.startTime, "HH:mm") : "");
        setValue("reason", initialData.reason || "");
        setValue("notes", initialData.notes || "");
      } else {
        reset();
      }
    }
  }, [open, initialData, setValue, reset]);

  const onSubmit = async (data: AppointmentFormData) => {
    setIsLoading(true);
    try {
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = addMinutes(startDateTime, 30);

      if (isEdit && initialData?.id) {
        await updateAppointment(initialData.id, {
          patientId: data.patientId,
          specialistId: data.specialistId,
          startTime: startDateTime,
          endTime: endDateTime,
          reason: data.reason,
          notes: data.notes,
        });
        toast.success("Cita actualizada correctamente");
      } else {
        await createAppointment({
          patientId: data.patientId,
          specialistId: data.specialistId,
          startTime: startDateTime,
          endTime: endDateTime,
          reason: data.reason,
          notes: data.notes,
        });
        toast.success("Cita creada correctamente");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Error al guardar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Actualiza los datos de la cita" : "Programa una nueva cita médica"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientId">Paciente</Label>
            <Select
              value={watch("patientId")}
              onValueChange={(value) => setValue("patientId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name || "Paciente"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patientId && (
              <p className="text-sm text-red-500">{errors.patientId.message}</p>
            )}
          </div>

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
                    {specialist.name || specialist.specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialistId && (
              <p className="text-sm text-red-500">{errors.specialistId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input type="date" {...register("date")} />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora</Label>
              <Input type="time" {...register("startTime")} />
              {errors.startTime && (
                <p className="text-sm text-red-500">{errors.startTime.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de consulta</Label>
            <Input placeholder="Ej: Control mensual" {...register("reason")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea placeholder="Notas adicionales..." {...register("notes")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear Cita"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}