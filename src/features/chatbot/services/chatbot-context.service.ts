import type { ChatContext, ChatUserContext } from "../types";
import { resolvePageContext } from "../utils/page-context";

export function buildUserContext(
  sessionUser: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null,
  permissions: string[]
): ChatUserContext {
  if (!sessionUser?.role) {
    return { name: null, role: null, permissions: [] };
  }

  const role = sessionUser.role as ChatUserContext["role"];
  return {
    name: sessionUser.name ?? null,
    role,
    permissions,
  };
}

export function buildChatContext(
  sessionUser: {
    name?: string | null;
    email?: string | null;
    role?: string | null;
  } | null,
  permissions: string[],
  pathname: string
): ChatContext {
  return {
    user: buildUserContext(sessionUser, permissions),
    page: resolvePageContext(pathname),
  };
}