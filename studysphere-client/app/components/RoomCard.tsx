import Link from "next/link";
import { Room } from "../types/room.interface";
import { useState } from "react";

export default function RoomCard({ room, handleJoinRoom }: {
    room: Room,
    handleJoinRoom: (roomId: string, inviteCode?: string) => void
}) {
    const [expandedCodeRoom, setExpandedCodeRoom] = useState<string | null>(null);
    const [roomCode, setRoomCode] = useState("");

    return (
        <div
            key={room._id}
            className="bg-surface-card border border-border rounded-xl p-5 flex flex-col gap-3"
        >
            <div className="flex items-start justify-between">
                <h3 className="font-semibold text-espresso text-lg leading-tight">
                    {room.name}
                </h3>
                <span
                    className={`text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full border ${
                    room.isPrivate
                        ? "text-caramel border-caramel/40 bg-caramel/10"
                        : "text-emerald-700 border-emerald-400/40 bg-emerald-50"
                    }`}
                >
                    {room.isPrivate ? "PRIVATE" : "PUBLIC"}
                </span>
            </div>

            <div>
                <p className="text-sm font-medium text-caramel">
                    {room.course}
                </p>
                <p className="text-sm text-espresso-muted italic">
                    &ldquo;{room.description}&rdquo;
                </p>
            </div>

            <div className="flex items-center justify-between mt-1">
            <CapacityDots
                numberOfMembers={room.members.length}
                capacity={room.capacity}
            />
                {room.isPrivate ? (
                    <button
                        onClick={() =>
                            setExpandedCodeRoom(
                                expandedCodeRoom === room._id ? null : room._id,
                            )
                        }
                        className="text-caramel border border-caramel/40 bg-caramel/10 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-caramel/20 transition-colors cursor-pointer"
                    >
                        Enter code
                    </button>
                ) : (
                    <Link
                        href={`/room/${room._id}`}
                        className="bg-espresso text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-espresso-muted transition-colors"
                    >
                        Join →
                    </Link>
                )}
            </div>

            {/* code input for private room */}
            {room.isPrivate && expandedCodeRoom === room._id && (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleJoinRoom(room, roomCode);
                }}
                className="flex gap-2 mt-1"
            >
                <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Invite code..."
                    className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
                    autoFocus
                />
                <button
                    type="submit"
                    onClick={handleJoinRoom}
                    className="bg-caramel text-white text-sm font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                >
                    Join →
                </button>
            </form>
            )}
        </div>
    )
} 

function CapacityDots({
    numberOfMembers,
    capacity,
}: {
    numberOfMembers: number;
    capacity: number;
}) {
    return (
        <div className="flex items-center gap-1.5">
        <div className="flex gap-0.5">
            {Array.from({ length: capacity }).map((_, i) => (
                <span
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                    i < numberOfMembers ? "bg-caramel" : "bg-border"
                    }`}
                />
            ))}
        </div>
            <span className="text-xs text-espresso-muted">
                {numberOfMembers}/{capacity}
            </span>
        </div>
    );
}