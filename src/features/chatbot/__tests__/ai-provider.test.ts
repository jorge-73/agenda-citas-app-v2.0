import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  chatCompletion,
  AiProviderError,
  getAiConfig,
} from "../services/ai-provider";

describe("getAiConfig", () => {
  beforeEach(() => {
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODEL;
    delete process.env.AI_BASE_URL;
  });

  it("uses defaults when no env vars are set", () => {
    const config = getAiConfig();
    expect(config.model).toBe("gemini-3.1-flash-lite");
    expect(config.baseUrl).toBe(
      "https://generativelanguage.googleapis.com/v1beta/openai/"
    );
    expect(config.apiKey).toBeUndefined();
  });

  it("reads env vars when set", () => {
    process.env.AI_MODEL = "gemini-2.5-flash-lite";
    process.env.AI_BASE_URL = "https://custom.example.com/";
    const config = getAiConfig();
    expect(config.model).toBe("gemini-2.5-flash-lite");
    expect(config.baseUrl).toBe("https://custom.example.com/");
  });
});

describe("chatCompletion", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    process.env.AI_API_KEY = "test-key";
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    delete process.env.AI_API_KEY;
    delete process.env.AI_MODEL;
    delete process.env.AI_BASE_URL;
    vi.unstubAllGlobals();
  });

  it("throws when no API key is configured", async () => {
    delete process.env.AI_API_KEY;
    await expect(
      chatCompletion([{ role: "user", content: "hola" }])
    ).rejects.toThrow("AI_API_KEY no configurada");
  });

  it("returns the assistant content on success", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "  Respuesta del asistente  " } }],
      }),
    });

    const reply = await chatCompletion([
      { role: "system", content: "sys" },
      { role: "user", content: "hola" },
    ]);
    expect(reply).toBe("Respuesta del asistente");
  });

  it("posts to the chat completions endpoint with bearer auth", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "ok" } }] }),
    });

    await chatCompletion([{ role: "user", content: "hola" }]);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    );
    expect(init.headers.Authorization).toBe("Bearer test-key");
    expect(init.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("gemini-3.1-flash-lite");
    expect(body.messages).toEqual([{ role: "user", content: "hola" }]);
  });

  it("throws with the provider status on non-ok responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: { message: "Rate limit" } }),
    });

    try {
      await chatCompletion([{ role: "user", content: "hola" }]);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(AiProviderError);
      expect((error as AiProviderError).status).toBe(429);
      expect((error as AiProviderError).message).toContain("Rate limit");
    }
  });

  it("throws when the provider returns no content", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    });

    await expect(
      chatCompletion([{ role: "user", content: "hola" }])
    ).rejects.toThrow("respuesta vacía");
  });

  it("throws a friendly error on network failure", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));

    await expect(
      chatCompletion([{ role: "user", content: "hola" }])
    ).rejects.toThrow("No se pudo conectar con el proveedor de IA");
  });
});