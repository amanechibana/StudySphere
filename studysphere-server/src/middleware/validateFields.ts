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

export function validatePartialRoomFields(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { name, description, course, ownerId, inviteCode, isPrivate, capacity, members, createdAt } =
    req.body;
  let hasField = false;

  if (name !== undefined) {
    hasField = true;
    if (typeof name !== "string") {
      return res.status(400).json({ error: "'name' must be a string" });
    }
  }
  if (description !== undefined) {
    hasField = true;
    if (typeof description !== "string") {
      return res.status(400).json({ error: "'description' must be a string" });
    }
  }
  if (course !== undefined) {
    hasField = true;
    if (typeof course !== "string") {
      return res.status(400).json({ error: "'course' must be a string" });
    }
  }
  if (ownerId !== undefined) {
    hasField = true;
    if (typeof ownerId !== "string") {
      return res.status(400).json({ error: "'ownerId' must be a string" });
    }
  }
  if (inviteCode !== undefined) {
    hasField = true;
    if (inviteCode !== null && typeof inviteCode !== "string") {
      return res
        .status(400)
        .json({ error: "'inviteCode' must be a string or null" });
    }
  }
  if (isPrivate !== undefined) {
    hasField = true;
    if (typeof isPrivate !== "boolean") {
      return res.status(400).json({ error: "'isPrivate' must be a boolean" });
    }
  }
  if (capacity !== undefined) {
    hasField = true;
    if (typeof capacity !== "number" || capacity < 0) {
      return res
        .status(400)
        .json({ error: "'capacity' must be a non-negative number" });
    }
  }
  if (members !== undefined) {
    hasField = true;
    if (!Array.isArray(members)) {
      return res.status(400).json({ error: "'members' must be an array" });
    }
    if (!members.every((m: unknown) => typeof m === "string")) {
      return res
        .status(400)
        .json({ error: "'members' must be an array of strings" });
    }
  }
  if (createdAt !== undefined) {
    hasField = true;
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) {
      return res.status(400).json({ error: "Invalid 'createdAt'" });
    }
  }

  if (!hasField) {
    return res
      .status(400)
      .json({ error: "No valid fields provided for update" });
  }

  next();
}
