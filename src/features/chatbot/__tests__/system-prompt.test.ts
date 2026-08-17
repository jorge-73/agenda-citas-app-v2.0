import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "../prompts/system-prompt";
import type { ChatContext } from "../types";

const ADMIN_CONTEXT: ChatContext = {
  user: {
    name: "Ana Admin",
    role: "ADMIN",
    permissions: ["view:dashboard", "manage:appointments"],
  },
  page: {
    pathname: "/dashboard/appointments",
    title: "Gestión de citas",
    description: "Sección de gestión de citas con calendario.",
  },
};

const ANONYMOUS_CONTEXT: ChatContext = {
  user: { name: null, role: null, permissions: [] },
  page: {
    pathname: "/booking",
    title: "Reserva online",
    description: "Asistente de reserva pública.",
  },
};

describe("buildSystemPrompt", () => {
  it("includes the assistant identity", () => {
    const prompt = buildSystemPrompt(ANONYMOUS_CONTEXT);
    expect(prompt).toContain("asistente virtual oficial de CitasMed");
  });

  it("includes the user context for authenticated users", () => {
    const prompt = buildSystemPrompt(ADMIN_CONTEXT);
    expect(prompt).toContain("Ana Admin");
    expect(prompt).toContain("Administrador (ADMIN)");
    expect(prompt).toContain("manage:appointments");
  });

  it("includes the current section information", () => {
    const prompt = buildSystemPrompt(ADMIN_CONTEXT);
    expect(prompt).toContain("/dashboard/appointments");
    expect(prompt).toContain("Gestión de citas");
  });

  it("includes role-specific knowledge", () => {
    const prompt = buildSystemPrompt(ADMIN_CONTEXT);
    expect(prompt).toContain("administrar usuarios");
  });

  it("includes page-specific knowledge", () => {
    const prompt = buildSystemPrompt(ADMIN_CONTEXT);
    expect(prompt).toContain("Estados reales de las citas");
  });

  it("does not leak role knowledge for anonymous users", () => {
    const prompt = buildSystemPrompt(ANONYMOUS_CONTEXT);
    expect(prompt).toContain("no tiene sesión iniciada");
    expect(prompt).toContain("visitante del sitio público");
  });

  it("includes general knowledge for public pages", () => {
    const prompt = buildSystemPrompt(ANONYMOUS_CONTEXT);
    expect(prompt).toContain("Flujo de 6 pasos en /booking");
  });

  it("includes the medical disclaimers", () => {
    const prompt = buildSystemPrompt(ANONYMOUS_CONTEXT);
    expect(prompt).toContain("No diagnosticar enfermedades");
    expect(prompt).toContain("Nunca inventes una respuesta");
  });
});