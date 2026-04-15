"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import useUserStore from "./stores/userStore";
import RoomCard from "./components/RoomCard";
import CreateRoomModal from "./components/CreateRoomModal";
import { useRooms } from "./hooks/useRoom";
import { useRouter } from "next/navigation";

const COURSES = [
  "All",
  "CS 401",
  "MATH 301",
  "BIO 210",
  "PHYS 202",
  "CHEM 110",
];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user } = useUserStore();
  const { data: rooms = [] } = useRooms();
  const router = useRouter();

  const filtered = rooms.filter((r) => {
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

  function handleJoinRoom(roomId: string) {
    router.push(`/room/${roomId}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {showCreateModal && <CreateRoomModal onClose={() => setShowCreateModal(false)} />}
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
              onClick={() => setShowCreateModal(true)}
              className="shrink-0 bg-espresso text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-espresso-muted transition-colors cursor-pointer"
            >
              + Create room
            </button>
          </div>

          {/* filter chips */}
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

        <div>
          <p className="text-xs font-semibold tracking-widest text-espresso-muted uppercase mb-4">
            Open study rooms
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.length > 0 ? (
              filtered.map((room) => (
                <RoomCard 
                  key={room._id}
                  room={room}
                  handleJoinRoom={() => handleJoinRoom(room._id)}
                />
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
