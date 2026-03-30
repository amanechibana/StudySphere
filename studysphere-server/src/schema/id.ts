import { ObjectId } from "mongodb";
import { z } from "zod";

export const mongoIdSchema = z
  .string()
  .min(1, "id is required")
  .refine((id) => ObjectId.isValid(id), { message: "Invalid ID format" });

export const idParamsSchema = z.strictObject({
  id: mongoIdSchema,
});

export type IdParams = z.infer<typeof idParamsSchema>;
