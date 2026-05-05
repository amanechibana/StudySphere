import { type Dispatch, type SetStateAction, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Stroke } from "./useCanvasDrawing";
import useSocketStore from "../stores/socketStore";
import { strokesApi } from "../api/strokes";

type ReceiveStrokePayload = {
  stroke: Stroke;
  user: { _id: string; username: string };
};

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

    socket.on("receive_stroke", handleReceiveStroke);
    return () => { socket.off("receive_stroke", handleReceiveStroke); };
  }, [socket, userId, setStrokes]);

  function sendStroke(stroke: Stroke) {
    socket?.emit("send_stroke", {
      roomId,
      stroke: { ...stroke, timestamp: new Date().toISOString() },
    });
  }

  return { sendStroke };
}
