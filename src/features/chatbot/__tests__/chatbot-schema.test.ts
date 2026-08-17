import { describe, it, expect } from "vitest";
import {
  chatbotMessageSchema,
  MAX_MESSAGE_LENGTH,
  MAX_HISTORY_MESSAGES,
} from "../schemas/chatbot-schema";

describe("chatbotMessageSchema", () => {
  it("accepts a valid message", () => {
    const result = chatbotMessageSchema.parse({
      message: "¿Cómo saco una cita?",
      pathname: "/booking",
      history: [],
    });
    expect(result.message).toBe("¿Cómo saco una cita?");
    expect(result.pathname).toBe("/booking");
  });

  it("rejects an empty message", () => {
    const result = chatbotMessageSchema.safeParse({
      message: "   ",
      pathname: "/booking",
      history: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a message longer than the limit", () => {
    const result = chatbotMessageSchema.safeParse({
      message: "a".repeat(MAX_MESSAGE_LENGTH + 1),
      pathname: "/booking",
      history: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid pathname", () => {
    expect(
      chatbotMessageSchema.safeParse({ message: "hola", pathname: "dashboard" }).success
    ).toBe(false);
    expect(
      chatbotMessageSchema.safeParse({ message: "hola", pathname: "" }).success
    ).toBe(false);
  });

  it("rejects more than 10 history messages", () => {
    const history = Array.from({ length: MAX_HISTORY_MESSAGES + 1 }, () => ({
      role: "user",
      content: "mensaje",
    }));
    const result = chatbotMessageSchema.safeParse({
      message: "hola",
      pathname: "/dashboard",
      history,
    });
    expect(result.success).toBe(false);
  });

  it("rejects history messages with invalid role", () => {
    const result = chatbotMessageSchema.safeParse({
      message: "hola",
      pathname: "/dashboard",
      history: [{ role: "system", content: "mensaje" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects history messages that are too long", () => {
    const result = chatbotMessageSchema.safeParse({
      message: "hola",
      pathname: "/dashboard",
      history: [{ role: "assistant", content: "x".repeat(1001) }],
    });
    expect(result.success).toBe(false);
  });

  it("trims the message", () => {
    const result = chatbotMessageSchema.parse({
      message: "  hola  ",
      pathname: "/dashboard",
      history: [],
    });
    expect(result.message).toBe("hola");
  });
});