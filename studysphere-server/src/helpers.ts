import type { Room } from "./types/room.interface.js";
import type { NewRoom } from "./types/room.interface.js";
import type { WithId } from "mongodb";
import { getRoomById, updateRoom, getRooms } from "./data/rooms.js";

const ARCHIVE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour
const scheduledRoomArchives = new Map<string, ReturnType<typeof setTimeout>>();

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

function cancelRoomArchive(roomId: string): void {
  const timeout = scheduledRoomArchives.get(roomId);
  if (!timeout) {
    return;
  }
  clearTimeout(timeout);
  scheduledRoomArchives.delete(roomId);
}

async function archiveRoomIfStillInactive(
  roomId: string,
): Promise<WithId<NewRoom> | null> {
  try {
    const room = await getRoomById(roomId);
    if (!room) {
      cancelRoomArchive(roomId);
      return null;
    }

    if (room.members.length > 0 || room.isArchived) {
      cancelRoomArchive(roomId);
      return room;
    }

    if (!isRoomArchived(room)) {
      return room;
    }

    const updated = await updateRoom(roomId, { isArchived: true });
    cancelRoomArchive(roomId);
    console.log(`Archived inactive room: ${room.name} (${room._id})`);
    return updated;
  } catch (error) {
    console.error(`Error archiving room ${roomId}:`, error);
    return null;
  }
}

function scheduleRoomArchive(roomId: string, lastUserLeftAt?: Date): void {
  cancelRoomArchive(roomId);

  if (!lastUserLeftAt) {
    return;
  }

  const delay = Math.max(ARCHIVE_THRESHOLD_MS - (Date.now() - lastUserLeftAt.getTime()), 0);

  const timeout = setTimeout(() => {
    void archiveRoomIfStillInactive(roomId);
  }, delay);
  timeout.unref?.();
  console.log(`Scheduled archive for room ${roomId} in ${Math.round(delay / 1000)} seconds`);
  scheduledRoomArchives.set(roomId, timeout);
}

/**
 * Updates room archive status if it should be archived
 * If the room meets archiving criteria, sets isArchived to true
 * Returns the updated room or null if update failed
 */
async function updateRoomArchiveStatus(roomId: string): Promise<WithId<NewRoom> | null> {
  return archiveRoomIfStillInactive(roomId);
}

/**
 * Schedules archive callbacks for currently empty rooms when the server starts.
 * This is a one-time bootstrap, not a polling loop.
 */
async function initializeRoomArchiveCallbacks(): Promise<void> {
  try {
    const allRooms = await getRooms();

    for (const room of allRooms) {
      if (room.members.length === 0 && !room.isArchived) {
        scheduleRoomArchive(room._id.toString(), room.lastUserLeftAt);
      }
    }
  } catch (error) {
    console.error("Error initializing room archive callbacks:", error);
  }
}

export {
  isRoomArchived,
  scheduleRoomArchive,
  cancelRoomArchive,
  archiveRoomIfStillInactive,
  updateRoomArchiveStatus,
  initializeRoomArchiveCallbacks,
};