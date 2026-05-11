import type { Room } from "./types/room.interface.js";
import type { NewRoom } from "./types/room.interface.js";
import type { WithId } from "mongodb";
import { updateRoom, getRooms } from "./data/rooms.js";

const ARCHIVE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

/**
 * Checks if a room should be archived based on inactivity
 * A room is archived if:
 * 1. It has the isArchived flag set to true, OR
 * 2. It has no users (members array is empty) and more than 1 hour has passed since lastUserLeftAt
 */
function isRoomArchived(room: WithId<NewRoom> | Room): boolean {
  if (room.isArchived) {
    return true;
  }
  if (!room.lastUserLeftAt) {
    return false;
  }
  const timeSinceLastUserLeft = Date.now() - room.lastUserLeftAt.getTime();
  return timeSinceLastUserLeft > ARCHIVE_THRESHOLD_MS;
}

/**
 * Updates room archive status if it should be archived
 * If the room meets archiving criteria, sets isArchived to true
 * Returns the updated room or null if update failed
 */
async function updateRoomArchiveStatus(roomId: string): Promise<WithId<NewRoom> | null> {
  const { getRoomById } = await import("./data/rooms.js");
  const room = await getRoomById(roomId);
  if (!room) {
    return null;
  }
  if (isRoomArchived(room)) {
    if (!room.isArchived) {
      const updated = await updateRoom(roomId, { isArchived: true });
      return updated;
    }
    return room;
  }
  return room;
}

/**
 * Background job to archive inactive rooms
 * Runs periodically to check all rooms and archive those that have been empty for 1+ hour
 */
async function archiveInactiveRooms(): Promise<void> {
  try {
    const allRooms = await getRooms();
    
    for (const room of allRooms) {
      if (isRoomArchived(room as any) && !room.isArchived) {
        await updateRoom(room._id.toString(), { isArchived: true });
        console.log(`Archived inactive room: ${room.name} (${room._id})`);
      }
    }
  } catch (error) {
    console.error("Error archiving inactive rooms:", error);
  }
}

const exportedMethods: Record<string, unknown> = {
  isRoomArchived,
  updateRoomArchiveStatus,
  archiveInactiveRooms,
};

export { isRoomArchived, updateRoomArchiveStatus, archiveInactiveRooms };
export default exportedMethods;
