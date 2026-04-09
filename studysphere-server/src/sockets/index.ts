import { Server, Socket } from "socket.io";
import type {
  SendMessageData,
  ReceiveMessageData,
} from "../types/socket.interface.js";

export const initSockets = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id);

    // join room
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
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
