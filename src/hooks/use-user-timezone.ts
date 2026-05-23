"use client";

import { useSession } from "next-auth/react";
import { AR_TZ } from "@/lib/date-utils";

export function useUserTimezone(): string {
  const { data: session } = useSession();
  const preferences = (session?.user as { preferences?: { timezone?: string } } | undefined)?.preferences;
  return preferences?.timezone || AR_TZ;
}
