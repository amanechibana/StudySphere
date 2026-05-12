import type { UserId } from "./user.interface.js";

export type MessageId = string;

export interface Message {
  _id: MessageId;
  roomId: string;
  senderId: UserId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewMessage = Omit<Message, "_id">;
