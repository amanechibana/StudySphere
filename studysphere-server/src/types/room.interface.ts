export type RoomId = string;

export interface Room {
  _id: RoomId;
  name: string;
  description: string;
  course: string;
  ownerId: string;
  inviteCode: string | null;
  isPrivate: boolean;
  capacity: number;

  // canvasId: canvas

  members: string[];
  createdAt: Date;
}

// room fields for insert — MongoDB assigns `_id`
export type NewRoom = Omit<Room, "_id">;
