import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../auth-store";

const mockUser = {
  id: "1",
  name: "Admin User",
  email: "admin@citamed.com",
  image: null,
  role: "ADMIN" as const,
};

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it("starts with no user", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it("sets user and marks as authenticated", () => {
    useAuthStore.getState().setUser(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("clears user and marks as unauthenticated", () => {
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().clearUser();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
