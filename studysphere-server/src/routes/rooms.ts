import { Router } from "express";
import type { Request, Response } from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} from "../data/rooms.js";
import type { NewRoom } from "../types/room.interface.js";
import validateId from "../middleware/validateId.js";
import {
  validateRoomFields,
  validatePartialRoomFields,
} from "../middleware/validateFields.js";

const router = Router();

// GET /
router.get("/", async (_req: Request, res: Response) => {
  console.log("GET /rooms");
  try {
    const allRooms = await getRooms();
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
    console.log(`GET /rooms/${req.params.id}`);
    try {
      const roomId = req.params.id;
      const room = await getRoomById(roomId);

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
  validateRoomFields,
  async (req: Request, res: Response) => {
    console.log("POST /rooms");
    try {
      const { name, description, course, ownerId, isPrivate, capacity } =
        req.body;

      const newRoom: NewRoom = {
        name,
        description,
        course,
        ownerId,
        inviteCode: Math.random().toString(36).substring(2, 5).toUpperCase(),
        isPrivate: isPrivate,
        capacity: capacity || 0,
        members: [],
        createdAt: new Date(),
      };

      const createdRoom = await createRoom(newRoom);

      res.status(201).json(createdRoom);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create room" });
    }
  },
);

// PATCH /:id — partial update
router.patch(
  "/:id",
  validateId,
  validatePartialRoomFields,
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`PATCH /rooms/${req.params.id}`);
    try {
      const updatedRoom = await updateRoom(
        req.params.id,
        req.body as Partial<NewRoom>,
      );

      if (!updatedRoom) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.json(updatedRoom);
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
    console.log(`DELETE /rooms/${req.params.id}`);
    try {
      const roomId = req.params.id;
      const deleted = await deleteRoom(roomId);
      if (!deleted) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID" });
    }
  },
);

export default router;
