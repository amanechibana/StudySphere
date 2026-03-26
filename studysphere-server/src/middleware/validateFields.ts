import type { Request, Response, NextFunction } from "express";

export default function validateRoomFields(requireAll = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { name, description, course, ownerId, isPrivate, capacity } =
      req.body;

    if (requireAll) {
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Invalid or missing 'name'" });
      }

      if (!description || typeof description !== "string") {
        return res
          .status(400)
          .json({ error: "Invalid or missing 'description'" });
      }

      if (!course || typeof course !== "string") {
        return res.status(400).json({ error: "Invalid or missing 'course'" });
      }

      if (!ownerId || typeof ownerId !== "string") {
        return res.status(400).json({ error: "Invalid or missing 'ownerId'" });
      }
    }

    if (name !== undefined && typeof name !== "string") {
      return res.status(400).json({ error: "'name' must be a string" });
    }

    if (description !== undefined && typeof description !== "string") {
      return res.status(400).json({ error: "'description' must be a string" });
    }

    if (course !== undefined && typeof course !== "string") {
      return res.status(400).json({ error: "'course' must be a string" });
    }

    if (ownerId !== undefined && typeof ownerId !== "string") {
      return res.status(400).json({ error: "'ownerId' must be a string" });
    }

    if (isPrivate !== undefined && typeof isPrivate !== "boolean") {
      return res.status(400).json({ error: "'isPrivate' must be a boolean" });
    }

    if (capacity !== undefined) {
      if (typeof capacity !== "number" || capacity < 0) {
        return res
          .status(400)
          .json({ error: "'capacity' must be a positive number" });
      }
    }

    next();
  };
}
