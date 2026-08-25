import type { Prisma } from "@prisma/client";

export const publicUserSelect = {
  id: true,
  name: true,
  image: true,
} satisfies Prisma.UserSelect;

export const contactUserSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
} satisfies Prisma.UserSelect;
