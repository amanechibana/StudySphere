import { z } from "zod";

export const joinRoomSchema = z.object({
  roomId: z.string().min(1),
  inviteCode: z.string().nullable(),
});

export const sendMessageSchema = z.object({
  roomId: z.string().min(1),
  message: z.string().min(1).max(2000),
});

export const sendStrokeSchema = z.object({
  roomId: z.string().min(1),
  stroke: z.object({
    type: z.enum(["pen", "eraser"]),
    color: z.string().min(1),
    width: z.number().positive(),
    points: z.array(z.object({ x: z.number(), y: z.number() })).min(1),
    timestamp: z.string().min(1),
    userId: z.string().min(1),
  }),
});
