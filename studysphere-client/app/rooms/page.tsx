"use client";

import { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import useUserStore from "../stores/userStore";
import RoomCard from "../components/RoomCard";
import CreateRoomModal from "../components/CreateRoomModal";
import { useRooms } from "../hooks/useRoom";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function RoomsPage() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isCourseFilterOpen, setIsCourseFilterOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [courseFilterSearch, setCourseFilterSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { user } = useUserStore();
  const { data: rooms = [] } = useRooms();
  const router = useRouter();

  const courseOptions = useMemo(
    () =>
      Array.from(
        new Set(
          rooms
            .filter((room) => !room.isArchived)
            .map((room) => room.course.trim())
            .filter(Boolean),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [rooms],
  );

  const filteredCourseOptions = useMemo(
    () =>
      courseOptions.filter((course) =>
        course.toLowerCase().includes(courseFilterSearch.toLowerCase()),
      ),
    [courseOptions, courseFilterSearch],
  );

  const activeCourses = selectedCourses.filter((course) =>
    courseOptions.includes(course),
  );
  const courseFilterLabel =
    activeCourses.length === 0
      ? "All courses"
      : activeCourses.length === 1
        ? activeCourses[0]
        : `${activeCourses.length} courses selected`;

  const filtered = rooms.filter((r) => {
    const matchesCourse =
      activeCourses.length === 0 || activeCourses.includes(r.course);
    const matchesSearch =
      search.trim() === "" ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const isNotArchived = !r.isArchived;
    return matchesCourse && matchesSearch && isNotArchived;
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  function handleJoinRoom(
    room: { _id: string; isPrivate: boolean },
    inviteCode?: string,
  ) {
    if (room.isPrivate && inviteCode) {
      router.push(
        `/room/${room._id}?inviteCode=${encodeURIComponent(inviteCode)}`,
      );
    } else if (!room.isPrivate) {
      router.push(`/room/${room._id}`);
    }
  }

  function toggleCourse(course: string) {
    setSelectedCourses((current) =>
      current.includes(course)
        ? current.filter((selected) => selected !== course)
        : [...current, course],
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showCreateModal && (
        <CreateRoomModal onClose={() => setShowCreateModal(false)} />
      )}
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-espresso mb-2">
            {greeting}, {user?.username}.
          </h1>
          <p className="text-caramel italic text-lg">
            Find your focus. Your study rooms are waiting.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-4">
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

          <div className="relative max-w-xs">
            <label
              htmlFor="course-filter"
              className="block text-xs font-semibold tracking-widest text-espresso-muted uppercase mb-2"
            >
              Filter by course
            </label>
            <div className="flex w-full items-center justify-between gap-2 bg-surface-card border border-border rounded-lg px-4 py-2.5 text-left text-sm font-medium text-espresso outline-none focus:border-caramel transition-colors flex-wrap">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                {activeCourses.length > 0 &&
                  activeCourses.map((course) => (
                    <div
                      key={course}
                      className="flex items-center gap-1.5 bg-espresso text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                    >
                      <span>{course}</span>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCourse(course);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            toggleCourse(course);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className="hover:opacity-70 transition-opacity flex items-center justify-center cursor-pointer"
                        aria-label={`Remove ${course}`}
                      >
                        ✕
                      </div>
                    </div>
                  ))}
                <input
                  type="text"
                  value={courseFilterSearch}
                  onChange={(e) => setCourseFilterSearch(e.target.value)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCourseFilterOpen(true);
                  }}
                  placeholder="Search..."
                  className="bg-transparent border-0 px-2 py-1 text-xs text-espresso placeholder:text-espresso-muted outline-none"
                />
              </div>
              <button
                id="course-filter"
                onClick={() => {
                  setIsCourseFilterOpen((open) => !open);
                  if (isCourseFilterOpen) {
                    setCourseFilterSearch("");
                  }
                }}
                className="shrink-0 text-espresso-muted hover:text-espresso transition-colors cursor-pointer"
              >
                {isCourseFilterOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {isCourseFilterOpen && (
              <div
                className="absolute z-10 mt-2 flex w-full flex-col overflow-hidden rounded-lg border border-border bg-surface-card p-2 shadow-lg"
                style={{ maxHeight: "min(24rem, calc(100vh - 16rem))" }}
              >
                <button
                  onClick={() => {
                    setSelectedCourses([]);
                    setCourseFilterSearch("");
                  }}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors cursor-pointer ${
                    activeCourses.length === 0
                      ? "bg-espresso text-white"
                      : "text-espresso hover:bg-background"
                  }`}
                >
                  All courses
                </button>
                <div className="my-2 border-t border-border" />
                <div className="min-h-0 overflow-y-auto">
                  {filteredCourseOptions.length > 0 ? (
                    filteredCourseOptions.map((course) => {
                      const isSelected = activeCourses.includes(course);

                      return (
                        <label
                          key={course}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-espresso hover:bg-background cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleCourse(course)}
                            className="h-4 w-4 accent-espresso"
                          />
                          <span className="truncate">{course}</span>
                        </label>
                      );
                    })
                  ) : (
                    <p className="px-3 py-2 text-sm italic text-espresso-muted">
                      No courses found.
                    </p>
                  )}
                </div>
              </div>
            )}
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
                  handleJoinRoom={handleJoinRoom}
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
