import type { Stroke } from "./stroke.interface";

export interface Room {
  _id: string;
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
  pastMembersDetails?: { _id: string; username: string }[];
}
