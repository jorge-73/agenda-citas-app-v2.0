"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/schemas/auth-schema";
import { loginAction } from "@/features/auth/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthError } from "@/components/shared/auth-error";
import { PasswordInput } from "@/components/shared/password-input";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    const result = await loginAction(data);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Ingresa tus credenciales para continuar"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthError message={error} />

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 z-10" />
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              className="pl-11 h-12 rounded-xl"
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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox id="remember" />
            <Label htmlFor="remember" className="text-muted-foreground cursor-pointer">Recordarme</Label>
          </label>
          <Link href="/forgot-password" className="text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full h-12 text-base font-medium rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Iniciando sesión...
            </span>
          ) : (
            "Iniciar sesión"
          )}
        </motion.button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">¿No tienes cuenta? </span>
        <Link href="/register" className="text-primary font-medium hover:underline">
          Regístrate
        </Link>
      </div>
    </AuthLayout>
  );
}
