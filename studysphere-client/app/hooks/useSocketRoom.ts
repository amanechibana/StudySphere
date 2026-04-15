import { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import useSocketStore from "../stores/socketStore";

export function useSocketRoom(roomId: string, inviteCode?: string | null) {
  const { user: firebaseUser } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then((token) => connect(token, roomId, inviteCode));
    return () => disconnect();
  }, [roomId, inviteCode, firebaseUser, connect, disconnect]);
}