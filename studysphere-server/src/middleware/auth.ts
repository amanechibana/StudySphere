import type { Request, Response, NextFunction } from "express";
import { Socket } from "socket.io";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function verifyToken(token: string) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    throw new Error("Invalid Firebase token");
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Missing or malformed Authorization header" });
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    const { uid } = await verifyToken(token);
    req.user = { _id: uid };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void,
) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication error: No token"));
    }
    const decoded = await verifyToken(token);
    socket.data.userId = decoded.uid;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
};
