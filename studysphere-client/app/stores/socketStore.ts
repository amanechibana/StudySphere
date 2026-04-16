import { create } from "zustand";
import { Socket } from "socket.io-client";
import { initSocket, disconnectSocket } from "../socket/socket";

interface SocketStore {
  socket: Socket | null;
  connect: (token: string, roomId: string, inviteCode?: string | null) => void;
  disconnect: () => void;
}

const useSocketStore = create<SocketStore>((set) => ({
  socket: null,
  connect: (token, roomId, inviteCode) => {
    const s = initSocket();
    s.auth = { token };
    s.connect();
    s.emit("join_room", { roomId, inviteCode: inviteCode || null });
    set({ socket: s });
  },
  disconnect: () => {
    disconnectSocket();
    set({ socket: null });
  },
}));

export default useSocketStore;
