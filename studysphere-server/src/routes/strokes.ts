import { Router } from "express";
import type { Request, Response } from "express";
import { getRoomById } from "../data/rooms.js";
import { validateBody, validateParams } from "../middleware/validateFields.js";
import { roomParamsSchema } from "../schema/room.js";
import { requireAuth } from "../middleware/auth.js";
import { undoStrokeToRoom, addStrokeToRoom } from "../data/rooms.js";
import type { Stroke } from "../types/stroke.interface.js";
import { getUserById } from "../data/users.js";
import { sendStrokeSchema } from "../schema/socket.js";

const router = Router();

router.get(
  "/:id",
  validateParams(roomParamsSchema),
  requireAuth,
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`GET /strokes/${req.params.id}`);
    try {
      const roomId = req.params.id;
      const room = await getRoomById(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      res.status(200).json(room.strokes ?? []);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID" });
    }
  },
);

// POST
router.post(
  "/",
  validateBody(sendStrokeSchema),
  requireAuth,
  async (req: Request<{ roomId: string }, Stroke>, res: Response) => {
    console.log(`POST /strokes`);
    try {
      const { roomId, stroke } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(401).json({ error: "User not found" });
      }
      stroke.userId = userId;

      const user = await getUserById(userId);
      const room = await getRoomById(roomId);
      if (!user || !room) {
        console.log("Invalid user or room");
        return res.status(404).json({ error: "Invalid user or room" });
      }
      if (room.isActive === false) {
        console.log("Room is not active");
        return res.status(404).json({ error: "Room is not active" });
      }
      if (!room.members.some((m) => m === userId)) {
        console.log("User is not in room");
        return res.status(404).json({ error: "User is not in room" });
      }
      const result = await addStrokeToRoom(roomId, stroke);
      if (!result) {
        console.log("Failed to add stroke to room");
        return res.status(404).json({ error: "Failed to add stroke to room" });
      }
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid request body" });
    }
  },
);

// POST /:id/undo
router.post(
  "/:id/undo",
  requireAuth,
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`POST /strokes/:id/undo`);
    try {
      const roomId = req.params.id;
      const userId = req.user?._id;
      if (!userId) {
        return res.status(401).json({ error: "User not found" });
      }
      const undoResult = await undoStrokeToRoom(roomId, userId);
      if (!undoResult) {
        return res.status(404).json({ error: "Failed to undo stroke" });
      }

      res.status(200).json(undoResult);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid room ID" });
    }
  },
);

export default router;
