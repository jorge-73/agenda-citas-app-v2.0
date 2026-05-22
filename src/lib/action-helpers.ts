import { auth } from "@/lib/auth";
import type { z } from "zod";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autorizado");
  }
  return session.user;
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
