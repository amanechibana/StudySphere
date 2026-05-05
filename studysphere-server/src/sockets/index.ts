import { Server, Socket } from "socket.io";
import type {
  SendMessageData,
  ReceiveMessageData,
} from "../types/socket.interface.js";
import {
  getRoomById,
  leaveRoom,
  joinPublicRoom,
  joinPrivateRoom,
} from "../data/rooms.js";
import { getUserById } from "../data/users.js";
import { z } from "zod";
import { socketAuthMiddleware } from "./middleware/auth.js";
import { addStrokeToRoom } from "../data/rooms.js";
import type {
  ReceiveStrokeData,
  SendStrokeData,
} from "../types/stroke.interface.js";

const socketToRoom = new Map<string, string>();

const joinRoomSchema = z.object({
  roomId: z.string(),
  inviteCode: z.string().nullable(),
});

const sendMessageSchema = z.object({
  roomId: z.string(),
  message: z.string(),
});

const sendStrokeSchema = z.object({
  roomId: z.string(),
  stroke: z.object({
    type: z.enum(["pen", "eraser"]),
    color: z.string(),
    width: z.number(),
    points: z.array(z.object({ x: z.number(), y: z.number() })),
    timestamp: z.string().datetime(),
  }),
});

export const initSockets = (io: Server) => {
  // auth middleware
  io.use(socketAuthMiddleware);

  // connection
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);
    console.log("User ID:", socket.data.userId);

    // join room
    socket.on("join_room", async (payload: z.infer<typeof joinRoomSchema>) => {
      const parsed = joinRoomSchema.safeParse(payload);
      if (!parsed.success) {
        console.log("Invalid payload");
        return;
      }
      const { roomId, inviteCode } = parsed.data;
      const userId = socket.data.userId;

      // ensures user and room exist
      const user = await getUserById(userId);
      const room = await getRoomById(roomId);
      if (!user || !room) {
        console.log("Invalid user or room");
        return;
      }

      // ensures room is active
      if (room.isActive === false) {
        console.log("Room is not active");
        return;
      }

      // ensures room is not full
      if (room.capacity > 0 && room.members.length >= room.capacity) {
        console.log("Room is full");
        return;
      }

      // ensures that the user is not already in the room
      const currentRoom = socketToRoom.get(socket.id);
      if (currentRoom) {
        socket.leave(currentRoom);
        console.log(`User ${socket.id} left ${currentRoom}`);
        // removes user from room in database
        await leaveRoom(currentRoom, userId);

        // notify users that the user left the room
        socket.to(currentRoom).emit("user_left", {
          message: `${user.username} left the room`,
          user: {
            _id: user._id,
            username: user.username,
          },
          timestamp: new Date().toISOString(),
        } as ReceiveMessageData);
      }

      // validate private room invite code (unless user is room owner)
      if (room.isPrivate && room.ownerId !== userId) {
        console.log(
          `Private room validation - provided: "${inviteCode}", stored: "${room.inviteCode}"`,
        );
        if (!inviteCode || inviteCode !== room.inviteCode) {
          console.log(`Invalid invite code for private room ${roomId}`);
          socket.emit("join_room_error", {
            error: "Invalid invite code",
          });
          return;
        }
      }

      // adds user to room in database
      const result = room.isPrivate
        ? await joinPrivateRoom(roomId, userId, inviteCode || "")
        : await joinPublicRoom(roomId, userId);
      if (!result) {
        console.log("Failed to join room");
        socket.emit("join_room_error", {
          error: "Failed to join room",
        });
        return;
      }

      // join room and update mapping
      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);

      // notify users that the user joined the room
      socket.to(roomId).emit("user_joined", {
        message: `${user.username} joined the room`,
        user: {
          _id: user._id,
          username: user.username,
        },
        timestamp: new Date().toISOString(),
      } as ReceiveMessageData);

      console.log(`User ${socket.id} joined ${roomId}`);
    });

    // send stroke
    socket.on(
      "send_stroke",
      async (payload: z.infer<typeof sendStrokeSchema>) => {
        const parsed = sendStrokeSchema.safeParse(payload);
        if (!parsed.success) {
          console.log("Invalid payload");
          return;
        }
        const { roomId, stroke } = parsed.data;
        const userId = socket.data.userId;
        if (!userId) {
          console.log("Could not fetch user ID");
          return;
        }
        const user = await getUserById(userId);
        const room = await getRoomById(roomId);
        if (!user || !room) {
          console.log("Invalid user or room");
          return;
        }
        if (room.isActive === false) {
          console.log("Room is not active");
          return;
        }
        if (!room.members.some((m) => m === userId)) {
          console.log("User is not in room");
          return;
        }
        const result = await addStrokeToRoom(roomId, stroke);
        if (!result) {
          console.log("Failed to add stroke to room");
          return;
        }
        io.to(roomId).emit("receive_stroke", {
          stroke,
          user: {
            _id: user._id,
            username: user.username,
          },
          timestamp: new Date().toISOString(),
        } as ReceiveStrokeData);
      },
    );

    // send message
    socket.on(
      "send_message",
      async (payload: z.infer<typeof sendMessageSchema>) => {
        const parsed = sendMessageSchema.safeParse(payload);
        if (!parsed.success) {
          console.log("Invalid payload");
          return;
        }
        const { roomId, message } = parsed.data;
        const userId = socket.data.userId;
        if (!userId) {
          console.log("Could not fetch user ID");
          return;
        }

        // ensure user exists
        const user = await getUserById(userId);
        const room = await getRoomById(roomId);
        if (!user) {
          console.log("Invalid user");
          return;
        }
        // ensure room exists and is active
        if (!room) {
          console.log("Invalid room");
          return;
        }
        if (room.isActive === false) {
          console.log("Room is not active");
          return;
        }

        // ensure user is in room in the database
        if (!room.members.some((m) => m === userId)) {
          console.log("User is not in room");
          return;
        }

        // send message
        io.to(roomId).emit("receive_message", {
          message,
          user: {
            _id: user._id,
            username: user.username,
          },
          timestamp: new Date().toISOString(),
        } as ReceiveMessageData);
      },
    );

    // disconnect
    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      // ensure user exists
      const user = await getUserById(userId);
      if (!user) {
        console.log("Invalid user");
        return;
      }

      // leave room
      const roomId = socketToRoom.get(socket.id);
      if (roomId) {
        socket.leave(roomId);
        console.log(`User ${socket.id} left ${roomId}`);
        socketToRoom.delete(socket.id);

        // removes user from room in database
        await leaveRoom(roomId, userId);

        // notify users that the user left the room
        const message = `${user.username} left the room`;
        socket.to(roomId).emit("user_left", {
          message,
          user: {
            _id: user._id,
            username: user.username,
          },
          timestamp: new Date().toISOString(),
        } as ReceiveMessageData);
      }
      console.log("User disconnected:", socket.id);
    });
  });
};
