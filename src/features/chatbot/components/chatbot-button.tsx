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
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/20 transition-colors hover:bg-primary/90 dark:ring-primary-foreground/10"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isOpen ? "close" : "open"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}