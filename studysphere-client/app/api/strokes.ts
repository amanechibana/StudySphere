import { api } from "./client";
import type { Stroke } from "../types/stroke.interface";

export const strokesApi = {
  getStrokes: (roomId: string) => api.get<Stroke[]>(`/strokes/${roomId}`),
};
