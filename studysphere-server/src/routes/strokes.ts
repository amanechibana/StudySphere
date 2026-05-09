import { Router } from "express";
import type { Request, Response } from "express";
import { getRoomById } from "../data/rooms.js";
import { validateParams } from "../middleware/validateFields.js";
import { roomParamsSchema } from "../schema/room.js";
import { requireAuth } from "../middleware/auth.js";
import { undoStroke } from "../data/rooms.js";

const router = Router();

router.get(
  "/:id",
  validateParams(roomParamsSchema),
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

// POST /:id/undo
router.post(
  "/:id/undo",
  requireAuth,
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`POST /strokes/:id/undo`);
    try {
      const roomId = req.params.id;
      const undoResult = await undoStroke(roomId);
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
