import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description is too long"),
  course: z.string().trim().min(1, "Course is required").max(100, "Course is too long"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(10, "Capacity cannot exceed 10"),
  isPrivate: z.boolean(),
});