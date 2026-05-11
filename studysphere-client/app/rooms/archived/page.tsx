"use client";

import Link from "next/link";
import Navbar from "../../components/Navbar";
import { useArchivedRooms } from "../../hooks/useRoom";

export default function ArchivedRoomsPage() {
  const { data: archivedRooms = [], isLoading } = useArchivedRooms();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-espresso mb-2">
            Archived sessions
          </h1>
          <p className="text-caramel italic text-lg">
            Past study rooms and their AI-generated summaries.
          </p>
        </div>

        {isLoading && (
          <p className="text-sm text-espresso-muted italic">Loading...</p>
        )}

        {!isLoading && archivedRooms.length === 0 && (
          <p className="text-sm text-espresso-muted italic py-6">
            No archived sessions yet.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {archivedRooms.map((room) => (
            <div
              key={room._id}
              className="bg-surface-card border border-border rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-espresso text-lg leading-tight">
                  {room.name}
                </h3>
                <span className="text-xs font-semibold tracking-wide px-2.5 py-1 rounded-full border text-espresso-muted border-border bg-background">
                  ARCHIVED
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-caramel">{room.course}</p>
                <p className="text-sm text-espresso-muted italic">
                  &ldquo;{room.description}&rdquo;
                </p>
              </div>
              {room.summary && (
                <p className="text-xs text-espresso-muted line-clamp-2">
                  {room.summary}
                </p>
              )}
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-espresso-muted">
                  {new Date(room.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Link
                  href={`/room/${room._id}/summary`}
                  className="text-caramel border border-caramel/40 bg-caramel/10 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-caramel/20 transition-colors"
                >
                  View summary →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
