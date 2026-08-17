"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, RotateCcw, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useChatbotStore } from "@/store/chatbot-store";
import { useAuthStore } from "@/store/auth-store";
import { getSuggestedQuestions } from "../constants/suggested-questions";
import { ChatbotMessage } from "./chatbot-message";
import { SuggestedQuestions } from "./suggested-questions";

const MAX_MESSAGE_LENGTH = 500;

export function ChatbotWindow() {
  const isOpen = useChatbotStore((s) => s.isOpen);
  const messages = useChatbotStore((s) => s.messages);
  const isLoading = useChatbotStore((s) => s.isLoading);
  const close = useChatbotStore((s) => s.close);
  const resetConversation = useChatbotStore((s) => s.resetConversation);
  const sendMessage = useChatbotStore((s) => s.sendMessage);
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = getSuggestedQuestions(user?.role, pathname);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [draft]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text || isLoading) return;
    setDraft("");
    void sendMessage(text, pathname);
  };

  const canSend = draft.trim().length > 0 && !isLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="dialog"
          aria-label="Asistente virtual CitasMed"
          className="fixed z-50 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl max-sm:inset-x-3 max-sm:top-20 max-sm:bottom-24 max-sm:h-auto sm:bottom-24 sm:right-4 sm:h-[560px] sm:w-[380px]"
        >
          <div className="flex items-center gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight">Asistente CitasMed</p>
              <p className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
                En línea
              </p>
            </div>
            <button
              type="button"
              onClick={resetConversation}
              aria-label="Nueva conversación"
              className="rounded-lg p-2 transition-colors hover:bg-primary-foreground/10"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar asistente"
              className="rounded-lg p-2 transition-colors hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={scrollRef}
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4 max-sm:min-h-0"
          >
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Hola, soy el Asistente CitasMed</p>
                  <p className="mx-auto mt-1 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                    Puedo ayudarte a usar la plataforma: cómo sacar una cita, gestionar
                    horarios, reservas online y más.
                  </p>
                </div>
                <SuggestedQuestions
                  questions={suggestedQuestions}
                  onSelect={(question) => void sendMessage(question, pathname)}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatbotMessage key={msg.id} role={msg.role} content={msg.content} />
                ))}
                {isLoading && <ChatbotMessage role="assistant" content="" isTyping />}
              </>
            )}
          </div>

          <div className="border-t p-3">
            <div className="flex items-end gap-2 rounded-xl border bg-background px-3 py-2 focus-within:ring-1 focus-within:ring-primary">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(event) =>
                  setDraft(event.target.value.slice(0, MAX_MESSAGE_LENGTH))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Escribí tu consulta…"
                aria-label="Mensaje para el asistente"
                className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Enviar mensaje"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-muted-foreground">
              Enter para enviar · Shift+Enter para salto de línea
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}