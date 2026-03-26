import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

export default function validateId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const rawId = req.params.id;

  if (!rawId) {
    return res.status(400).json({ error: "Missing ID parameter" });
  }

  if (Array.isArray(rawId)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  if (!ObjectId.isValid(rawId)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  req.params.id = rawId;

  next();
}
