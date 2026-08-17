const DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";
const DEFAULT_MODEL = "gemini-3.1-flash-lite";
const DEFAULT_MAX_TOKENS = 600;
const DEFAULT_TEMPERATURE = 0.4;

export interface AiProviderMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

export function getAiConfig() {
  return {
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
    baseUrl: process.env.AI_BASE_URL?.trim() || DEFAULT_BASE_URL,
  };
}

export async function chatCompletion(
  messages: AiProviderMessage[]
): Promise<string> {
  const { apiKey, model, baseUrl } = getAiConfig();

  if (!apiKey) {
    throw new AiProviderError("AI_API_KEY no configurada");
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/chat/completions`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: DEFAULT_MAX_TOKENS,
        temperature: DEFAULT_TEMPERATURE,
      }),
    });
  } catch {
    throw new AiProviderError("No se pudo conectar con el proveedor de IA");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      detail = body.error?.message ?? "";
    } catch {
      // respuesta no JSON
    }
    throw new AiProviderError(
      detail || `El proveedor de IA respondió con estado ${response.status}`,
      response.status
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content?.trim()) {
    throw new AiProviderError("El proveedor de IA devolvió una respuesta vacía");
  }

  return content.trim();
}