import { describe, it, expect } from "vitest";
import { hasPermission, hasAnyPermission, ROLE_PERMISSIONS } from "../permissions";
import type { Permission } from "../permissions";

const ALL_PERMISSIONS: Permission[] = [
  "view:dashboard",
  "view:appointments",
  "view:patients",
  "view:specialists",
  "view:schedules",
  "view:blocked-dates",
  "view:bookings",
  "view:settings",
  "view:users",
  "manage:appointments",
  "manage:patients",
  "manage:specialists",
  "manage:schedules",
  "manage:blocked-dates",
  "manage:bookings",
  "manage:settings",
  "manage:users",
];

describe("hasPermission", () => {
  it("returns false for undefined role", () => {
    expect(hasPermission(undefined, "view:dashboard")).toBe(false);
  });

  describe("ADMIN", () => {
    it("has all permissions", () => {
      for (const permission of ALL_PERMISSIONS) {
        expect(hasPermission("ADMIN", permission)).toBe(true);
      }
    });
  });

  describe("SPECIALIST", () => {
    it("has dashboard, appointments, patients, schedules, settings, bookings", () => {
      expect(hasPermission("SPECIALIST", "view:dashboard")).toBe(true);
      expect(hasPermission("SPECIALIST", "view:appointments")).toBe(true);
      expect(hasPermission("SPECIALIST", "view:patients")).toBe(true);
      expect(hasPermission("SPECIALIST", "view:schedules")).toBe(true);
      expect(hasPermission("SPECIALIST", "view:bookings")).toBe(true);
      expect(hasPermission("SPECIALIST", "view:settings")).toBe(true);
      expect(hasPermission("SPECIALIST", "manage:appointments")).toBe(true);
      expect(hasPermission("SPECIALIST", "manage:schedules")).toBe(true);
    });

    it("does NOT have users, blocked-dates, bookings management, specialists management", () => {
      expect(hasPermission("SPECIALIST", "view:users")).toBe(false);
      expect(hasPermission("SPECIALIST", "view:blocked-dates")).toBe(false);
      expect(hasPermission("SPECIALIST", "manage:bookings")).toBe(false);
      expect(hasPermission("SPECIALIST", "manage:users")).toBe(false);
    });
  });

  describe("RECEPTIONIST", () => {
    it("has operational permissions including bookings", () => {
      expect(hasPermission("RECEPTIONIST", "view:appointments")).toBe(true);
      expect(hasPermission("RECEPTIONIST", "view:patients")).toBe(true);
      expect(hasPermission("RECEPTIONIST", "view:specialists")).toBe(true);
      expect(hasPermission("RECEPTIONIST", "view:bookings")).toBe(true);
      expect(hasPermission("RECEPTIONIST", "manage:bookings")).toBe(true);
      expect(hasPermission("RECEPTIONIST", "manage:appointments")).toBe(true);
      expect(hasPermission("RECEPTIONIST", "manage:patients")).toBe(true);
    });

    it("does NOT have users or settings management", () => {
      expect(hasPermission("RECEPTIONIST", "view:users")).toBe(false);
      expect(hasPermission("RECEPTIONIST", "manage:users")).toBe(false);
      expect(hasPermission("RECEPTIONIST", "manage:settings")).toBe(false);
    });
  });

  describe("PATIENT", () => {
    it("has basic view permissions", () => {
      expect(hasPermission("PATIENT", "view:dashboard")).toBe(true);
      expect(hasPermission("PATIENT", "view:appointments")).toBe(true);
      expect(hasPermission("PATIENT", "view:settings")).toBe(true);
    });

    it("does NOT have management or sensitive permissions", () => {
      expect(hasPermission("PATIENT", "view:users")).toBe(false);
      expect(hasPermission("PATIENT", "view:patients")).toBe(false);
      expect(hasPermission("PATIENT", "manage:appointments")).toBe(false);
      expect(hasPermission("PATIENT", "manage:users")).toBe(false);
    });
  });
});

describe("hasAnyPermission", () => {
  it("returns true if role has at least one permission", () => {
    expect(hasAnyPermission("ADMIN", ["view:dashboard", "nonexistent" as Permission])).toBe(true);
  });

  it("returns false if role has none of the permissions", () => {
    expect(hasAnyPermission("PATIENT", ["view:users", "manage:users"])).toBe(false);
  });

  it("returns false for undefined role", () => {
    expect(hasAnyPermission(undefined, ["view:dashboard"])).toBe(false);
  });
});

describe("ROLE_PERMISSIONS integrity", () => {
  it("all roles have unique permission sets", () => {
    const roles = ["ADMIN", "SPECIALIST", "RECEPTIONIST", "PATIENT"] as const;
    const sets = roles.map((r) => ROLE_PERMISSIONS[r].sort().join(","));
    const unique = new Set(sets);
    expect(unique.size).toBe(roles.length);
  });

  it("no role has duplicate permissions", () => {
    for (const role of ["ADMIN", "SPECIALIST", "RECEPTIONIST", "PATIENT"] as const) {
      const perms = ROLE_PERMISSIONS[role];
      expect(new Set(perms).size).toBe(perms.length);
    }
  });
});
