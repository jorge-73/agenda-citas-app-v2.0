"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, User, Bell, Palette, Shield, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Configuración guardada correctamente");
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración"
        description="Administra la configuración del sistema"
        icon={Settings}
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Apariencia
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Información del Perfil</h3>
              <p className="text-sm text-muted-foreground">Actualiza tu información personal</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre" defaultValue="Admin User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" defaultValue="admin@citamed.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" placeholder="+1234567890" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Horaria</Label>
                <Select defaultValue="america-mexico_city">
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
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Configuración de Notificaciones</h3>
              <p className="text-sm text-muted-foreground">Administra cómo recibes notificaciones</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de correo</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe notificaciones por correo electrónico
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios de citas</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe recordatorios antes de las citas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificaciones de nuevas reservas</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe alertas cuando hay nuevas reservas online
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reporte semanal</Label>
                  <p className="text-sm text-muted-foreground">
                    Recibe un resumen semanal de actividad
                  </p>
                </div>
                <Switch />
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Apariencia</h3>
              <p className="text-sm text-muted-foreground">Personaliza la apariencia del sistema</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>Tema</Label>
                <Select defaultValue="system">
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
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="rounded-2xl border border-border/50 bg-card">
            <div className="p-6 pb-2">
              <h3 className="text-lg font-semibold">Seguridad</h3>
              <p className="text-sm text-muted-foreground">Configura las opciones de seguridad</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Contraseña actual</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Nueva contraseña</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar contraseña</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button>Cambiar contraseña</Button>
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">
                      Añade una capa extra de seguridad
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Sesiones activas</Label>
                    <p className="text-sm text-muted-foreground">
                      Gestiona tus sesiones activas
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Ver sesiones</Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}