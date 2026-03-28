import { Router } from "express";
import type { Request, Response } from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  joinPublicRoom,
  leaveRoom,
  joinPrivateRoom,
} from "../data/rooms.js";
import type { NewRoom } from "../types/room.interface.js";
import validateId from "../middleware/validateId.js";
import {
  validateRoomFields,
  validatePartialRoomFields,
} from "../middleware/validateFields.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /
router.get("/", async (_req: Request, res: Response) => {
  console.log("GET /rooms");
  try {
    const allRooms = await getRooms();
    res.status(200).json(allRooms);
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
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.status(200).json(room);
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

      res.status(200).json(updatedRoom);
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

// POST /join/:id — public room join (`req.user` from auth; placeholder until then)
router.post(
  "/join/:id",
  validateId,
  requireAuth,
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`POST /rooms/join/${req.params.id}`);
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: "User not found" });
      }

      const roomId = req.params.id;
      const room = await getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // check to see if the room is public or private
      if (room.isPrivate) {
        const joinedRoom = await joinPrivateRoom(roomId, userId, req.body.inviteCode);
        if (!joinedRoom) {
          return res.status(404).json({ error: "Failed to join room" });
        }
        res.status(200).json(joinedRoom);
      } else {
        const joinedRoom = await joinPublicRoom(roomId, userId);
        if (!joinedRoom) {
          return res.status(404).json({ error: "Failed to join room" });
        }
        res.status(200).json(joinedRoom);
      }
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID or join failed" });
    }
  },
);

// POST /leave/:id — public room leave (`req.user` from auth; placeholder until then)
router.post(
  "/join/:id",
  validateId,
  requireAuth,
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`POST /rooms/join/${req.params.id}`);
    try {
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: "User not found" });
      }

      const roomId = req.params.id;
      const leftRoom = await leaveRoom(roomId, userId);
      if (!leftRoom) {
        return res.status(404).json({ error: "Failed to leave room" });
      }
      res.json(leftRoom);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID or join failed" });
    }
  },
);

export default router;
