"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createColumnHelper } from "@tanstack/react-table";
import { toast } from "sonner";
import { Users, Plus, Trash2, User, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getUsersAction, createUserAction, updateUserRoleAction, deleteUserAction } from "@/features/users/actions";
import { ROLE_LABELS, ROLE_COLORS } from "@/features/shared/constants";
import { cn, formatDate } from "@/lib/utils";

const userSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role: z.string().min(1, "Selecciona un rol"),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
  patient: { id: string } | null;
  specialist: { id: string; specialty: string } | null;
  _count: { accounts: number };
}

const columnHelper = createColumnHelper<UserData>();

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserData | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register, handleSubmit, reset, setValue, watch, formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", password: "", role: "" },
  });

  const selectedRole = watch("role");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUsersAction();
      setUsers(data as UserData[]);
    } catch {
      toast.error("Error al cargar usuarios");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const onCreateSubmit = async (data: UserFormData) => {
    setSaving(true);
    try {
      await createUserAction(data);
      toast.success("Usuario creado correctamente");
      setModalOpen(false);
      reset();
      fetchUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRoleAction(userId, role);
      toast.success("Rol actualizado");
      fetchUsers();
    } catch {
      toast.error("Error al actualizar rol");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUserAction(deleteTarget.id);
      toast.success("Usuario eliminado");
      setDeleteTarget(null);
      fetchUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    }
  };

  const columns = [
    columnHelper.accessor("name", {
      header: "Usuario",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-medium">{row.original.name || "—"}</span>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span>,
    }),
    columnHelper.accessor("role", {
      header: "Rol",
      cell: ({ row }) => (
        <Select
          value={row.original.role}
          onValueChange={(value) => handleRoleChange(row.original.id, value)}
        >
          <SelectTrigger className={cn(
            "w-36 h-8 text-xs rounded-lg font-medium",
            ROLE_COLORS[row.original.role] || ""
          )}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Registro",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acción",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteTarget(row.original)}
            aria-label="Eliminar usuario"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Administra los usuarios del sistema"
        icon={Users}
        actions={
          <Button onClick={() => { reset(); setModalOpen(true); }} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo usuario
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Buscar usuarios..."
        emptyMessage="No hay usuarios registrados"
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="u-name">Nombre</Label>
              <Input id="u-name" {...register("name")} className="rounded-xl" placeholder="Nombre completo" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-email">Email</Label>
              <Input id="u-email" type="email" {...register("email")} className="rounded-xl" placeholder="usuario@email.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-password">Contraseña</Label>
              <Input id="u-password" type="password" {...register("password")} className="rounded-xl" placeholder="Mínimo 6 caracteres" />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={selectedRole || undefined} onValueChange={(v) => setValue("role", v, { shouldValidate: true })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button type="submit" disabled={saving} className="rounded-xl">
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará al usuario <strong>{deleteTarget?.email}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

