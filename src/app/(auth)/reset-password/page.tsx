"use client";

import { Suspense, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth-schema";
import { resetPasswordAction } from "@/features/auth/actions";
import { AuthLayout } from "@/components/shared/auth-layout";
import { AuthError } from "@/components/shared/auth-error";
import { PasswordInput } from "@/components/shared/password-input";
import { Button } from "@/components/ui/button";

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || "" },
  });

  const onSubmit = useCallback(async (data: ResetPasswordInput) => {
    if (!token) {
      setError("Token inválido. Solicita un nuevo restablecimiento.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const result = await resetPasswordAction(token, data.password);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  }, [token]);

  if (!token) {
    return (
      <AuthLayout showHeader={false}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"
        >
          <AlertCircle className="h-8 w-8 text-destructive" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Enlace inválido</h2>
        <p className="text-muted-foreground mb-6 text-center">
          El enlace para restablecer la contraseña no es válido o ha expirado.
        </p>
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout showHeader={false}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Contraseña actualizada</h2>
        <p className="text-muted-foreground mb-6 text-center">
          Tu contraseña se ha restablecido exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
        </p>
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-primary hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Ingresa tu nueva contraseña"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <AuthError message={error} />

        <input type="hidden" {...register("token")} value={token} />

        <PasswordInput
          id="password"
          label="Nueva contraseña"
          error={errors.password?.message}
          registration={register("password")}
        />

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
              Restableciendo...
            </span>
          ) : (
            "Restablecer contraseña"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/login" className="text-primary hover:underline">
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </motion.div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
