import type { UserRole } from "@/types";

export type ChatMessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: number;
}

export interface ChatHistoryMessage {
  role: ChatMessageRole;
  content: string;
}

export interface ChatPageContext {
  pathname: string;
  title: string;
  description: string;
}

export interface ChatUserContext {
  name: string | null;
  role: UserRole | null;
  permissions: string[];
}

export interface ChatContext {
  user: ChatUserContext;
  page: ChatPageContext;
}

export interface ChatServiceResult {
  reply?: string;
  error?: string;
}