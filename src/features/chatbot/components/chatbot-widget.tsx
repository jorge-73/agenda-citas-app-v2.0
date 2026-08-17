"use client";

import { usePathname } from "next/navigation";
import { ChatbotButton } from "./chatbot-button";
import { ChatbotGreeting } from "./chatbot-greeting";
import { ChatbotWindow } from "./chatbot-window";

const EXCLUDED_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

export function ChatbotWidget() {
  const pathname = usePathname();

  if (EXCLUDED_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <>
      <ChatbotGreeting />
      <ChatbotButton />
      <ChatbotWindow />
    </>
  );
}