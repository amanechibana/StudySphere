import { api } from "./client";
import { Room } from "../types/room.interface";
import { ChatMessage } from "../types/chatMessage.interface";

export interface CreateRoomBody {
  name: string;
  description: string;
  course: string;
  ownerId: string;
  isPrivate: boolean;
  capacity: number;
}

export interface MessagePage {
  messages: ChatMessage[];
  hasMore: boolean;
}

export const roomApi = {
  getRoom: (id: string) => api.get<Room>(`/rooms/${id}`),
  getRooms: () => api.get<Room[]>("/rooms"),
  createRoom: (body: CreateRoomBody) => api.post<Room>("/rooms", body),
  getMessages: (id: string, before?: string) =>
    api.get<MessagePage>(`/rooms/${id}/messages${before ? `?before=${encodeURIComponent(before)}` : ""}`),
};