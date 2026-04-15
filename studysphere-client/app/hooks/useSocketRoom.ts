import { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import useSocketStore from "../stores/socketStore";

export function useSocketRoom(roomId: string) {
  const { user: firebaseUser } = useAuthStore();
  const { connect, disconnect } = useSocketStore();

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then((token) => connect(token, roomId));
    return () => disconnect();
  }, [roomId, firebaseUser, connect, disconnect]);
}