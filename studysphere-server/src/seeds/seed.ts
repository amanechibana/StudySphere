import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import { users, rooms } from "../config/mongoCollections.js";
import type { User } from "../types/user.interface.js";
import type { NewRoom } from "../types/room.interface.js";

const SEED_USERS: User[] = [
    {
        _id: "user_001",
        username: "alice",
        email: "alice@test.com",
        createdAt: new Date(),
    },
    {
        _id: "user_002",
        username: "bob",
        email: "bob@test.com",
        createdAt: new Date(),
    },
    {
        _id: "user_003",
        username: "charlie",
        email: "charlie@test.com",
        createdAt: new Date(),
    },
    {
        _id: "user_004",
        username: "diana",
        email: "diana@test.com",
        createdAt: new Date(),
    },
    {
        _id: "user_005",
        username: "eve",
        email: "eve@test.com",
        createdAt: new Date(),
    },
];

const SEED_ROOMS: NewRoom[] = [
    {
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
        createdAt: new Date(),
        isArchived: false,
    },
    {
        name: "MATH201 - Calculus",
        description: "Private study group",
        course: "MATH201",
        ownerId: "user_002",
        inviteCode: "CS4",
        isPrivate: true,
        isActive: true,
        capacity: 8,
        strokes: [],
        members: ["user_002", "user_004"],
        createdAt: new Date(),
        isArchived: false,
    },
    {
        name: "General Chemistry",
        description: "Chemistry lab collaboration",
        course: "CHEM101",
        ownerId: "user_003",
        inviteCode: null,
        isPrivate: false,
        isActive: true,
        capacity: 12,
        strokes: [],
        members: ["user_003", "user_005"],
        createdAt: new Date(),
        isArchived: false,
    },
];

async function seed() {
    try {
        console.log("Starting database seed...");

        const db = await dbConnection();

        try {
            await db.collection("users").drop();
        } catch (err) {
            // Collection doesn't exist
            console.log("User collection does not exist.");
        }

        try {
            await db.collection("rooms").drop();
        } catch (err) {
            // Collection doesn't exist
            console.log("Room collection does not exist.");
        }

        // Seed users
        const usersCollection = await users();
        await usersCollection.insertMany(SEED_USERS);
        console.log(`Seeded ${SEED_USERS.length} users`);

        // Seed rooms
        const roomsCollection = await rooms();
        await roomsCollection.insertMany(SEED_ROOMS);
        console.log(`Seeded ${SEED_ROOMS.length} rooms`);

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
