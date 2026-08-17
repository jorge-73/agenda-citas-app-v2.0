"use server";

import { sendChatMessage } from "./services/chatbot.service";
import type { ChatServiceResult } from "./types";

export async function sendChatMessageAction(
  input: unknown
): Promise<ChatServiceResult> {
  return sendChatMessage(input);
}