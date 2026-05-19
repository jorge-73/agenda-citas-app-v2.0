"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@/schemas/auth-schema";
import { loginAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { HeartPulse, Mail, Lock, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
              <HeartPulse className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-xl shadow-primary/5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 text-sm text-rose-600 bg-rose-50 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20"
                >
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="pl-11 h-12"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-rose-500">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-rose-500">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base shadow-lg shadow-primary/20" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">¿No tienes cuenta? </span>
              <Link href="/register" className="text-primary font-medium hover:underline">
                Regístrate
              </Link>
            </div>
          </div>
      </motion.div>
    </div>
  );
}