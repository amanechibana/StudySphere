import { z } from "zod";
import { idParamsSchema } from "./id.js";

export const roomParamsSchema = idParamsSchema;

/** POST /rooms — client payload (server adds `inviteCode`, `createdAt`; `_id` from DB). */
export const createRoomBodySchema = z
  .strictObject({
    name: z.string().trim().min(1, "name is required"),
    description: z.string().trim().min(1, "description is required"),
    course: z.string().trim().min(1, "course is required"),
    ownerId: z.string().trim().min(1, "ownerId is required"),
    isPrivate: z.boolean().optional().default(false),
    capacity: z.number().int().positive().optional().default(6),
    members: z.array(z.string().trim().min(1)).optional().default([]),
  })
  .superRefine((data, ctx) => {
    if (data.members.length > data.capacity) {
      ctx.addIssue({
        code: "custom",
        path: ["members"],
        message: "members cannot exceed capacity",
      });
    }
  });

/** PATCH /rooms/:id — partial update; unknown keys rejected (strict). */
export const updateRoomBodySchema = z
  .strictObject({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1).optional(),
    course: z.string().trim().min(1).optional(),
    ownerId: z.string().trim().min(1).optional(),
    inviteCode: z.string().trim().min(1).nullable().optional(),
    isPrivate: z.boolean().optional(),
    capacity: z.number().int().positive().optional(),
    members: z.array(z.string().trim().min(1)).optional(),
    createdAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No valid fields provided for update",
  })
  .superRefine((data, ctx) => {
    if (
      data.members !== undefined &&
      data.capacity !== undefined &&
      data.members.length > data.capacity
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["members"],
        message: "members cannot exceed capacity",
      });
    }
  });

/** Full room as JSON/API shape (after serialization). */
export const roomDocumentSchema = z.strictObject({
  _id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  course: z.string(),
  ownerId: z.string(),
  inviteCode: z.string().nullable(),
  isPrivate: z.boolean(),
  capacity: z.number().int().positive(),
  members: z.array(z.string()),
  createdAt: z.coerce.date(),
});

export type CreateRoomBody = z.infer<typeof createRoomBodySchema>;
export type UpdateRoomBody = z.infer<typeof updateRoomBodySchema>;
export type RoomParams = z.infer<typeof roomParamsSchema>;
export type RoomDocument = z.infer<typeof roomDocumentSchema>;
