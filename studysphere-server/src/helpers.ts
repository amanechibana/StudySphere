import type { Room } from "./types/room.interface.js";
import type { NewRoom } from "./types/room.interface.js";
import type { WithId } from "mongodb";
import { getRoomById, updateRoom, getRooms } from "./data/rooms.js";
import { getAllMessagesByRoomId } from "./data/messages.js";
import { summarizeConversation } from "./services/aiSummarizer.js";
import type { AIMessage } from "./types/ai.interface.js";

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
    if (updated) {
      getAllMessagesByRoomId(roomId)
        .then(async (roomMessages) => {
          if (roomMessages.length === 0) return;
          const uniqueSenderIds = [...new Set(roomMessages.map((m) => m.senderId))];
          const { getUserById } = await import("./data/users.js");
          const userDocs = await Promise.all(uniqueSenderIds.map((id) => getUserById(id)));
          const userMap = new Map(userDocs.filter(Boolean).map((u) => [u!._id, u!.username]));
          const aiMessages: AIMessage[] = roomMessages.map((m) => ({
            role: "user" as const,
            content: `${userMap.get(m.senderId) ?? "Unknown"}: ${m.body}`,
          }));
          const summary = await summarizeConversation(aiMessages);
          await updateRoom(roomId, { summary });
        })
        .catch((e) => console.error("Failed to generate room summary:", e));
    }
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
  initializeRoomArchiveCallbacks
};