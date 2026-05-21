import { UserRole } from "@/types";

export type Permission = 
  | "view:dashboard"
  | "view:appointments"
  | "view:patients"
  | "view:specialists"
  | "view:schedules"
  | "view:blocked-dates"
  | "view:settings"
  | "view:users"
  | "manage:appointments"
  | "manage:patients"
  | "manage:specialists"
  | "manage:schedules"
  | "manage:blocked-dates"
  | "manage:settings"
  | "manage:users";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "view:dashboard",
    "view:appointments",
    "view:patients",
    "view:specialists",
    "view:schedules",
    "view:blocked-dates",
    "view:settings",
    "view:users",
    "manage:appointments",
    "manage:patients",
    "manage:specialists",
    "manage:schedules",
    "manage:blocked-dates",
    "manage:settings",
    "manage:users",
  ],
  SPECIALIST: [
    "view:dashboard",
    "view:appointments",
    "view:patients",
    "view:schedules",
    "view:settings",
    "manage:appointments",
    "manage:schedules",
  ],
  RECEPTIONIST: [
    "view:dashboard",
    "view:appointments",
    "view:patients",
    "view:specialists",
    "view:schedules",
    "view:blocked-dates",
    "view:settings",
    "manage:appointments",
    "manage:patients",
    "manage:specialists",
    "manage:schedules",
    "manage:blocked-dates",
  ],
  PATIENT: [
    "view:dashboard",
    "view:appointments",
    "view:settings",
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}