import { useEffect, useState } from "react";
import useAuthStore from "../stores/authStore";
import useSocketStore from "../stores/socketStore";

export function useSocketRoom(roomId: string, inviteCode?: string | null) {
  const { user: firebaseUser } = useAuthStore();
  const { connect, disconnect, socket } = useSocketStore();
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then((token) => connect(token, roomId, inviteCode));
    return () => disconnect();
  }, [roomId, inviteCode, firebaseUser, connect, disconnect]);

  useEffect(() => {
    if (!socket) return;

    function handleJoinError(data: { error: string }) {
      console.error("Failed to join room:", data.error);
      setJoinError(data.error);
    }

    socket.on("join_room_error", handleJoinError);
    return () => {
      socket.off("join_room_error", handleJoinError);
    };
  }, [socket]);

  return { joinError };
}