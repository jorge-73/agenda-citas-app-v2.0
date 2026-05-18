"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { SPECIALTIES } from "../types";

const specialistSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  specialty: z.string().min(1, "Seleccione una especialidad"),
  license: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  consultationDuration: z.number().optional(),
  price: z.string().optional(),
  isAvailable: z.boolean().optional(),
});

type SpecialistFormData = z.infer<typeof specialistSchema>;

interface SpecialistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    id?: string;
    userId?: string;
    name?: string;
    email?: string;
    specialty?: string;
    license?: string;
    phone?: string;
    bio?: string;
    consultationDuration?: number;
    price?: number;
    isAvailable?: boolean;
  };
  isEdit?: boolean;
}

export function SpecialistModal({
  open,
  onOpenChange,
  onSuccess,
  initialData,
  isEdit = false,
}: SpecialistModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SpecialistFormData>({
    resolver: zodResolver(specialistSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      specialty: initialData?.specialty || "",
      license: initialData?.license || "",
      phone: initialData?.phone || "",
      bio: initialData?.bio || "",
      consultationDuration: initialData?.consultationDuration || 30,
      price: initialData?.price?.toString() || "",
      isAvailable: initialData?.isAvailable ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setValue("name", initialData.name || "");
        setValue("email", initialData.email || "");
        setValue("specialty", initialData.specialty || "");
        setValue("license", initialData.license || "");
        setValue("phone", initialData.phone || "");
        setValue("bio", initialData.bio || "");
        setValue("consultationDuration", initialData.consultationDuration || 30);
        setValue("price", initialData.price?.toString() || "");
        setValue("isAvailable", initialData.isAvailable ?? true);
      } else {
        reset();
      }
    }
  }, [open, initialData, setValue, reset]);

  const onSubmit = async (data: SpecialistFormData) => {
    setIsLoading(true);
    try {
      if (isEdit && initialData?.id) {
        const user = await db.user.findUnique({ where: { email: data.email } });
        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: { name: data.name },
          });
        }
        await db.specialist.update({
          where: { id: initialData.id },
          data: {
            specialty: data.specialty,
            license: data.license || null,
            phone: data.phone || null,
            bio: data.bio || null,
            consultationDuration: data.consultationDuration || 30,
            price: data.price ? parseFloat(data.price) : null,
            isAvailable: data.isAvailable,
          },
        });
        toast.success("Especialista actualizado correctamente");
      } else {
        const existingUser = await db.user.findUnique({ where: { email: data.email } });
        
        let userId = initialData?.userId;
        
        if (!existingUser && !userId) {
          const newUser = await db.user.create({
            data: {
              email: data.email,
              name: data.name,
              password: "changeme123",
              role: "SPECIALIST",
            },
          });
          userId = newUser.id;
        } else if (existingUser) {
          userId = existingUser.id;
        }

        if (!userId) {
          throw new Error("No se pudo crear el usuario");
        }

        const existingSpecialist = await db.specialist.findUnique({ where: { userId } });
        if (existingSpecialist) {
          throw new Error("El especialista ya existe");
        }

        await db.specialist.create({
          data: {
            userId,
            specialty: data.specialty,
            license: data.license || null,
            phone: data.phone || null,
            bio: data.bio || null,
            consultationDuration: data.consultationDuration || 30,
            price: data.price ? parseFloat(data.price) : null,
            isAvailable: data.isAvailable ?? true,
          },
        });
        toast.success("Especialista creado correctamente");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Error al guardar el especialista");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Especialista" : "Nuevo Especialista"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Actualiza los datos del especialista" : "Registra un nuevo especialista en el sistema"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input {...register("name")} placeholder="Dr. Juan Pérez" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input type="email" {...register("email")} placeholder="doctor@ejemplo.com" />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad *</Label>
              <Select value={watch("specialty")} onValueChange={(v) => setValue("specialty", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((spec) => (
                    <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && <p className="text-sm text-red-500">{errors.specialty.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">Licencia médica</Label>
              <Input {...register("license")} placeholder="MP-12345" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input {...register("phone")} placeholder="+1234567890" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationDuration">Duración de consulta (min)</Label>
              <Input
                type="number"
                {...register("consultationDuration", { valueAsNumber: true })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Precio de consulta ($)</Label>
              <Input type="number" step="0.01" {...register("price")} placeholder="50.00" />
            </div>
            <div className="space-y-2 flex items-center gap-2 pt-6">
              <Switch
                checked={watch("isAvailable")}
                onCheckedChange={(checked) => setValue("isAvailable", checked)}
              />
              <Label>Disponible para citas</Label>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="bio">Biografía / Descripción</Label>
            <Textarea
              {...register("bio")}
              placeholder="Describe la experiencia y especialidades del profesional..."
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : isEdit ? "Actualizar" : "Crear Especialista"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}