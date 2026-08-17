"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useChatbotStore } from "@/store/chatbot-store";

const SHOW_DELAY = 1500;
const VISIBLE_DURATION = 8500;

export function ChatbotGreeting() {
  const isOpen = useChatbotStore((s) => s.isOpen);
  const openChat = useChatbotStore((s) => s.open);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isOpen || dismissed) return;
    const showTimer = setTimeout(() => setVisible(true), SHOW_DELAY);
    const hideTimer = setTimeout(
      () => setVisible(false),
      SHOW_DELAY + VISIBLE_DURATION
    );
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isOpen, dismissed]);

  const handleOpen = () => {
    setDismissed(true);
    setVisible(false);
    openChat();
  };

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.97 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-24 right-4 z-40"
        >
          <div className="relative flex items-start gap-2 rounded-2xl rounded-br-md border border-chat-border/70 bg-chat-bubble px-4 py-3 shadow-lg animate-[float_3s_ease-in-out_infinite]">
            <button
              type="button"
              onClick={handleOpen}
              aria-label="Abrir asistente virtual: hola, puedo ayudarte en algo"
              className="min-w-[240px] max-w-[240px] text-left"
            >
              <span className="text-sm leading-snug text-chat-foreground">
                Hola <span aria-hidden>👋</span> ¿Puedo ayudarte en algo?
              </span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Descartar mensaje de saludo"
              className="-m-1 p-1 text-chat-muted-foreground/70 transition-colors hover:text-chat-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <span
              aria-hidden
              className="absolute -bottom-1.5 right-7 h-3 w-3 rotate-45 rounded-[2px] border-b border-r border-chat-border/70 bg-chat-bubble"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}