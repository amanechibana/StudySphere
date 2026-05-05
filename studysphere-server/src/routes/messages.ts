import { Router } from "express";
import type { Request, Response } from "express";
import {
  getMessageById,
  updateMessage,
  deleteMessage,
} from "../data/messages.js";
import type { NewMessage } from "../types/message.interface.js";
import { validateBody, validateParams } from "../middleware/validateFields.js";
import {
  messageParamsSchema,
  updateMessageBodySchema,
} from "../schema/message.js";

const router = Router();

// GET /:id
router.get(
  "/:id",
  validateParams(messageParamsSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`GET /messages/${req.params.id}`);
    try {
      const message = await getMessageById(req.params.id);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.status(200).json(message);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid message ID" });
    }
  },
);

// PATCH /:id — partial update (bumps updatedAt)
router.patch(
  "/:id",
  validateParams(messageParamsSchema),
  validateBody(updateMessageBodySchema),
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`PATCH /messages/${req.params.id}`);
    try {
      const updatedMessage = await updateMessage(req.params.id, {
        ...req.body,
        updatedAt: new Date(),
      } as Partial<NewMessage>);
      if (!updatedMessage) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.status(200).json(updatedMessage);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid message ID or update failed" });
    }
  },
);

// DELETE /:id
router.delete(
  "/:id",
  validateParams(messageParamsSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`DELETE /messages/${req.params.id}`);
    try {
      const deleted = await deleteMessage(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Message not found" });
      }

      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid message ID" });
    }
  },
);

export default router;
