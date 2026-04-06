import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Socket only connects when user needs to join a room and disconnects when they leave
export function getSocket() {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
        autoConnect: false,
    });
  }
  return socket;
}
