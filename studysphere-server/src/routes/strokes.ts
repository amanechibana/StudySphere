import { Router } from "express";
import type { Request, Response } from "express";
import { getRoomById } from "../data/rooms.js";
import { validateParams } from "../middleware/validateFields.js";
import { roomParamsSchema } from "../schema/room.js";

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

export default router;
