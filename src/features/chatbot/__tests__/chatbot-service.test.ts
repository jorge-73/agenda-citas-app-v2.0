import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { sendChatMessage } from "../services/chatbot.service";
import { AiProviderError } from "../services/ai-provider";
import { clearRateLimitStore } from "@/lib/rate-limit";

const authMock = vi.fn();
const headersMock = vi.fn();
const chatCompletionMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("next/headers", () => ({
  headers: () => headersMock(),
}));

vi.mock("../services/ai-provider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/ai-provider")>();
  return {
    ...actual,
    chatCompletion: (...args: Parameters<typeof actual.chatCompletion>) =>
      chatCompletionMock(...args),
  };
});

const ADMIN_SESSION = {
  user: { id: "1", name: "Ana Admin", email: "admin@citamed.com", role: "ADMIN" },
};

function validInput(overrides: Record<string, unknown> = {}) {
  return {
    message: "¿Cómo creo una cita?",
    pathname: "/dashboard/appointments",
    history: [],
    ...overrides,
  };
}

describe("sendChatMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));
    clearRateLimitStore();
    authMock.mockReset();
    headersMock.mockReset();
    chatCompletionMock.mockReset();
    authMock.mockResolvedValue(null);
    headersMock.mockResolvedValue(new Headers());
    chatCompletionMock.mockResolvedValue("Respuesta útil");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a validation error for invalid input", async () => {
    const result = await sendChatMessage({ message: "   ", pathname: "/" });
    expect(result.reply).toBeUndefined();
    expect(result.error).toContain("no puede estar vacío");
  });

  it("returns the assistant reply on success", async () => {
    const result = await sendChatMessage(validInput());
    expect(result.reply).toBe("Respuesta útil");
    expect(result.error).toBeUndefined();
  });

  it("builds the system prompt from the authenticated user context", async () => {
    authMock.mockResolvedValue(ADMIN_SESSION);
    await sendChatMessage(validInput());

    const messages = chatCompletionMock.mock.calls[0][0];
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("Ana Admin");
    expect(messages[0].content).toContain("Administrador (ADMIN)");
    expect(messages[0].content).toContain("Gestión de citas");
    expect(messages[1]).toEqual({ role: "user", content: "¿Cómo creo una cita?" });
  });

  it("passes the conversation history to the provider", async () => {
    await sendChatMessage(
      validInput({
        history: [
          { role: "user", content: "Hola" },
          { role: "assistant", content: "Hola, ¿en qué te ayudo?" },
        ],
      })
    );

    const messages = chatCompletionMock.mock.calls[0][0];
    expect(messages).toHaveLength(4);
    expect(messages[1].content).toBe("Hola");
    expect(messages[2].role).toBe("assistant");
    expect(messages[3]).toEqual({ role: "user", content: "¿Cómo creo una cita?" });
  });

  it("limits anonymous users by IP address", async () => {
    headersMock.mockResolvedValue(new Headers({ "x-forwarded-for": "203.0.113.9" }));

    for (let i = 0; i < 10; i++) {
      const result = await sendChatMessage(validInput());
      expect(result.reply).toBeDefined();
    }

    const blocked = await sendChatMessage(validInput());
    expect(blocked.reply).toBeUndefined();
    expect(blocked.error).toContain("demasiados mensajes");
  });

  it("limits authenticated users by account", async () => {
    authMock.mockResolvedValue(ADMIN_SESSION);

    for (let i = 0; i < 10; i++) {
      const result = await sendChatMessage(validInput());
      expect(result.reply).toBeDefined();
    }

    const blocked = await sendChatMessage(validInput());
    expect(blocked.error).toContain("demasiados mensajes");
  });

  it("allows requests again after the rate limit window", async () => {
    authMock.mockResolvedValue(ADMIN_SESSION);

    for (let i = 0; i < 10; i++) {
      await sendChatMessage(validInput());
    }
    expect((await sendChatMessage(validInput())).error).toContain("demasiados mensajes");

    vi.advanceTimersByTime(60_001);
    const result = await sendChatMessage(validInput());
    expect(result.reply).toBe("Respuesta útil");
  });

  it("returns a friendly message when the provider is rate limited", async () => {
    chatCompletionMock.mockRejectedValue(new AiProviderError("rate limit", 429));
    const result = await sendChatMessage(validInput());
    expect(result.error).toContain("temporalmente saturado");
  });

  it("returns a fallback message on provider failures", async () => {
    chatCompletionMock.mockRejectedValue(new Error("boom"));
    const result = await sendChatMessage(validInput());
    expect(result.error).toContain("no pude procesar tu consulta");
  });
});