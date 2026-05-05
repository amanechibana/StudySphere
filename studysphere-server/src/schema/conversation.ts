import { z } from "zod";

export const summarizeParamsSchema = z.object({
  roomId: z
    .string()
    .min(1, "roomId is required")
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid roomId format"),
});
