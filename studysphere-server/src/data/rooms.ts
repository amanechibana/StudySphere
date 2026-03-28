import { ObjectId, type Document, type UpdateFilter, type WithId } from "mongodb";
import { rooms } from "../config/mongoCollections.js";
import type { RoomId, NewRoom } from "../types/room.interface.js";
import type { UserId } from "../types/user.interface.js";

async function getRooms() {
  const roomsCollection = await rooms();
  const allRooms = await roomsCollection.find().toArray();

  return allRooms;
}

async function getRoomById(id: RoomId) {
  const roomsCollection = await rooms();
  const room = await roomsCollection.findOne({ _id: new ObjectId(id) });

  return room;
}

async function createRoom(room: NewRoom) {
  const roomsCollection = await rooms();
  const result = await roomsCollection.insertOne(room);

  return { _id: result.insertedId, ...room };
}

async function updateRoom(
  id: RoomId,
  partial: Partial<NewRoom>,
): Promise<WithId<NewRoom> | null> {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);

  const write = Object.fromEntries(
    Object.entries(partial as object).filter(([, v]) => v !== undefined),
  ) as Record<string, unknown>;

  const result = await roomsCollection.findOneAndUpdate(
    { _id: roomId },
    { $set: write },
    { returnDocument: "after" },
  );

  return result ?? null;
}

async function deleteRoom(id: RoomId) {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);
  const result = await roomsCollection.deleteOne({ _id: roomId });

  return result.deletedCount > 0;
}

async function joinPublicRoom(
  id: RoomId,
  userId: UserId,
): Promise<WithId<NewRoom> | null> {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);
  const result = await roomsCollection.findOneAndUpdate(
    { _id: roomId },
    { $addToSet: { members: userId } },
    { returnDocument: "after" },
  );
  
  return result ?? null;
}

async function joinPrivateRoom(
  id: RoomId,
  userId: UserId,
  inviteCode: string,
): Promise<WithId<NewRoom> | null> {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);
  const result = await roomsCollection.findOneAndUpdate(
    { _id: roomId, inviteCode },
    { $addToSet: { members: userId } },
    { returnDocument: "after" },
  );
  
  return result ?? null;
}

async function leaveRoom(
  id: RoomId,
  userId: UserId,
): Promise<WithId<NewRoom> | null> {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);
  const result = await roomsCollection.findOneAndUpdate(
    { _id: roomId },
    { $pull: { members: userId } } as unknown as UpdateFilter<Document>,
    { returnDocument: "after" },
  );
  
  return result ?? null;
}

export {
  getRoomById,
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
  joinPublicRoom,
  joinPrivateRoom,
  leaveRoom,
};
