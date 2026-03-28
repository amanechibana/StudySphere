import type { Request, Response, NextFunction } from "express";

// Food for Thought:
// This is currently only implemented in join and leave rooms.
// We should probably use this at a higher level, like root,
// for ALL routes that need authentication.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // TODO: actually implement auth
    req.user = { _id: "placeholder-user-id" };
    next();
}
