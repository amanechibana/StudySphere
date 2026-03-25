import { NextResponse } from "next/server";
import { Room } from "../../types/room.interface";

// for now
let rooms: Room[] = [];

// GET /api/rooms
export async function GET() {
  return NextResponse.json(rooms);
}

// POST /api/rooms
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const newRoom: Room = {
      _id: Date.now().toString(),
      name: body.name,
      description: body.description,
      course: body.course,
      ownerId: body.ownerId,
      inviteCode: body.inviteCode || Math.random().toString(36).substring(2, 8),
      isPrivate: body.isPrivate ?? false,
      capacity: body.capacity ?? 6,
      members: body.members ?? [],
      createdAt: new Date(),
    };

    rooms.push(newRoom);

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 },
    );
  }
}
