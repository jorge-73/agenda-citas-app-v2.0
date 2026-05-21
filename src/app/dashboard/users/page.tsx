"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Plus, Trash2, Shield, Loader2, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { getUsersAction, createUserAction, updateUserRoleAction, deleteUserAction } from "@/features/users/actions";
import { formatDate } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  SPECIALIST: "Especialista",
  RECEPTIONIST: "Recepcionista",
  PATIENT: "Paciente",
};
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  SPECIALIST: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RECEPTIONIST: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  PATIENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

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

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "PATIENT" });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    const data = await getUsersAction();
    setUsers(data as UserData[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Completa todos los campos");
      return;
    }
    setSaving(true);
    try {
      await createUserAction(newUser);
      toast.success("Usuario creado correctamente");
      setModalOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "PATIENT" });
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

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`¿Eliminar usuario ${email}?`)) return;
    try {
      await deleteUserAction(userId);
      toast.success("Usuario eliminado");
      fetchUsers();
    } catch {
      toast.error("Error al eliminar usuario");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Administra los usuarios del sistema"
        icon={Users}
        actions={
          <Button onClick={() => setModalOpen(true)} className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Usuario</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Rol</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Registro</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{u.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <Select
                      value={u.role}
                      onValueChange={(value) => handleRoleChange(u.id, value)}
                    >
                      <SelectTrigger className={`w-36 h-8 text-xs rounded-lg ${ROLE_COLORS[u.role] || ""}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(u.id, u.email)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uname">Nombre</Label>
              <Input id="uname" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uemail">Email</Label>
              <Input id="uemail" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upassword">Contraseña</Label>
              <Input id="upassword" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Rol</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving} className="rounded-xl">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : "Crear usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}