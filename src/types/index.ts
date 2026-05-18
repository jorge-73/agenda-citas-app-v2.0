export type UserRole = "ADMIN" | "SPECIALIST" | "RECEPTIONIST" | "PATIENT";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Specialist {
  id: string;
  userId: string;
  specialty: string;
  license: string | null;
  phone: string | null;
  bio: string | null;
  user: User;
}

export interface Patient {
  id: string;
  userId: string;
  phone: string | null;
  document: string | null;
  birthDate: Date | null;
  address: string | null;
  emergencyContact: string | null;
  user: User;
}

export interface Session {
  user: User;
  expires: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  items?: NavItem[];
}