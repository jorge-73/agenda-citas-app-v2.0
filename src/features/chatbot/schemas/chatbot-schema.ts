import { z } from "zod";

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_HISTORY_MESSAGES = 10;
export const MAX_HISTORY_CONTENT_LENGTH = 1000;
export const MAX_PATHNAME_LENGTH = 200;

export const chatbotMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "El mensaje no puede estar vacío")
    .max(
      MAX_MESSAGE_LENGTH,
      `El mensaje no puede superar los ${MAX_MESSAGE_LENGTH} caracteres`
    ),
  pathname: z
    .string()
    .trim()
    .min(1, "Ruta inválida")
    .max(MAX_PATHNAME_LENGTH, "Ruta inválida")
    .regex(/^\//, "Ruta inválida"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"], "Rol de mensaje inválido"),
        content: z
          .string()
          .trim()
          .min(1, "Mensaje de historial vacío")
          .max(
            MAX_HISTORY_CONTENT_LENGTH,
            "Mensaje de historial demasiado largo"
          ),
      })
    )
    .max(MAX_HISTORY_MESSAGES, "Historial demasiado largo"),
});

export type ChatbotInput = z.infer<typeof chatbotMessageSchema>;