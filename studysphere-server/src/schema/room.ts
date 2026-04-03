import { z } from "zod";
import { idParamsSchema } from "./id.js";

export const roomParamsSchema = idParamsSchema;

// Add error messages  
export const createRoomBodySchema = z
  .strictObject({
    name: z.string().trim().min(1, "name is required").max(100, "name is too long"),
    description: z.string().trim().min(1, "description is required").max(500, "description is too long"),
    course: z.string().trim().min(1, "course is required").max(100, "course is too long"),
    ownerId: z.string().trim().min(1, "ownerId is required").max(100, "ownerId is too long"),
    private: z.boolean().optional(),
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

  export const updateRoomBodySchema = z
  .strictObject({
    name: z.string().trim().min(1).max(100).optional(),
    description: z.string().trim().min(1).max(500).optional(),
    course: z.string().trim().min(1).max(100).optional(),
    ownerId: z.string().trim().min(1).max(100).optional(),
    inviteCode: z.string().trim().min(1).max(10).nullable().optional(),
    isPrivate: z.boolean().optional(),
    capacity: z.number().int().positive().optional(),
    members: z.array(z.string().trim().min(1).max(100)).optional(),
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

export const roomDocumentSchema = z.strictObject({
  _id: z.string().min(1).max(100),
  name: z.string().max(100),
  description: z.string().max(500),
  course: z.string().max(100),
  ownerId: z.string().max(100),
  inviteCode: z.string().max(10).nullable(),
  isPrivate: z.boolean(),
  capacity: z.number().int().positive(),
  members: z.array(z.string().max(100)),
  createdAt: z.coerce.date(),
});

export type CreateRoomBody = z.infer<typeof createRoomBodySchema>;
export type UpdateRoomBody = z.infer<typeof updateRoomBodySchema>;
export type RoomParams = z.infer<typeof roomParamsSchema>;
export type RoomDocument = z.infer<typeof roomDocumentSchema>;
