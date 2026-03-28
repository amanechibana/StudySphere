import { ObjectId } from "mongodb";
import { rooms } from "../config/mongoCollections.js";
import type { NewRoom } from "../types/room.interface.js";

async function getRooms() {
  const roomsCollection = await rooms();
  const allRooms = await roomsCollection.find().toArray();

  return allRooms;
}

async function getRoomById(id: string) {
  const roomsCollection = await rooms();
  const room = await roomsCollection.findOne({ _id: new ObjectId(id) });

  return room;
}

async function createRoom(room: NewRoom) {
  const roomsCollection = await rooms();
  const result = await roomsCollection.insertOne(room);

  return { _id: result.insertedId, ...room };
}

async function updateRoom(id: string, room: NewRoom) {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);
  const result = await roomsCollection.findOneAndReplace(
    { _id: roomId },
    { _id: roomId, ...room },
    { returnDocument: "after" },
  );
  const newRoom = result?.value;

  return newRoom ?? null;
}

async function deleteRoom(id: string) {
  const roomsCollection = await rooms();
  const roomId = new ObjectId(id);
  const result = await roomsCollection.deleteOne({ _id: roomId });

  return result.deletedCount > 0;
}

export { 
  getRoomById,
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom
};
