"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, X } from "lucide-react";
import { useChatbotStore } from "@/store/chatbot-store";

export function ChatbotButton() {
  const isOpen = useChatbotStore((s) => s.isOpen);
  const toggle = useChatbotStore((s) => s.toggle);

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
      aria-expanded={isOpen}
      layout
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      className="fixed bottom-4 right-4 z-50 flex h-14 items-center rounded-full bg-gradient-to-b from-chat-accent to-chat-accent/85 pl-4 pr-5 text-chat-accent-foreground shadow-lg shadow-chat-accent/25 ring-1 ring-chat-accent-foreground/20 transition-colors hover:bg-chat-accent/90"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isOpen ? "close" : "open"}
          initial={{ opacity: 0, x: isOpen ? -6 : 6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isOpen ? 6 : -6 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-2.5"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          <span className="whitespace-nowrap text-sm font-semibold">
            {isOpen ? "Cerrar" : "¿Necesitás ayuda?"}
          </span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}