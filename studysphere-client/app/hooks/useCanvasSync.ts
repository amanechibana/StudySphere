import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Stroke, ReceiveStrokePayload } from "../types/stroke.interface";
import useSocketStore from "../stores/socketStore";
import { strokesApi } from "../api/strokes";

export function useCanvasSync(
  roomId: string,
  userId: string | undefined,
  setStrokes: Dispatch<SetStateAction<Stroke[]>>
) {
  const socket = useSocketStore((s) => s.socket);

  const { data } = useQuery({
    queryKey: ["strokes", roomId],
    queryFn: () => strokesApi.getStrokes(roomId),
  });

  useEffect(() => {
    if (data) setStrokes(data);
  }, [data, setStrokes]);

  useEffect(() => {
    if (!socket) return;

    function handleReceiveStroke({ stroke, user }: ReceiveStrokePayload) {
      if (user._id === userId) return;
      setStrokes((prev) => [...prev, stroke]);
    }

    function handleUndoStroke({ user }: ReceiveStrokePayload) {
      if (user._id === userId) return;
      setStrokes((prev) => {
        const idx = [...prev].reverse().findIndex((s) => s.userId === user._id);
        if (idx === -1) return prev;
        const target = prev.length - 1 - idx;
        return prev.filter((_, i) => i !== target);
      });
    }

    socket.on("receive_stroke", handleReceiveStroke);
    socket.on("undo_stroke", handleUndoStroke);
    return () => {
      socket.off("receive_stroke", handleReceiveStroke);
      socket.off("undo_stroke", handleUndoStroke);
    };
  }, [socket, userId, setStrokes]);

  function sendStroke(stroke: Stroke) {
    socket?.emit("send_stroke", { roomId, stroke });
  }

  function sendUndo() {
    socket?.emit("undo_stroke");
  }

  return { sendStroke, sendUndo };
}
