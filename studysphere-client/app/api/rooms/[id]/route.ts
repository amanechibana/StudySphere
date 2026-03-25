import { NextResponse } from "next/server";
import { Room } from "../../../types/room.interface";
import { validateId } from "../../../lib/helper";

// for now
let rooms: Room[] = [];

// GET /api/rooms/:id
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const idError = validateId(params.id);
    if (idError) {
      return NextResponse.json({ error: idError }, { status: 400 });
    }

    const room = rooms.find((r) => r._id === params.id);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 },
    );
  }
}

// PUT /api/rooms/:id
export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const idError = validateId(params.id);
    if (idError) {
      return NextResponse.json({ error: idError }, { status: 400 });
    }

    const body = await req.json();

    const index = rooms.findIndex((r) => r._id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const existing = rooms[index];

    // Prevent updating protected fields
    const protectedFields = ["_id", "ownerId", "createdAt"];
    for (const field of protectedFields) {
      if (field in body) {
        return NextResponse.json(
          { error: `Cannot update field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Capacity validation
    if (body.capacity !== undefined) {
      if (
        typeof body.capacity !== "number" ||
        body.capacity < existing.members.length
      ) {
        return NextResponse.json(
          { error: "Capacity cannot be less than current members count" },
          { status: 400 },
        );
      }
    }

    // Members validation
    if (body.members !== undefined) {
      if (!Array.isArray(body.members)) {
        return NextResponse.json(
          { error: "Members must be an array" },
          { status: 400 },
        );
      }

      if (body.members.length > (body.capacity ?? existing.capacity)) {
        return NextResponse.json(
          { error: "Members exceed capacity" },
          { status: 400 },
        );
      }
    }

    const updatedRoom = {
      ...existing,
      ...body,
    };

    rooms[index] = updatedRoom;

    return NextResponse.json(updatedRoom, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON or failed update" },
      { status: 500 },
    );
  }
}

// DELETE /api/rooms/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const idError = validateId(params.id);
    if (idError) {
      return NextResponse.json({ error: idError }, { status: 400 });
    }

    const index = rooms.findIndex((r) => r._id === params.id);

    if (index === -1) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const deletedRoom = rooms[index];

    rooms.splice(index, 1);

    return NextResponse.json(
      { message: "Room deleted", room: deletedRoom },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 },
    );
  }
}
