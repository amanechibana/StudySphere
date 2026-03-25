import { NextResponse } from "next/server";
import { Room } from "../../types/room.interface";
import { validateRoomInput } from "../../lib/helper";

// for now
let rooms: Room[] = [];

// GET /api/rooms
export async function GET() {
  try {
    return NextResponse.json(rooms, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 },
    );
  }
}

// POST /api/rooms
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate body
    const validationError = validateRoomInput(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Prevent duplicate invite codes
    let inviteCode =
      body.inviteCode ||
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const existingCode = rooms.find((r) => r.inviteCode === inviteCode);
    if (existingCode) {
      return NextResponse.json(
        { error: "Invite code already exists" },
        { status: 409 },
      );
    }

    const capacity = body.capacity ?? 6;
    const members = body.members ?? [];

    // Capacity check
    if (members.length > capacity) {
      return NextResponse.json(
        { error: "Members exceed room capacity" },
        { status: 400 },
      );
    }

    // Ensure owner is included
    if (!members.includes(body.ownerId)) {
      members.push(body.ownerId);
    }

    const newRoom: Room = {
      _id: Date.now().toString(),
      name: body.name.trim(),
      description: body.description.trim(),
      course: body.course.trim(),
      ownerId: body.ownerId,
      inviteCode,
      isPrivate: body.isPrivate ?? false,
      capacity,
      members,
      createdAt: new Date(),
    };

    rooms.push(newRoom);

    return NextResponse.json(newRoom, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid JSON or server error" },
      { status: 500 },
    );
  }
}
