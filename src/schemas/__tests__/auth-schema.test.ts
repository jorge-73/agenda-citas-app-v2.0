import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../auth-schema";

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "123456" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "invalid", password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = loginSchema.safeParse({ email: "test@example.com", password: "12345" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid input with matching passwords", () => {
    const result = registerSchema.safeParse({
      name: "Juan Pérez",
      email: "juan@example.com",
      password: "123456",
      confirmPassword: "123456",
      role: "PATIENT",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Juan",
      email: "juan@example.com",
      password: "123456",
      confirmPassword: "654321",
      role: "PATIENT",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("confirmPassword");
    }
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "juan@example.com",
      password: "123456",
      confirmPassword: "123456",
      role: "PATIENT",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid roles", () => {
    for (const role of ["PATIENT", "SPECIALIST", "RECEPTIONIST"] as const) {
      const result = registerSchema.safeParse({
        name: "Test",
        email: "test@example.com",
        password: "123456",
        confirmPassword: "123456",
        role,
      });
      expect(result.success).toBe(true);
    }
  });
});

describe("forgotPasswordSchema", () => {
  it("accepts valid email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts valid input", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "newpass123",
      confirmPassword: "newpass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "newpass123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty token", () => {
    const result = resetPasswordSchema.safeParse({
      token: "",
      password: "newpass123",
      confirmPassword: "newpass123",
    });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  it("accepts valid input", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched new passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpass",
      newPassword: "newpass123",
      confirmPassword: "different",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });
    expect(result.success).toBe(false);
  });
});
