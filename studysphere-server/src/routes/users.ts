import { Router } from "express";
import type { Request, Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../data/users.js";
import type { User } from "../types/user.interface.js";
import { validateBody, validateParams } from "../middleware/validateFields.js";
import { requireAuth } from "../middleware/auth.js";
import {
  userIdParamsSchema,
  createUserBodySchema,
  updateUserBodySchema,
  type CreateUserBody,
  type UpdateUserBody,
  type UserParams,
} from "../schema/user.js";
import type { ErrorResponse } from "../types/api.interface.ts";

const router = Router();

// GET /
router.get("/", requireAuth, async (_req: Request, res: Response) => {
  console.log("GET /users");
  try {
    const allUsers = await getUsers();
    res.status(200).json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /me — current authenticated user
router.get(
  "/me",
  requireAuth,
  async (req: Request, res: Response<User | ErrorResponse>) => {
    console.log("GET /users/me");
    try {
      console.log("Authenticated user ID:", req.user?._id);
      const user = await getUserById(req.user!._id);
      console.log("Fetched user:", user);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch current user" });
    }
  },
);

// PATCH /me — update current authenticated user's profile
router.patch(
  "/me",
  requireAuth,
  validateBody(updateUserBodySchema),
  async (
    req: Request<ParamsDictionary, User | ErrorResponse, UpdateUserBody>,
    res: Response<User | ErrorResponse>,
  ) => {
    console.log("PATCH /users/me");
    try {
      const updatedUser = await updateUser(
        req.user!._id,
        req.body as Partial<User>,
      );
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update profile" });
    }
  },
);

// GET /:id — _id is the Firebase UID
router.get(
  "/:id",
  validateParams(userIdParamsSchema),
  requireAuth,
  async (req: Request<UserParams>, res: Response<User | ErrorResponse>) => {
    console.log(`GET /users/${req.params.id}`);
    try {
      const user = await getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid user ID" });
    }
  },
);

// POST /
router.post(
  "/",
  validateBody(createUserBodySchema),
  async (
    req: Request<ParamsDictionary, User | ErrorResponse, CreateUserBody>,
    res: Response<User | ErrorResponse>,
  ) => {
    console.log("POST /users");
    try {
      const { firebaseUid, username, email } = req.body;

      const newUser: User = {
        _id: firebaseUid,
        username,
        email: email ?? null,
        displayName: null,
        createdAt: new Date(),
      };

      const createdUser = await createUser(newUser);

      res.status(201).json(createdUser);
    } catch (err: unknown) {
      console.error(err);
      const code =
        err && typeof err === "object" && "code" in err
          ? (err as { code: number }).code
          : undefined;
      if (code === 11000) {
        return res.status(409).json({ error: "User already exists" });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  },
);

// PATCH /:id — partial update
router.patch(
  "/:id",
  validateParams(userIdParamsSchema),
  validateBody(updateUserBodySchema),
  requireAuth,
  async (
    req: Request<UserParams, User | ErrorResponse, UpdateUserBody>,
    res: Response<User | ErrorResponse>,
  ) => {
    console.log(`PATCH /users/${req.params.id}`);
    try {
      const updatedUser = await updateUser(
        req.params.id,
        req.body as Partial<User>,
      );
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid user ID or update failed" });
    }
  },
);

// DELETE /:id
router.delete(
  "/:id",
  validateParams(userIdParamsSchema),
  requireAuth,
  async (req: Request<UserParams>, res: Response<ErrorResponse>) => {
    console.log(`DELETE /users/${req.params.id}`);
    try {
      const userId = req.params.id;
      const deleted = await deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.sendStatus(204);
    } catch (err) {
      console.error(err);
      res.status(400).json({ error: "Invalid user ID" });
    }
  },
);

export default router;
