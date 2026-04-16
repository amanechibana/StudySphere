import { ObjectId, type WithId } from "mongodb";
import { messages } from "../config/mongoCollections.js";
import type { MessageId, NewMessage } from "../types/message.interface.js";
import type { RoomId } from "../types/room.interface.js";
import type { UserId } from "../types/user.interface.js";

async function getMessagesByRoomId(roomId: RoomId) {
  const messagesCollection = await messages();
  const roomMessages = await messagesCollection
    .find({ roomId })
    .sort({ createdAt: 1 })
    .toArray();

  return roomMessages;
}

async function getMessagesBySenderId(senderId: UserId) {
  const messagesCollection = await messages();
  const senderMessages = await messagesCollection
    .find({ senderId })
    .sort({ createdAt: 1 })
    .toArray();

  return senderMessages;
}

// Get more strict checks? This is grabbing all messages maybe we need to be more specific ex: who?
async function getMessageById(id: MessageId) {
  const messagesCollection = await messages();
  const message = await messagesCollection.findOne({ _id: new ObjectId(id) });

  return message;
}

async function createMessage(message: NewMessage) {
  const messagesCollection = await messages();
  const result = await messagesCollection.insertOne(message);

  return { _id: result.insertedId, ...message };
}

async function updateMessage(
  id: MessageId,
  partial: Partial<NewMessage>,
): Promise<WithId<NewMessage> | null> {
  const messagesCollection = await messages();
  const messageId = new ObjectId(id);

  const write = Object.fromEntries(
    Object.entries(partial as object).filter(([, value]) => value !== undefined),
  ) as Record<string, unknown>;

  const result = await messagesCollection.findOneAndUpdate(
    { _id: messageId },
    { $set: write },
    { returnDocument: "after" },
  );

  return result ?? null;
}

async function deleteMessage(id: MessageId) {
  const messagesCollection = await messages();
  const messageId = new ObjectId(id);
  const result = await messagesCollection.deleteOne({ _id: messageId });

  return result.deletedCount > 0;
}

export {
  getMessagesByRoomId,
  getMessagesBySenderId,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
