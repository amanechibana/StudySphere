import { z } from "zod";

export const joinRoomSchema = z.object({
  roomId: z.string(),
  inviteCode: z.string().nullable(),
});

export const sendMessageSchema = z.object({
  roomId: z.string(),
  message: z.string(),
});

export const sendStrokeSchema = z.object({
  roomId: z.string(),
  stroke: z.object({
    type: z.enum(["pen", "eraser"]),
    color: z.string(),
    width: z.number(),
    points: z.array(z.object({ x: z.number(), y: z.number() })),
    timestamp: z.iso.datetime(),
  }),
});

export type JoinRoomPayload = z.infer<typeof joinRoomSchema>;
export type SendMessagePayload = z.infer<typeof sendMessageSchema>;
export type SendStrokePayload = z.infer<typeof sendStrokeSchema>;
