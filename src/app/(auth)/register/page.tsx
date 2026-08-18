"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@/schemas/auth-schema";
import { registerAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthError } from "@/components/shared/auth-error";
import { PasswordInput } from "@/components/shared/password-input";

import { useState } from "react";
import { User, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const passwordRequirements = [
  { label: "Mínimo 8 caracteres", test: (p: string) => p.length >= 8 },
  { label: "Una letra mayúscula", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un número", test: (p: string) => /\d/.test(p) },
];

const registerOrbs = [
  { className: "top-1/4 right-1/4 w-[600px] h-[600px] bg-primary/12" },
  { className: "bottom-1/4 left-1/4 w-[500px] h-[500px] bg-accent/8", delay: 3 },
  { className: "top-1/3 left-1/2 w-[400px] h-[400px] bg-primary/6", delay: 6 },
];

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    const result = await registerAction(data);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Ingresa tus datos para registrarte"
      orbs={registerOrbs}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthError message={error} />

        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">Nombre completo</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
            <Input
              id="name"
              placeholder="Juan Pérez"
              className="pl-11 h-12"
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              className="pl-11 h-12"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <PasswordInput
          id="password"
          label="Contraseña"
          error={errors.password?.message}
          registration={register("password")}
        />

        {password && (
          <div className="grid grid-cols-3 gap-2 -mt-2">
            {passwordRequirements.map((req) => (
              <div
                key={req.label}
                className={cn(
                  "flex items-center gap-1 text-xs",
                  req.test(password) ? "text-success" : "text-muted-foreground"
                )}
              >
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                {req.label}
              </div>
            ))}
          </div>
        )}

        <PasswordInput
          id="confirmPassword"
          label="Confirmar contraseña"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
        />

        <Button size="lg" className="w-full text-base" type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando cuenta...
            </span>
          ) : (
            "Crear cuenta"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">¿Ya tienes cuenta? </span>
        <Link href="/login" className="text-primary font-medium hover:underline">
          Iniciar sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
