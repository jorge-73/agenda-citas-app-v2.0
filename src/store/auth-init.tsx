"use client";

import { useEffect } from "react";
import { useAuthStore, type AuthUser } from "./auth-store";

export function AuthInit({ user }: { user: AuthUser | null }) {
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return null;
}
