import { create } from "zustand";
import { Socket } from "socket.io-client";
import { initSocket, disconnectSocket } from "../socket/socket";
import { joinRoomSchema } from "../validation/socketSchema";

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
    const payload = { roomId, inviteCode: inviteCode || null };
    if (joinRoomSchema.safeParse(payload).success) {
      s.emit("join_room", payload);
    }
    set({ socket: s });
  },
  disconnect: () => {
    disconnectSocket();
    set({ socket: null });
  },
}));

export default useSocketStore;
