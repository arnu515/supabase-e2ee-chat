import Dexie, { Table } from "dexie";

class ChatDB extends Dexie {
  keys!: Table<{
    user_id: string;
    key: string;
  }>;
  chats!: Table<{
    id?: number;
    user_id: string;
    messages: { type: string; message: string; sent: boolean }[];
  }>;

  constructor() {
    super("chat");
    this.version(4).stores({
      keys: "key, user_id",
      chats: "++id, user_id",
    });
  }
}

export const chat = new ChatDB();
