import { auth } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/permissions";
import type { UserRole } from "@/types";
import type { z } from "zod";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }
  return session.user;
}

export async function requirePermission(permission: Permission) {
  const user = await requireAuth();
  const role = user.role as UserRole | undefined;
  if (!hasPermission(role, permission)) {
    throw new Error("No tienes permisos para realizar esta acción");
  }
  return user;
}

export function validateInput<T extends z.ZodType>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message).join(", ");
    throw new Error(messages);
  }
  return result.data;
}
