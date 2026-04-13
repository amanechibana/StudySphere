import { Socket } from "socket.io";

import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // credential: admin.credential.cert(serviceAccount)
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
  } catch (err) {
    next(new Error("Authentication error"));
  }
};
