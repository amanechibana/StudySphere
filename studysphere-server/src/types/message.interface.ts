export type MessageId = string;

export interface Message {
  _id: MessageId;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NewMessage = Omit<Message, "_id">;
