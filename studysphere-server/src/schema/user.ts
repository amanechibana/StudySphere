import { z } from "zod";

/** `GET|PATCH|DELETE /users/:id` */
export const userIdParamsSchema = z.strictObject({
  id: z.string().trim().min(1, "id is required").max(128, "id is too long"),
});

/** `GET /users/firebase/:uid` */
export const firebaseUidParamsSchema = z.strictObject({
  uid: z.string().trim().min(1, "uid is required").max(128, "uid is too long"),
});

export const createUserBodySchema = z.strictObject({
  firebaseUid: z.string().trim().min(1, "firebaseUid is required").max(128),
  username: z
    .string()
    .trim()
    .min(3, "username must be at least 3 characters")
    .max(20, "username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "username can only contain letters, numbers, and underscores"),
  email: z.union([z.string().email(), z.null()]).optional(),
});

export const updateUserBodySchema = z
  .strictObject({
    username: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().optional(),
    createdAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "No valid fields provided for update",
  });

export const userDocumentSchema = z.strictObject({
  _id: z.string().min(1).max(128),
  username: z.string().max(100),
  email: z.union([z.string().email(), z.null()]),
  createdAt: z.coerce.date(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type UserParams = z.infer<typeof userIdParamsSchema>;
export type UserDocument = z.infer<typeof userDocumentSchema>;
