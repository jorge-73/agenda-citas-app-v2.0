"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createPatientAction, updatePatientAction } from "../actions";
import { BLOOD_TYPES } from "../types";

const patientSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  document: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  insurance: z.string().optional(),
  insuranceNumber: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    id?: string;
    userId?: string;
    name?: string;
    email?: string;
    phone?: string;
    document?: string;
    birthDate?: Date;
    address?: string;
    emergencyContact?: string;
    bloodType?: string;
    allergies?: string;
    medicalConditions?: string;
    insurance?: string;
    insuranceNumber?: string;
  };
  isEdit?: boolean;
}

export function PatientModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
  isEdit = false,
}: PatientModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      document: initialData?.document || "",
      birthDate: initialData?.birthDate ? new Date(initialData.birthDate).toISOString().split("T")[0] : "",
      address: initialData?.address || "",
      emergencyContact: initialData?.emergencyContact || "",
      bloodType: initialData?.bloodType || "",
      allergies: initialData?.allergies || "",
      medicalConditions: initialData?.medicalConditions || "",
      insurance: initialData?.insurance || "",
      insuranceNumber: initialData?.insuranceNumber || "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue("name", initialData.name || "");
        setValue("email", initialData.email || "");
        setValue("phone", initialData.phone || "");
        setValue("document", initialData.document || "");
        setValue("birthDate", initialData.birthDate ? new Date(initialData.birthDate).toISOString().split("T")[0] : "");
        setValue("address", initialData.address || "");
        setValue("emergencyContact", initialData?.emergencyContact || "");
        setValue("bloodType", initialData.bloodType || "");
        setValue("allergies", initialData.allergies || "");
        setValue("medicalConditions", initialData.medicalConditions || "");
        setValue("insurance", initialData.insurance || "");
        setValue("insuranceNumber", initialData.insuranceNumber || "");
      } else {
        reset();
      }
    }
  }, [open, initialData, setValue, reset]);

  const onSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData?.id) {
        await updatePatientAction(initialData.id, data);
        toast.success("Paciente actualizado correctamente");
      } else {
        await createPatientAction(data);
        toast.success("Paciente creado correctamente");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar el paciente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Paciente" : "Nuevo Paciente"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Actualiza los datos del paciente" : "Registra un nuevo paciente en el sistema"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input {...register("name")} placeholder="Juan Pérez" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input type="email" {...register("email")} placeholder="juan@ejemplo.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input {...register("phone")} placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">Documento</Label>
              <Input {...register("document")} placeholder="12345678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de nacimiento</Label>
              <Input type="date" {...register("birthDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input {...register("address")} placeholder="Calle 123, Ciudad" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contacto de emergencia</Label>
              <Input {...register("emergencyContact")} placeholder="Nombre - Teléfono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodType">Tipo de sangre</Label>
              <Select value={watch("bloodType")} onValueChange={(v) => setValue("bloodType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Información Médica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea {...register("allergies")} placeholder="列出过敏原" className="min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Condiciones médicas</Label>
                <Textarea {...register("medicalConditions")} placeholder="列出发性疾病" className="min-h-[80px]" />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Información de Seguro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insurance">Seguro médico</Label>
                <Input {...register("insurance")} placeholder="Nombre del seguro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Número de seguro</Label>
                <Input {...register("insuranceNumber")} placeholder="Número de póliza" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear Paciente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}