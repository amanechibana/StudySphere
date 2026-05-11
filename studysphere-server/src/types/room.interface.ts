import type { Stroke } from "./stroke.interface.js";

export type RoomId = string;

export interface Room {
  _id: RoomId;
  name: string;
  description: string;
  course: string;
  ownerId: string;
  inviteCode: string | null;
  isPrivate: boolean;
  isActive: boolean;
  capacity: number;
  strokes: Stroke[];

  // canvasId: canvas

  members: string[];
  pastMembers: string[];
  createdAt: Date;
  lastUserLeftAt?: Date;
  isArchived: boolean;
  summary?: string;
}

// room fields for insert — MongoDB assigns `_id`
export type NewRoom = Omit<Room, "_id">;
