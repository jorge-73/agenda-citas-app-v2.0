import { describe, it, expect } from "vitest";
import { escapeHtml } from "../email";

describe("escapeHtml", () => {
  it("escapes HTML metacharacters", () => {
    expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
      "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands first to avoid double-escaping", () => {
    expect(escapeHtml("a&b")).toBe("a&amp;b");
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("escapes single quotes", () => {
    expect(escapeHtml("it's")).toBe("it&#39;s");
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("Hola Juan, tu cita es el 15/01 a las 10:00")).toBe(
      "Hola Juan, tu cita es el 15/01 a las 10:00"
    );
  });

  it("sanitizes user-controlled reset links", () => {
    const link = "https://app.example.com/reset?token=abc&user=<b>x</b>";
    expect(escapeHtml(link)).toBe(
      "https://app.example.com/reset?token=abc&amp;user=&lt;b&gt;x&lt;/b&gt;"
    );
  });
});