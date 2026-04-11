"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { ROOMS } from "./dummyData/dummyRooms";
import useUserStore from "./stores/userStore";
import RoomCard from "./components/RoomCard";
import { Room } from "./types/room.interface";

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

  async function handleJoinRoom(room: Room, inviteCode?: string | null) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/join/${room._id}`, {
      method: "POST",
      body: JSON.stringify({ inviteCode }),
    });
    if (!response.ok) {
      alert("Failed to join room");
      return;
    }
    const data = await response.json();
    console.log(data);
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
            <Link
              href="#"
              className="shrink-0 bg-espresso text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-espresso-muted transition-colors"
            >
              + Create room
            </Link>
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
                  handleJoinRoom={() => handleJoinRoom(room)}
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
