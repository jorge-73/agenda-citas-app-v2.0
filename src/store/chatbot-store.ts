import { create } from "zustand";
import { sendChatMessageAction } from "@/features/chatbot/actions";
import type { ChatMessage } from "@/features/chatbot/types";

const MAX_STORED_MESSAGES = 50;
const HISTORY_TO_SEND = 10;

interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  sendMessage: (content: string, pathname: string) => Promise<void>;
  resetConversation: () => void;
}

let messageIdCounter = 0;

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  messageIdCounter += 1;
  return {
    id: `msg-${Date.now()}-${messageIdCounter}`,
    role,
    content,
    createdAt: Date.now(),
  };
}

function buildHistory(messages: ChatMessage[]) {
  return messages
    .slice(-HISTORY_TO_SEND)
    .map((msg) => ({ role: msg.role, content: msg.content }));
}

export const useChatbotStore = create<ChatbotState>()((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  sendMessage: async (content, pathname) => {
    const trimmed = content.trim();
    if (!trimmed || get().isLoading) return;

    const history = buildHistory(get().messages);

    const userMessage = createMessage("user", trimmed);
    set((state) => ({
      messages: [...state.messages, userMessage].slice(-MAX_STORED_MESSAGES),
      isLoading: true,
    }));

    const result = await sendChatMessageAction({
      message: trimmed,
      pathname,
      history,
    });

    const assistantMessage = createMessage(
      "assistant",
      result.error ?? result.reply ?? "No se pudo obtener una respuesta."
    );
    set((state) => ({
      messages: [...state.messages, assistantMessage].slice(-MAX_STORED_MESSAGES),
      isLoading: false,
    }));
  },
  resetConversation: () => set({ messages: [] }),
}));