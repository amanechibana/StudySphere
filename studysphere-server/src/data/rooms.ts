import {
  ObjectId,
  type Document,
  type UpdateFilter,
  type WithId,
} from "mongodb";
import { rooms } from "../config/mongoCollections.js";
import type { RoomId, NewRoom } from "../types/room.interface.js";
import type { UserId } from "../types/user.interface.js";
import type { Stroke, UndoStrokeResult } from "../types/stroke.interface.js";

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
    { $addToSet: { members: userId }, $unset: { lastUserLeftAt: "" } },
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
    { $addToSet: { members: userId }, $unset: { lastUserLeftAt: "" } },
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

  if (result && result.members && result.members.length === 0) {
    const updatedResult = await roomsCollection.findOneAndUpdate(
      { _id: roomId },
      {
        $set: { lastUserLeftAt: new Date() },
      } as unknown as UpdateFilter<Document>,
      { returnDocument: "after" },
    );
    return updatedResult ?? null;
  }

  return result ?? null;
}

async function addStrokeToRoom(
  id: RoomId,
  stroke: Stroke,
): Promise<WithId<NewRoom> | null> {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);
  const result = await roomsCollection.findOneAndUpdate(
    { _id: roomId },
    { $push: { strokes: stroke } },
    { returnDocument: "after" },
  );
  return result ?? null;
}

async function undoStrokeToRoom(
  id: RoomId,
  userId: UserId,
): Promise<UndoStrokeResult | null> {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);

  const room = await roomsCollection.findOne({ _id: roomId });
  if (!room || !room.strokes || room.strokes.length === 0) {
    console.log("No strokes to undo");
    return null;
  }

  const userStrokes = room.strokes.filter((s: Stroke) => s.userId === userId);
  if (userStrokes.length === 0) {
    console.log("User has no strokes to undo");
    return null;
  }

  const latestStroke = userStrokes.reduce((latest, current) => {
    return new Date(current.timestamp) > new Date(latest.timestamp)
      ? current
      : latest;
  });

  const result = await roomsCollection.findOneAndUpdate(
    { _id: roomId },
    { $pull: { strokes: latestStroke } },
    { returnDocument: "after" },
  );
  if (!result) {
    console.log("Failed to undo stroke");
    return null;
  }

  return { room: result, removedStroke: latestStroke };
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
  addStrokeToRoom,
  undoStrokeToRoom,
};
