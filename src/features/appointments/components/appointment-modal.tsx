"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatInTz, AR_TZ } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AppointmentStatus } from "../types";
import { toast } from "sonner";
import { getPatientsList, getSpecialistsList, createAppointment, updateAppointment } from "../actions";
import { Calendar, Clock, User, Stethoscope, FileText, ScrollText, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  onDelete?: (id: string) => void;
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
  onDelete,
  initialData,
  isEdit = false,
}: AppointmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      date: initialData?.startTime ? formatInTz(initialData.startTime, "yyyy-MM-dd", AR_TZ) : "",
      startTime: initialData?.startTime ? formatInTz(initialData.startTime, "HH:mm", AR_TZ) : "",
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
        setValue("date", initialData.startTime ? formatInTz(initialData.startTime, "yyyy-MM-dd", AR_TZ) : "");
        setValue("startTime", initialData.startTime ? formatInTz(initialData.startTime, "HH:mm", AR_TZ) : "");
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
      if (isEdit && initialData?.id) {
        await updateAppointment(initialData.id, {
          patientId: data.patientId,
          specialistId: data.specialistId,
          date: data.date,
          time: data.startTime,
          reason: data.reason,
          notes: data.notes,
        });
        toast.success("Cita actualizada correctamente");
      } else {
        await createAppointment({
          patientId: data.patientId,
          specialistId: data.specialistId,
          date: data.date,
          time: data.startTime,
          reason: data.reason,
          notes: data.notes,
        });
        toast.success("Cita creada correctamente");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Error al guardar la cita");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden light:bg-stone-50/60 dark:bg-card">
        {/* Header with gradient */}
        <DialogHeader className="bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8">
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Editar Cita" : "Nueva Cita"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit ? "Actualiza los datos de la cita médica" : "Programa una nueva cita médica"}
          </DialogDescription>
        </DialogHeader>
        
        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Patient Selection */}
            <div className="space-y-2">
              <Label htmlFor="patientId" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Paciente
              </Label>
              <Select
                value={watch("patientId")}
                onValueChange={(value) => setValue("patientId", value)}
              >
                <SelectTrigger id="patientId" className={cn(
                  "h-11 bg-card border-border",
                  errors.patientId && "border-destructive focus:border-destructive"
                )}>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {patient.name || "Paciente"}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.patientId && (
                <p className="text-sm text-destructive">{errors.patientId.message}</p>
              )}
            </div>

            {/* Specialist Selection */}
            <div className="space-y-2">
              <Label htmlFor="specialistId" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-muted-foreground" />
                Especialista
              </Label>
              <Select
                value={watch("specialistId")}
                onValueChange={(value) => setValue("specialistId", value)}
              >
                <SelectTrigger id="specialistId" className={cn(
                  "h-11 bg-card border-border",
                  errors.specialistId && "border-destructive focus:border-destructive"
                )}>
                  <SelectValue placeholder="Seleccionar especialista" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  {specialists.map((specialist) => (
                    <SelectItem key={specialist.id} value={specialist.id}>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        {specialist.name} - {specialist.specialty}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialistId && (
                <p className="text-sm text-destructive">{errors.specialistId.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Fecha
                </Label>
                <Input 
                  type="date" 
                  {...register("date")}
                  className={cn(
                    "h-11 bg-card border-border",
                    errors.date && "border-destructive focus:border-destructive"
                  )}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Hora
                </Label>
                <Input 
                  type="time" 
                  {...register("startTime")}
                  className={cn(
                    "h-11 bg-card border-border",
                    errors.startTime && "border-destructive focus:border-destructive"
                  )}
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive">{errors.startTime.message}</p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Motivo de consulta
              </Label>
              <Input 
                placeholder="Ej: Control mensual" 
                {...register("reason")}
                className="h-11 bg-card border-border"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-muted-foreground" />
                Notas adicionales
              </Label>
              <Textarea 
                placeholder="Notas adicionales para la cita..." 
                {...register("notes")}
                className="min-h-[80px] resize-none bg-card border-border"
              />
            </div>

            {/* Footer Actions */}
            <DialogFooter className="gap-2 mt-2">
              {isEdit && onDelete && initialData?.id && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleteLoading}
                  aria-label="Eliminar cita"
                  onClick={async () => {
                    setDeleteLoading(true);
                    await onDelete(initialData.id!);
                    setDeleteLoading(false);
                  }}
                  className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/50"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={cn(isEdit && onDelete ? "flex-1" : "flex-1")}
                aria-label="Cancelar cita"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
                aria-label={isEdit ? "Actualizar cita" : "Crear nueva cita"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : isEdit ? "Actualizar" : "Crear Cita"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
