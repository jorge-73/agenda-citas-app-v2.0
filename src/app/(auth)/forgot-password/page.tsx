"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth-schema";
import { requestPasswordResetAction } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthError } from "@/components/shared/auth-error";

import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);

    const result = await requestPasswordResetAction(data.email);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setIsSent(true);
    setIsLoading(false);
  };

  if (isSent) {
    return (
      <AuthLayout showHeader={false}>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Revisá tu correo</h2>
          <p className="text-muted-foreground mb-6">
            Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresa tu email y te enviaremos un enlace para restablecerla"
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
              className="pl-11 h-12"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button size="lg" className="w-full text-base" type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando...
            </span>
          ) : (
            "Enviar enlace"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
