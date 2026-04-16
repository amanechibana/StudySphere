import { api } from "./client";
import { Room } from "../types/room.interface";

export interface CreateRoomBody {
  name: string;
  description: string;
  course: string;
  ownerId: string;
  isPrivate: boolean;
  capacity: number;
}

export const roomApi = {
  getRoom: (id: string) => api.get<Room>(`/rooms/${id}`),
  getRooms: () => api.get<Room[]>("/rooms"),
  createRoom: (body: CreateRoomBody) => api.post<Room>("/rooms", body),
};