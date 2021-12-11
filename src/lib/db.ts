import Dexie, { Table } from "dexie";

class ChatDB extends Dexie {
  keys!: Table<{
    user_id: string;
    key: string;
  }>;

  constructor() {
    super("chat");
    this.version(1).stores({
      keys: "key, user_id",
    });
  }
}

export const chat = new ChatDB();
