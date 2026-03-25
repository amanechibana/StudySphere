export function validateRoomInput(body: any) {
  const requiredFields = ["name", "description", "course", "ownerId"];

  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== "string") {
      return `Invalid or missing field: ${field}`;
    }
  }

  if (body.capacity !== undefined) {
    if (typeof body.capacity !== "number" || body.capacity <= 0) {
      return "Capacity must be a positive number";
    }
  }

  if (body.members !== undefined) {
    if (!Array.isArray(body.members)) {
      return "Members must be an array";
    }
  }

  return null;
}

export function validateId(id: string) {
  if (!id || typeof id !== "string") {
    return "Invalid room ID";
  }
  return null;
}
