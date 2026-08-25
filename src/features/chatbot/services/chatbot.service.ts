import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ROLE_PERMISSIONS } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/rate-limit";
import type { UserRole } from "@/types";
import { chatbotMessageSchema } from "../schemas/chatbot-schema";
import { buildChatContext } from "./chatbot-context.service";
import { buildSystemPrompt } from "../prompts/system-prompt";
import { chatCompletion, AiProviderError, type AiProviderMessage } from "./ai-provider";
import type { ChatbotInput } from "../schemas/chatbot-schema";
import type { ChatHistoryMessage, ChatServiceResult } from "../types";

export const CHATBOT_RATE_LIMIT = {
  max: 10,
  windowMs: 60_000,
};

const FALLBACK_RESPONSE =
  "Lo siento, no pude procesar tu consulta en este momento. Intentá nuevamente en unos segundos.";

const RATE_LIMITED_RESPONSE =
  "Estás enviando demasiados mensajes. Esperá un momento e intentá nuevamente.";

function formatValidationError(error: unknown): string {
  if (typeof error === "object" && error !== null && "issues" in error) {
    const issues = (error as { issues?: { message?: string }[] }).issues;
    const message = issues?.find((issue) => issue.message)?.message;
    if (message) return message;
  }
  return "La consulta no es válida. Revisá el mensaje e intentá nuevamente.";
}

function mapProviderError(error: unknown): string {
  if (error instanceof AiProviderError) {
    if (error.status === 429) {
      return "El asistente está temporalmente saturado. Intentá en unos segundos.";
    }
    if (error.status && error.status >= 500) {
      return FALLBACK_RESPONSE;
    }
  }
  return FALLBACK_RESPONSE;
}

async function getRateLimitKey(): Promise<string> {
  const session = await auth();
  if (session?.user?.email) {
    return `chatbot:${session.user.email.toLowerCase().trim()}`;
  }
  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "anon";
  return `chatbot:ip:${ip}`;
}

function toProviderMessages(
  systemPrompt: string,
  history: ChatHistoryMessage[],
  currentMessage: string
): AiProviderMessage[] {
  return [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role as AiProviderMessage["role"],
      content: msg.content,
    })),
    { role: "user", content: currentMessage },
  ];
}

export async function sendChatMessage(input: unknown): Promise<ChatServiceResult> {
  let parsed: ChatbotInput;
  try {
    parsed = chatbotMessageSchema.parse(input);
  } catch (error) {
    return { error: formatValidationError(error) };
  }

  const session = await auth();
  const role = (session?.user?.role as UserRole | undefined) ?? null;
  const permissions = role ? ROLE_PERMISSIONS[role] ?? [] : [];

  const rateLimitKey = await getRateLimitKey();
  const rateLimit = await checkRateLimit(
    rateLimitKey,
    CHATBOT_RATE_LIMIT.max,
    CHATBOT_RATE_LIMIT.windowMs
  );
  if (!rateLimit.allowed) {
    return { error: RATE_LIMITED_RESPONSE };
  }

  const context = buildChatContext(
    session?.user
      ? { name: session.user.name, email: session.user.email, role: session.user.role }
      : null,
    permissions,
    parsed.pathname
  );

  const systemPrompt = buildSystemPrompt(context);
  const messages = toProviderMessages(systemPrompt, parsed.history, parsed.message);

  try {
    const reply = await chatCompletion(messages);
    return { reply };
  } catch (error) {
    console.error("[chatbot] Error al procesar mensaje:", error);
    return { error: mapProviderError(error) };
  }
}
