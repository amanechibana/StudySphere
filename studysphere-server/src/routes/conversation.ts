import { Router } from "express";
import { summarizeConversation } from "../services/aiSummarizer.js";
import { getAllMessagesByRoomId } from "../data/messages.js";

const router = Router();

// POST /:roomId
router.post("/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ error: "roomId is required" });
    }

    const messages = await getAllMessagesByRoomId(roomId);

    if (!messages || messages.length === 0) {
      return res.status(404).json({ error: "No messages found" });
    }

    const formattedMessages = messages.map((msg) => ({
      role: "user" as const,
      content: msg.body,
    }));

    const summary = await summarizeConversation(formattedMessages);

    return res.json({ summary });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to summarize" });
  }
});

export default router;
