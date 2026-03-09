"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { ROOMS } from "./dummyData/dummyRooms";
import useUserStore from "./stores/userStore";

const COURSES = [
  "All",
  "CS 401",
  "MATH 301",
  "BIO 210",
  "PHYS 202",
  "CHEM 110",
];

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

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [expandedCodeRoom, setExpandedCodeRoom] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");

  const { user } = useUserStore();

  const filtered = ROOMS.filter((r) => {
    const matchesCourse = activeFilter === "All" || r.course === activeFilter;
    const matchesSearch =
      search.trim() === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  function handleJoinRoom(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    // validate room code then send it
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-espresso mb-2">
            {greeting}, {user?.username}.
          </h1>
          <p className="text-caramel italic text-lg">
            Find your focus. Your study rooms are waiting.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-8 flex flex-col gap-4">
          {/* Search + actions */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search rooms by name or topic..."
              className="flex-1 bg-surface-card border border-border rounded-lg px-4 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-caramel transition-colors"
            />
            <button
              onClick={() => setShowInviteInput((v) => !v)}
              className="shrink-0 border border-border text-espresso text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-caramel hover:text-caramel transition-colors cursor-pointer"
            >
              Join with code
            </button>
            <Link
              href="#"
              className="shrink-0 bg-espresso text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-espresso-muted transition-colors"
            >
              + Create room
            </Link>
          </div>

          {/* Invite code input — revealed on toggle */}
          {showInviteInput && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // TODO: validate invite code and join room
              }}
              className="flex gap-3 items-center"
            >
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code..."
                className="flex-1 bg-surface-card border border-caramel rounded-lg px-4 py-2.5 text-sm text-espresso placeholder:text-border outline-none focus:border-espresso transition-colors"
                autoFocus
              />
              <button
                type="submit"
                onClick={handleJoinRoom}
                className="shrink-0 bg-caramel text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                Join →
              </button>
            </form>
          )}

          {/* Course chips */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-espresso-muted uppercase mb-2">
              Filter by course
            </p>
            <div className="flex flex-wrap gap-2">
              {COURSES.map((course) => (
                <button
                  key={course}
                  onClick={() => setActiveFilter(course)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                    activeFilter === course
                      ? "bg-espresso text-white border-espresso"
                      : "bg-transparent text-espresso border-border hover:border-espresso-muted"
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Room grid */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-espresso-muted uppercase mb-4">
            Open study rooms
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.length > 0 ? (
              filtered.map((room) => (
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

                  {/* Inline code input for private rooms */}
                  {room.isPrivate && expandedCodeRoom === room._id && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        // TODO: validate roomCode against room.inviteCode on backend and join
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
              ))
            ) : (
              <p className="text-sm text-espresso-muted italic col-span-2 py-6">
                No rooms match your filters.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
