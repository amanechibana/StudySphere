import { ObjectId } from "mongodb";
import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { users, rooms, messages } from "../config/mongoCollections.js";

import type { User } from "../types/user.interface.js";
import type { Room } from "../types/room.interface.js";
import type { NewMessage } from "../types/message.interface.js";

const ROOM_1_ID = new ObjectId();
const ROOM_2_ID = new ObjectId();
const ROOM_3_ID = new ObjectId();
const ROOM_4_ID = new ObjectId();
const ROOM_5_ID = new ObjectId();

const SEED_USERS: User[] = [
  {
    _id: "user_001",
    username: "alice",
    email: "alice@test.com",
    displayName: "Alice",
    createdAt: new Date(),
  },
  {
    _id: "user_002",
    username: "bob",
    email: "bob@test.com",
    displayName: "Bob",
    createdAt: new Date(),
  },
  {
    _id: "user_003",
    username: "charlie",
    email: "charlie@test.com",
    displayName: "Charlie",
    createdAt: new Date(),
  },
  {
    _id: "user_004",
    username: "diana",
    email: "diana@test.com",
    displayName: "Diana",
    createdAt: new Date(),
  },
  {
    _id: "user_005",
    username: "eve",
    email: "eve@test.com",
    displayName: "Eve",
    createdAt: new Date(),
  },
  {
    _id: "PVcGiUgiBbRcgFmmb6JTlI4TI8u1",
    username: "test_user",
    email: "test@test.com",
    displayName: "Test User",
    createdAt: new Date("2026-05-11T23:43:03.712+00:00"),
  },
];

const SEED_ROOMS: Room[] = [
  {
    _id: ROOM_1_ID,
    name: "CS554 - Data Structures",
    description: "Study group for CS554",
    course: "CS554",
    ownerId: "user_001",
    inviteCode: null,
    isPrivate: false,
    isActive: true,
    capacity: 10,
    strokes: [],
    members: ["user_001", "user_002", "user_003"],
    pastMembers: ["user_001", "user_002", "user_003"],
    createdAt: new Date(),
    isArchived: false,
  },
  {
    _id: ROOM_2_ID,
    name: "MATH201 - Calculus",
    description: "Private study group",
    course: "MATH201",
    ownerId: "user_002",
    inviteCode: "CS4",
    isPrivate: true,
    isActive: true,
    capacity: 8,
    strokes: [
      {
        type: "pen",
        color: "#000000",
        width: 2,
        points: [
          { x: 10, y: 10 },
          { x: 1000, y: 1000 },
        ],
        timestamp: new Date().toISOString(),
        userId: "PVcGiUgiBbRcgFmmb6JTlI4TI8u1",
      },
    ],
    members: ["user_002", "user_004", "PVcGiUgiBbRcgFmmb6JTlI4TI8u1"],
    pastMembers: ["user_002", "user_004", "PVcGiUgiBbRcgFmmb6JTlI4TI8u1"],
    createdAt: new Date(),
    isArchived: false,
  },
  {
    _id: ROOM_3_ID,
    name: "General Chemistry",
    description: "Chemistry lab collaboration",
    course: "CHEM101",
    ownerId: "user_003",
    inviteCode: null,
    isPrivate: false,
    isActive: true,
    capacity: 10,
    strokes: [],
    members: ["user_003", "user_005"],
    pastMembers: ["user_003", "user_005"],
    createdAt: new Date(),
    isArchived: false,
  },
  {
    _id: ROOM_4_ID,
    name: "Archived Public Room",
    description: "An archived public room",
    course: "ARCH101",
    ownerId: "user_001",
    inviteCode: null,
    isPrivate: false,
    isActive: true,
    capacity: 5,
    strokes: [
      {
        type: "eraser",
        color: "#FFFFFF",
        width: 5,
        points: [{ x: 50, y: 50 }],
        timestamp: new Date().toISOString(),
        userId: "user_001",
      },
    ],
    members: [],
    pastMembers: ["PVcGiUgiBbRcgFmmb6JTlI4TI8u1"],
    createdAt: new Date(),
    isArchived: true,
    summary: "This room is archived and contains a summary of the discussion.",
  },
  {
    _id: ROOM_5_ID,
    name: "Archived Private Room",
    description: "An archived private room",
    course: "PRIV101",
    ownerId: "PVcGiUgiBbRcgFmmb6JTlI4TI8u1",
    inviteCode: "TEST",
    isPrivate: true,
    isActive: true,
    capacity: 3,
    strokes: [],
    members: [],
    pastMembers: ["PVcGiUgiBbRcgFmmb6JTlI4TI8u1", "user_002"],
    createdAt: new Date(),
    isArchived: true,
    summary: "Private archived room and a summary of the discussion.",
  },
];

const SEED_MESSAGES: NewMessage[] = [
  {
    roomId: ROOM_1_ID.toString(),
    senderId: "user_001",
    body: "Hello everyone in CS554!",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roomId: ROOM_1_ID.toString(),
    senderId: "PVcGiUgiBbRcgFmmb6JTlI4TI8u1",
    body: "Hi Alice, I'm joining the study group.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roomId: ROOM_2_ID.toString(),
    senderId: "user_002",
    body: "Private math discussion.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roomId: ROOM_2_ID.toString(),
    senderId: "PVcGiUgiBbRcgFmmb6JTlI4TI8u1",
    body: "I added a stroke on the canvas.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roomId: ROOM_3_ID.toString(),
    senderId: "user_003",
    body: "Chemistry notes here.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roomId: ROOM_4_ID.toString(),
    senderId: "PVcGiUgiBbRcgFmmb6JTlI4TI8u1",
    body: "This room is archived.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roomId: ROOM_5_ID.toString(),
    senderId: "PVcGiUgiBbRcgFmmb6JTlI4TI8u1",
    body: "Private archived message.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  try {
    console.log("Starting database seed...");

    const db = await dbConnection();

    try {
      await db.collection("users").drop();
    } catch {
      console.log("User collection does not exist.");
    }

    try {
      await db.collection("rooms").drop();
    } catch {
      console.log("Room collection does not exist.");
    }

    try {
      await db.collection("messages").drop();
    } catch {
      console.log("Messages collection does not exist.");
    }

    // Seed users
    const usersCollection = await users();
    await usersCollection.insertMany(SEED_USERS as any);
    console.log(`Seeded ${SEED_USERS.length} users`);

    // Seed rooms
    const roomsCollection = await rooms();
    await roomsCollection.insertMany(SEED_ROOMS as any);
    console.log(`Seeded ${SEED_ROOMS.length} rooms`);

    // Seed messages
    const messagesCollection = await messages();
    await messagesCollection.insertMany(SEED_MESSAGES as any);
    console.log(`Seeded ${SEED_MESSAGES.length} messages`);

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  } finally {
    await closeConnection();
    process.exit(0);
  }
}

seed();
