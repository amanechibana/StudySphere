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
import { createMessage } from "../data/messages.js";
import { socketAuthMiddleware } from "../middleware/auth.js";
import { addStrokeToRoom } from "../data/rooms.js";
import type {
  ReceiveStrokeData,
  SendStrokeData,
} from "../types/stroke.interface.js";
import { isRoomArchived, updateRoomArchiveStatus } from "../helpers.js";
import {
  joinRoomSchema,
  sendMessageSchema,
  sendStrokeSchema,
  voiceJoinSchema,
  voiceLeaveSchema,
  voiceMuteSchema,
  voiceSpeakingSchema,
  type JoinRoomPayload,
  type SendMessagePayload,
  type SendStrokePayload,
  type VoiceJoinPayload,
  type VoiceLeavePayload,
  type VoiceMutePayload,
  type VoiceSpeakingPayload,
} from "../schema/socket.js";

const socketToRoom = new Map<string, string>();

type VoiceMember = {
  userId: string;
  username: string;
  muted: boolean;
  speaking: boolean;
};
const roomVoiceMembers = new Map<string, Map<string, VoiceMember>>();

function getVoiceMembers(roomId: string): VoiceMember[] {
  return Array.from(roomVoiceMembers.get(roomId)?.values() ?? []);
}

function broadcastVoiceState(io: Server, roomId: string) {
  io.to(roomId).emit("voice_state", {
    roomId,
    members: getVoiceMembers(roomId),
  });
}

function removeFromVoice(io: Server, roomId: string, userId: string) {
  const members = roomVoiceMembers.get(roomId);
  if (!members?.delete(userId)) return false;
  if (members.size === 0) roomVoiceMembers.delete(roomId);
  broadcastVoiceState(io, roomId);
  return true;
}

export const initSockets = (io: Server) => {
  // auth middleware
  io.use(socketAuthMiddleware);

  // connection
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);
    console.log("User ID:", socket.data.userId);

    // join room
    socket.on("join_room", async (payload: JoinRoomPayload) => {
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
      await updateRoomArchiveStatus(roomId);
      const updatedRoom = await getRoomById(roomId);
      if (updatedRoom && isRoomArchived(updatedRoom as any)) {
        console.log("Room is archived");
        socket.emit("join_room_error", {
          error: "Room has been archived",
        });
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
      async (payload: SendStrokePayload) => {
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
      async (payload: SendMessagePayload) => {
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

        const now = new Date();
        await createMessage({
          roomId,
          senderId: userId,
          body: message,
          createdAt: now,
          updatedAt: now,
        });

        io.to(roomId).emit("receive_message", {
          message,
          user: {
            _id: user._id,
            username: user.username,
          },
          timestamp: now.toISOString(),
        } as ReceiveMessageData);
      },
    );

    // voice: join
    socket.on("voice_join", async (payload: VoiceJoinPayload) => {
      const parsed = voiceJoinSchema.safeParse(payload);
      if (!parsed.success) return;
      const { roomId } = parsed.data;
      const userId = socket.data.userId;
      if (!userId) return;

      const user = await getUserById(userId);
      const room = await getRoomById(roomId);
      if (!user || !room || room.isActive === false) return;
      if (!room.members.some((m) => m === userId)) return;

      const members = roomVoiceMembers.get(roomId) ?? new Map<string, VoiceMember>();
      members.set(userId, { userId, username: user.username, muted: false, speaking: false });
      roomVoiceMembers.set(roomId, members);

      // current voice members for the joiner; broadcast updated state to everyone
      socket.emit("voice_state", { roomId, members: getVoiceMembers(roomId) });
      broadcastVoiceState(io, roomId);
    });

    // voice: leave
    socket.on("voice_leave", async (payload: VoiceLeavePayload) => {
      const parsed = voiceLeaveSchema.safeParse(payload);
      if (!parsed.success) return;
      const userId = socket.data.userId;
      if (!userId) return;
      removeFromVoice(io, parsed.data.roomId, userId);
    });

    // voice: mute toggle
    socket.on("voice_mute", async (payload: VoiceMutePayload) => {
      const parsed = voiceMuteSchema.safeParse(payload);
      if (!parsed.success) return;
      const { roomId, muted } = parsed.data;
      const userId = socket.data.userId;
      if (!userId) return;
      const member = roomVoiceMembers.get(roomId)?.get(userId);
      if (!member) return;
      member.muted = muted;
      // muted users cannot be marked as speaking
      if (muted) member.speaking = false;
      broadcastVoiceState(io, roomId);
    });

    // voice: speaking activity (debounced by client)
    socket.on("voice_speaking", async (payload: VoiceSpeakingPayload) => {
      const parsed = voiceSpeakingSchema.safeParse(payload);
      if (!parsed.success) return;
      const { roomId, speaking } = parsed.data;
      const userId = socket.data.userId;
      if (!userId) return;
      const member = roomVoiceMembers.get(roomId)?.get(userId);
      if (!member || member.muted) return;
      if (member.speaking === speaking) return;
      member.speaking = speaking;
      broadcastVoiceState(io, roomId);
    });

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
        // remove from voice channel if present
        removeFromVoice(io, roomId, userId);

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
