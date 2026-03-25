import { NextResponse } from "next/server";
import { Room } from "../../../types/room.interface";

// for now
let rooms: Room[] = [];

// GET /api/rooms/:id
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const room = rooms.find((r) => r._id === params.id);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  return NextResponse.json(room);
}

// PUT /api/rooms/:id → update
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const index = rooms.findIndex((r) => r._id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    rooms[index] = {
      ...rooms[index],
      ...body,
    };

    return NextResponse.json(rooms[index]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 },
    );
  }
}

// DELETE /api/rooms/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const index = rooms.findIndex((r) => r._id === params.id);

  if (index === -1) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const deleted = rooms.splice(index, 1);

  return NextResponse.json(deleted[0]);
}
