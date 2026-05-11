import { useCallback, useEffect, useRef, useState } from "react";
import { ChatMessage } from "../types/chatMessage.interface";
import useSocketStore from "../stores/socketStore";
import { roomApi } from "../api/room";

export function useChat(roomId: string) {
  const socket = useSocketStore((s) => s.socket);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // ref to oldest message timestamp
  const cursorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    roomApi.getMessages(roomId).then(({ messages: page, hasMore: more }) => {
      // server returns newest-first; reverse so oldest is at top
      const ordered = [...page].reverse();
      setMessages(ordered);
      setHasMore(more);
      if (ordered.length > 0) cursorRef.current = ordered[0].timestamp;
    });
  }, [roomId]);

 
  useEffect(() => {
    if (!socket) return;
    function handleMessage(data: ChatMessage) {
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (m) => m.timestamp === data.timestamp && m.user._id === data.user._id,
        );
        return isDuplicate ? prev : [...prev, data];
      });
    }
    socket.on("receive_message", handleMessage);
    return () => { socket.off("receive_message", handleMessage); };
  }, [socket, roomId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const { messages: page, hasMore: more } = await roomApi.getMessages(roomId, cursorRef.current);
      const ordered = [...page].reverse();
      setMessages((prev) => [...ordered, ...prev]);
      setHasMore(more);
      if (ordered.length > 0) cursorRef.current = ordered[0].timestamp;
    } finally {
      setLoadingMore(false);
    }
  }, [roomId, hasMore, loadingMore]);

  const sendMessage = (message: string) =>
    socket?.emit("send_message", { roomId, message });

  return { messages, sendMessage, hasMore, loadMore, loadingMore };
}
