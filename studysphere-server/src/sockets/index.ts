import { Server, Socket } from "socket.io";
import type {
  SendMessageData,
  ReceiveMessageData,
} from "../types/socket.interface.js";
import { getRoomById } from "../data/rooms.js";
import { getUserById } from "../data/users.js";

export const initSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // join room
    const socketToRoom = new Map<string, string>();
    socket.on("join_room", (roomId: string, userId: string) => {
      // ensures user is signed in and room exists
      const user = getUserById(userId);
      const room = getRoomById(roomId);
      if (!user || !room) {
        console.log("Invalid user or room");
        return;
      }

      // ensures that the user is not already in the room
      const currentRoom = socketToRoom.get(socket.id);
      if (currentRoom) {
        socket.leave(currentRoom);
        console.log(`User ${socket.id} left ${currentRoom}`);
        // remove user from room in database
      }

      // join room and update mapping
      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);

      // add user to room in database

      console.log(`User ${socket.id} joined ${roomId}`);
    });

    // send message
    socket.on("send_message", (data: SendMessageData, userId: string) => {
      const { roomId, message, user } = data;

      // ensure user is signed in
      const userData = getUserById(userId);
      if (!userData) {
        console.log("Invalid user");
        return;
      }

      io.to(roomId).emit("receive_message", {
        message,
        user,
        timestamp: new Date(),
      } as ReceiveMessageData);
    });

    // disconnect
    socket.on("disconnect", (userId: string) => {
      // ensure user is signed in
      const user = getUserById(userId);
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
        // remove user from room in database
      }
      console.log("User disconnected:", socket.id);
    });
  });
};
