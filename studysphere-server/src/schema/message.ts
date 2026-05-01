import { z } from "zod";
import { idParamsSchema, mongoIdSchema } from "./id.js";

export const messageParamsSchema = idParamsSchema;

export const listMessagesQuerySchema = z.strictObject({
  before: z.coerce.date().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const createMessageBodySchema = z.strictObject({
  senderId: z.string().trim().min(1, "senderId is required").max(128, "senderId is too long"),
  body: z.string().trim().min(1, "body is required").max(4000, "body is too long"),
});

export const updateMessageBodySchema = z.strictObject({
  body: z.string().trim().min(1, "body is required").max(4000, "body is too long"),
});

export const messageDocumentSchema = z.strictObject({
  _id: mongoIdSchema,
  roomId: mongoIdSchema,
  senderId: z.string().min(1).max(128),
  body: z.string().max(4000),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
export type CreateMessageBody = z.infer<typeof createMessageBodySchema>;
export type UpdateMessageBody = z.infer<typeof updateMessageBodySchema>;
export type MessageParams = z.infer<typeof messageParamsSchema>;
export type MessageDocument = z.infer<typeof messageDocumentSchema>;
