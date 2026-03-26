import { Router } from "express";
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { rooms } from "../config/mongoCollections.js";
import type { Room } from "../types/room.interface.ts";
import validateId from "../middleware/validateId.js";
import validateRoomFields from "../middleware/validateFields.js";

const router = Router();

// GET /
router.get("/", async (_req: Request, res: Response) => {
  try {
    const roomsCol = await rooms();
    const allRooms = await roomsCol.find().toArray();
    res.json(allRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET /:id
router.get(
  "/:id",
  validateId,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const roomsCol = await rooms();
      const room = await roomsCol.findOne({ _id: new ObjectId(req.params.id) });

      if (!room) return res.status(404).json({ error: "Room not found" });

      res.json(room);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID" });
    }
  },
);

// POST /
router.post(
  "/",
  validateRoomFields(true),
  async (req: Request, res: Response) => {
    try {
      const { name, description, course, ownerId, isPrivate, capacity } =
        req.body;

      if (!name || !description || !course || !ownerId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newRoom: Omit<Room, "_id"> = {
        name,
        description,
        course,
        ownerId,
        inviteCode: Math.random().toString(36).substring(2, 5).toUpperCase(),
        isPrivate: !!isPrivate,
        capacity: capacity || 0,
        members: [],
        createdAt: new Date(),
      };

      const roomsCol = await rooms();
      const insertResult = await roomsCol.insertOne(newRoom);

      res.status(201).json({ _id: insertResult.insertedId, ...newRoom });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create room" });
    }
  },
);

// PUT /:id
router.put(
  "/:id",
  validateId,
  validateRoomFields(false),
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const roomsCol = await rooms();
      const roomId = new ObjectId(req.params.id);

      const updateData: Partial<Room> = {};
      const allowedFields = [
        "name",
        "description",
        "course",
        "isPrivate",
        "capacity",
        "members",
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field as keyof Room] = req.body[field];
        }
      }

      const result = await roomsCol.findOneAndUpdate(
        { _id: roomId },
        { $set: updateData },
        { returnDocument: "after" },
      );

      if (!result?.value)
        return res.status(404).json({ error: "Room not found" });

      res.json(result.value);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID or update failed" });
    }
  },
);

// DELETE /:id
router.delete(
  "/:id",
  validateId,
  async (req: Request<{ id: string }>, res: Response) => {
    try {
      const roomsCol = await rooms();
      const roomId = new ObjectId(req.params.id);

      const result = await roomsCol.deleteOne({ _id: roomId });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "Room not found" });

      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID" });
    }
  },
);

export default router;
