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
import {
  getMessagesByRoomId,
  createMessage,
} from "../data/messages.js";
import type { NewRoom } from "../types/room.interface.js";
import type { NewMessage } from "../types/message.interface.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validateFields.js";
import {
  createRoomBodySchema,
  roomParamsSchema,
  updateRoomBodySchema,
} from "../schema/room.js";
import {
  createMessageBodySchema,
  listMessagesQuerySchema,
  type ListMessagesQuery,
} from "../schema/message.js";
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
  validateParams(roomParamsSchema),
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
  validateBody(createRoomBodySchema),
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
        isActive: true,
        capacity: capacity || 0,
        strokes: [],
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
  validateParams(roomParamsSchema),
  validateBody(updateRoomBodySchema),
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
  validateParams(roomParamsSchema),
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
  validateParams(roomParamsSchema),
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
        // skip invite code validation if user is room owner
        if (room.ownerId !== userId) {
          if (!req.body.inviteCode || req.body.inviteCode !== room.inviteCode) {
            return res.status(403).json({ error: "Invalid invite code" });
          }
        }
        const joinedRoom = await joinPrivateRoom(
          roomId,
          userId,
          req.body.inviteCode,
        );
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
  "/leave/:id",
  validateParams(roomParamsSchema),
  requireAuth,
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`POST /rooms/leave/${req.params.id}`);
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

// GET /:id/messages — list messages in room (newest first, paginated)
router.get(
  "/:id/messages",
  validateParams(roomParamsSchema),
  validateQuery(listMessagesQuerySchema),
  async (
    req: Request<{ id: string }, unknown, unknown, ListMessagesQuery>,
    res: Response,
  ) => {
    console.log(`GET /rooms/${req.params.id}/messages`);
    try {
      const { before, limit } = req.query;
      const result = await getMessagesByRoomId(req.params.id, before, limit);
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  },
);

// POST /:id/messages — create message in room
router.post(
  "/:id/messages",
  validateParams(roomParamsSchema),
  validateBody(createMessageBodySchema),
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`POST /rooms/${req.params.id}/messages`);
    try {
      const { senderId, body } = req.body;
      const now = new Date();
      const newMessage: NewMessage = {
        roomId: req.params.id,
        senderId,
        body,
        createdAt: now,
        updatedAt: now,
      };

      const createdMessage = await createMessage(newMessage);

      res.status(201).json(createdMessage);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create message" });
    }
  },
);

export default router;
