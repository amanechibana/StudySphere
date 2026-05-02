import { ObjectId, type Document, type UpdateFilter, type WithId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import type { UserId, User } from "../types/user.interface.js";

async function getUsers() {
  const usersCollection = await users();
  const allUsers = await usersCollection.find().toArray();

  return allUsers;
}

async function getUserById(id: UserId) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: id });

  return user;
}

async function createUser(user: User) {
  const usersCollection = await users();
  await usersCollection.insertOne(user);

  return { ...user };
}

async function updateUser(
  id: UserId,
  partial: Partial<User>,
): Promise<WithId<User> | null> {
  const usersCollection = await users();

  const write = Object.fromEntries(
    Object.entries(partial as object).filter(([, v]) => v !== undefined),
  ) as Record<string, unknown>;

  const result = await usersCollection.findOneAndUpdate(
    { _id: id },
    { $set: write },
    { returnDocument: "after" },
  );

  return result ?? null;
}

async function deleteUser(id: UserId) {
  const usersCollection = await users();
  const result = await usersCollection.deleteOne({ _id: id });

  return result.deletedCount > 0;
}

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
