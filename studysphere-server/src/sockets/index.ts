import { Server, Socket } from "socket.io";
import type {
  SendMessageData,
  ReceiveMessageData,
} from "../types/socket.interface.js";

export const initSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // join room
    const socketToRoom = new Map<string, string>();
    socket.on("join_room", (roomId: string) => {
      // ensures that the user is not already in the room
      const currentRoom = socketToRoom.get(socket.id);
      if (currentRoom) {
        socket.leave(currentRoom);
        console.log(`User ${socket.id} left ${currentRoom}`);
      }

      socket.join(roomId);
      socketToRoom.set(socket.id, roomId);

      console.log(`User ${socket.id} joined ${roomId}`);
    });

    // send message
    socket.on("send_message", (data: SendMessageData) => {
      const { roomId, message, user } = data;

      io.to(roomId).emit("receive_message", {
        message,
        user,
        timestamp: new Date(),
      } as ReceiveMessageData);
    });

    // disconnect
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
