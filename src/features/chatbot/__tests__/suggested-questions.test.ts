import { describe, it, expect } from "vitest";
import { getSuggestedQuestions } from "../constants/suggested-questions";

describe("getSuggestedQuestions", () => {
  it("prioritizes page-specific questions", () => {
    const questions = getSuggestedQuestions("ADMIN", "/dashboard/appointments");
    expect(questions[0]).toBe("¿Cómo creo una cita?");
    expect(questions[1]).toBe("¿Cómo cambio el estado de una cita?");
  });

  it("combines page and role questions without duplicates", () => {
    const questions = getSuggestedQuestions("PATIENT", "/booking");
    const unique = new Set(questions);
    expect(unique.size).toBe(questions.length);
  });

  it("limits to 4 questions", () => {
    const questions = getSuggestedQuestions("ADMIN", "/dashboard");
    expect(questions.length).toBeLessThanOrEqual(4);
  });

  it("uses anonymous questions when there is no role", () => {
    const questions = getSuggestedQuestions(null, "/");
    expect(questions).toContain("¿Qué es CitasMed?");
    expect(questions).toContain("¿Cómo me registro?");
  });

  it("uses role questions on pages without specific questions", () => {
    const questions = getSuggestedQuestions("SPECIALIST", "/ruta/desconocida");
    expect(questions).toContain("¿Dónde veo mis citas?");
  });

  it("returns role questions for each known role", () => {
    for (const role of ["ADMIN", "SPECIALIST", "RECEPTIONIST", "PATIENT"] as const) {
      expect(getSuggestedQuestions(role, "/ruta").length).toBeGreaterThan(0);
    }
  });
});