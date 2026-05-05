import { api } from "./client";
import { type Stroke } from "../hooks/useCanvasDrawing";

export const strokesApi = {
  getStrokes: (roomId: string) => api.get<Stroke[]>(`/strokes/${roomId}`),
};
