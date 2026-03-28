import type { Request, Response, NextFunction } from "express";

export function validateRoomFields(req: Request, res: Response, next: NextFunction) {
  const { name, description, course, ownerId, isPrivate, capacity } =
    req.body;

  if (name == null || typeof name !== "string") {
    return res.status(400).json({ error: "Invalid or missing 'name'" });
  }

  if (description == null || typeof description !== "string") {
    return res
      .status(400)
      .json({ error: "Invalid or missing 'description'" });
  }

  if (course == null || typeof course !== "string") {
    return res.status(400).json({ error: "Invalid or missing 'course'" });
  }

  if (ownerId == null || typeof ownerId !== "string") {
    return res.status(400).json({ error: "Invalid or missing 'ownerId'" });
  }

  if (isPrivate == null && typeof isPrivate !== "boolean") {
    return res.status(400).json({ error: "'isPrivate' must be a boolean" });
  }

  if (capacity == null || typeof capacity !== "number" || capacity < 0) {
    return res
      .status(400)
      .json({ error: "'capacity' must be a positive number" });
  }

  next();
}
