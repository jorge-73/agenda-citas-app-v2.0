"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, User, Bell, Palette, Shield, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getProfileAction, updatePreferencesAction } from "@/features/settings/actions";
import { updateProfileAction, changePasswordAction } from "@/features/auth/actions";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    timezone: string;
    emailNotifications: boolean;
    appointmentReminders: boolean;
    newBookingAlerts: boolean;
    weeklyReport: boolean;
  }>({
    name: "",
    email: "",
    phone: "",
    timezone: "america-mexico_city",
    emailNotifications: true,
    appointmentReminders: true,
    newBookingAlerts: true,
    weeklyReport: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    getProfileAction().then((user) => {
      if (user) {
        setProfile({
          name: user.name || "",
          email: user.email,
          phone: user.patient?.phone || "",
          timezone: user.preferences?.timezone || "america-mexico_city",
          emailNotifications: user.preferences?.emailNotifications ?? true,
          appointmentReminders: user.preferences?.appointmentReminders ?? true,
          newBookingAlerts: user.preferences?.newBookingAlerts ?? true,
          weeklyReport: user.preferences?.weeklyReport ?? false,
        });
      }
    });
  }, []);

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      const result = await updateProfileAction({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        timezone: profile.timezone,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al guardar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    setIsLoading(true);
    try {
      const result = await updatePreferencesAction({
        emailNotifications: profile.emailNotifications,
        appointmentReminders: profile.appointmentReminders,
        newBookingAlerts: profile.newBookingAlerts,
        weeklyReport: profile.weeklyReport,
        timezone: profile.timezone,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Preferencias guardadas correctamente");
    } catch {
      toast.error("Error al guardar preferencias");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await changePasswordAction({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Contraseña actualizada correctamente");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.error("Error al cambiar la contraseña");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra la configuración del sistema"
        icon={Settings}
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="profile" className="gap-2 text-xs">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 text-xs">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Notif.</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 text-xs">
            <Palette className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Apariencia</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Información del Perfil</h3>
              <p className="text-sm text-muted-foreground">Actualiza tu información personal</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                   
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select
                  value={profile.timezone}
                  onValueChange={(value) => setProfile({ ...profile, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona zona horaria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="america-mexico_city">Ciudad de México (GMT-6)</SelectItem>
                    <SelectItem value="america-guadalajara">Guadalajara (GMT-6)</SelectItem>
                    <SelectItem value="america-monterrey">Monterrey (GMT-6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleProfileSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Configuración de Notificaciones</h3>
              <p className="text-sm text-muted-foreground">Administra cómo recibes notificaciones</p>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  key: "emailNotifications",
                  label: "Notificaciones de correo",
                  desc: "Recibe notificaciones por correo electrónico",
                },
                {
                  key: "appointmentReminders",
                  label: "Recordatorios de citas",
                  desc: "Recibe recordatorios antes de las citas",
                },
                {
                  key: "newBookingAlerts",
                  label: "Notificaciones de nuevas reservas",
                  desc: "Recibe alertas cuando hay nuevas reservas online",
                },
                {
                  key: "weeklyReport",
                  label: "Reporte semanal",
                  desc: "Recibe un resumen semanal de actividad",
                },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    aria-label={item.label}
                    checked={profile[item.key as keyof typeof profile] as boolean}
                    onCheckedChange={(checked) =>
                      setProfile({ ...profile, [item.key]: checked })
                    }
                  />
                </div>
              ))}
              <Button onClick={handlePreferencesSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="rounded-xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Apariencia</h3>
              <p className="text-sm text-muted-foreground">Personaliza la apariencia del sistema</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select defaultValue="es-MX">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es-MX">Español (México)</SelectItem>
                    <SelectItem value="es-ES">Español (España)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="rounded-xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Seguridad</h3>
              <p className="text-sm text-muted-foreground">Configura las opciones de seguridad</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4 p-4 bg-muted/30 rounded-xl">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Contraseña actual</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nueva contraseña</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                   
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                   
                  />
                </div>
                <Button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading}
                 
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cambiando...
                    </>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}