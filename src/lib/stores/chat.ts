import { atom } from "nanostores";
import { chat } from "../db";

export interface ChatMessage {
  user_id: string;
  messages: {
    type: string;
    message: string;
    sent: boolean;
  }[];
}

export const chats = atom<ChatMessage[]>([]);

// array of user_id who have unread messages
export const newChats = atom<string[]>([]);

export async function refreshChatsStore() {
  const chatMessages = await chat.chats.toArray();
  console.log({ chatMessages });
  if (!chatMessages?.length) return;
  newChats.set([...newChats.get(), [...chatMessages].pop()!.user_id]);
  chats.set(chatMessages || []);
}
