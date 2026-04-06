import { Router } from "express";
import type { Request, Response } from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "../data/users.js";
import type { NewUser } from "../types/user.interface.js";
import { validateBody, validateParams } from "../middleware/validateFields.js";
import {
  userIdParamsSchema,
  firebaseUidParamsSchema,
  createUserBodySchema,
  updateUserBodySchema,
} from "../schema/user.js";

const router = Router();

// GET /
router.get("/", async (_req: Request, res: Response) => {
  console.log("GET /users");
  try {
    const allUsers = await getUsers();
    res.status(200).json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /firebase/:uid — lookup by Firebase UID (same as stored `_id`)
router.get(
  "/firebase/:uid",
  validateParams(firebaseUidParamsSchema),
  async (req: Request<{ uid: string }>, res: Response) => {
    console.log(`GET /users/firebase/${req.params.uid}`);
    try {
      const user = await getUserById(req.params.uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  },
);

// GET /:id
router.get(
  "/:id",
  validateParams(userIdParamsSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`GET /users/${req.params.id}`);
    try {
      const userId = req.params.id;
      const user = await getUserById(userId);
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
  async (req: Request, res: Response) => {
    console.log("POST /users");
    try {
      const { firebaseUid, username, email } = req.body as {
        firebaseUid: string;
        username: string;
        email?: string | null;
      };

      const newUser: NewUser = {
        _id: firebaseUid,
        username,
        email: email ?? null,
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
  async (req: Request<{ id: string }>, res: Response) => {
    console.log(`PATCH /users/${req.params.id}`);
    try {
      const updatedUser = await updateUser(
        req.params.id,
        req.body as Partial<NewUser>,
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
  async (req: Request<{ id: string }>, res: Response) => {
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
