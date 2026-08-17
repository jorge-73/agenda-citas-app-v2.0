import { describe, it, expect } from "vitest";
import { resolvePageContext, PAGE_CONTEXT } from "../utils/page-context";

describe("resolvePageContext", () => {
  it("returns the exact page context for known routes", () => {
    expect(resolvePageContext("/dashboard/appointments")).toEqual(
      PAGE_CONTEXT["/dashboard/appointments"]
    );
    expect(resolvePageContext("/booking")).toEqual(PAGE_CONTEXT["/booking"]);
    expect(resolvePageContext("/")).toEqual(PAGE_CONTEXT["/"]);
  });

  it("resolves detail routes by prefix", () => {
    expect(resolvePageContext("/dashboard/patients/abc-123").title).toBe(
      "Detalle de paciente"
    );
    expect(resolvePageContext("/dashboard/specialists/xyz-9").title).toBe(
      "Detalle de especialista"
    );
  });

  it("resolves nested paths to the parent section", () => {
    expect(resolvePageContext("/dashboard/appointments/new").title).toBe(
      "Gestión de citas"
    );
  });

  it("returns a generic context for unknown paths", () => {
    const context = resolvePageContext("/ruta/desconocida");
    expect(context.title).toBe("CitasMed");
    expect(context.pathname).toBe("/ruta/desconocida");
  });

  it("keeps the original pathname in the context", () => {
    expect(resolvePageContext("/dashboard/schedules").pathname).toBe(
      "/dashboard/schedules"
    );
  });
});