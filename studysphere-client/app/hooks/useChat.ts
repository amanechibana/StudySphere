import { useEffect, useState } from "react";
import { ChatMessage } from "../types/chatMessage.interface";
import useSocketStore from "../stores/socketStore";

export function useChat(roomId: string) {
  const socket = useSocketStore((s) => s.socket);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    function handleMessage(data: ChatMessage) {
      setMessages((prev) => [...prev, data]);
    }

    socket.on("receive_message", handleMessage);
    return () => { socket.off("receive_message", handleMessage); };
  }, [socket, roomId]);

  const sendMessage = (message: string) =>
    socket?.emit("send_message", { roomId, message });

  return { messages, sendMessage };
}
