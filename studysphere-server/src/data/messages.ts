import { ObjectId, type Filter, type WithId } from "mongodb";
import { messages } from "../config/mongoCollections.js";
import type { MessageId, NewMessage } from "../types/message.interface.js";
import type { RoomId } from "../types/room.interface.js";
import type { UserId } from "../types/user.interface.js";

const DEFAULT_MESSAGE_PAGE_SIZE = 50;
const MAX_MESSAGE_PAGE_SIZE = 100;

function normalizeLimit(limit?: number): number {
  return Math.min(
    Math.max(limit ?? DEFAULT_MESSAGE_PAGE_SIZE, 1),
    MAX_MESSAGE_PAGE_SIZE,
  );
}

type MessagePageResult = {
  messages: WithId<NewMessage>[];
  hasMore: boolean;
};

async function fetchMessagePage(
  filter: Filter<NewMessage>,
  before?: Date,
  limit?: number,
): Promise<MessagePageResult> {
  const pageSize = normalizeLimit(limit);
  const messagesCollection = await messages();
  const docs = await messagesCollection
    .find({
      ...filter,
      ...(before ? { createdAt: { $lt: before } } : {}),
    })
    .sort({ createdAt: -1 })
    .limit(pageSize + 1)
    .toArray();

  const hasMore = docs.length > pageSize;
  return {
    messages: hasMore ? docs.slice(0, pageSize) : docs,
    hasMore,
  };
}

async function getMessagesByRoomId(
  roomId: RoomId,
  before?: Date,
  limit?: number,
): Promise<MessagePageResult> {
  return fetchMessagePage({ roomId: roomId.toString() }, before, limit);
}

async function getMessagesBySenderId(
  senderId: UserId,
  before?: Date,
  limit?: number,
): Promise<MessagePageResult> {
  return fetchMessagePage({ senderId }, before, limit);
}

async function getAllMessagesByRoomId(roomId: RoomId) {
  const messagesCollection = await messages();
  return await messagesCollection
    .find({ roomId: roomId.toString() })
    .sort({ createdAt: 1 })
    .toArray();
}

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
    Object.entries(partial as object).filter(
      ([, value]) => value !== undefined,
    ),
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
  getAllMessagesByRoomId,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
