"use client";

import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <span className={cn("flex items-center gap-1 py-1", className)} aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}

interface ChatbotMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export function ChatbotMessage({ role, content, isTyping }: ChatbotMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-br-lg bg-gradient-to-b from-primary to-primary/90 px-4 py-2.5 text-sm leading-relaxed text-primary-foreground shadow-sm shadow-primary/25">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
        <span className="text-[10px] font-bold">CM</span>
      </div>
      <div className="max-w-[82%] whitespace-pre-wrap rounded-2xl rounded-bl-lg border border-border/70 bg-chat-bubble px-4 py-2.5 text-sm leading-relaxed text-foreground shadow-xs">
        {isTyping ? <TypingIndicator /> : content}
      </div>
    </div>
  );
}