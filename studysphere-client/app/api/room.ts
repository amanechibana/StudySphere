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

export interface ArchivedMessage {
  message: string;
  user: { _id: string; username: string };
  timestamp: string;
}

export const roomApi = {
  getRoom: (id: string) => api.get<Room>(`/rooms/${id}`),
  getRooms: () => api.get<Room[]>("/rooms"),
  getArchivedRooms: () => api.get<Room[]>("/rooms/archived"),
  getArchivedRoom: (id: string) => api.get<Room>(`/rooms/archived/${id}`),
  getArchivedRoomMessages: (id: string) => api.get<ArchivedMessage[]>(`/rooms/archived/${id}/messages`),
  createRoom: (body: CreateRoomBody) => api.post<Room>("/rooms", body),
  getMessages: (id: string, before?: string) =>
    api.get<MessagePage>(`/rooms/${id}/messages${before ? `?before=${encodeURIComponent(before)}` : ""}`),
};