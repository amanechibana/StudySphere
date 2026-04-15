"use client";

import { use, useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import useUserStore from "../../stores/userStore";
import { useRouter } from "next/navigation";
import { useChat } from "../../hooks/useChat";
import { useSocketRoom } from "../../hooks/useSocketRoom";
import { useRoom } from "../../hooks/useRoom";
import RoomChat from "./RoomChat";
import useSocketStore from "../../stores/socketStore";

const MEMBER_COLORS = [
  "bg-amber-800/20 border-amber-800/30 text-amber-900",
  "bg-emerald-800/20 border-emerald-800/30 text-emerald-900",
  "bg-rose-800/20 border-rose-800/30 text-rose-900",
  "bg-indigo-800/20 border-indigo-800/30 text-indigo-900",
  "bg-orange-800/20 border-orange-800/30 text-orange-900",
  "bg-teal-800/20 border-teal-800/30 text-teal-900",
];

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useUserStore();
  const router = useRouter();
  const { data: room, isLoading } = useRoom(id);

  const [elapsed, setElapsed] = useState(0);

  useSocketRoom(id);
  const { messages, sendMessage } = useChat(id);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((v) => v.toString().padStart(2, "0"));
  }

  const { disconnect } = useSocketStore();

  function handleLeaveRoom() {
    disconnect();
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-serif italic text-espresso-muted text-lg">Loading...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-serif italic text-espresso-muted text-lg">
          Room not found.
        </p>
      </div>
    );
  }

  const [h, m, s] = formatTime(elapsed);

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fade-in { animation: fadeIn 0.5s ease both; }
        .breathe { animation: breathe 3s ease-in-out infinite; }
        .timer-digit { display: inline-block; min-width: 1.3ch; text-align: center; }
      `}</style>

      <Navbar backHref="/" roomName={room.name} roomSubtitle={room.course} />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* ── Room header ── */}
        <div className="fade-up mb-10" style={{ animationDelay: "0ms" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-serif italic text-3xl md:text-4xl text-espresso mb-1.5">
                {room.name}
              </h1>
              <p className="text-espresso-muted text-sm">
                {room.description}
                <span className="mx-2 text-border">|</span>
                <span className="text-caramel font-medium">{room.course}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                room.isPrivate
                  ? "bg-caramel/10 text-caramel border border-caramel/30"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}>
                {room.isPrivate ? "Private" : "Public"}
              </span>
              <span className="text-xs text-espresso-muted border border-border rounded-full px-3 py-1">
                {room.members.length}/{room.capacity} seats
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── Left column ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Timer card */}
            <div
              className="fade-up relative overflow-hidden bg-espresso rounded-2xl p-8 md:p-10"
              style={{ animationDelay: "80ms" }}
            >
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold tracking-[0.25em] text-caramel/70 uppercase mb-4">
                    Session timer
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="timer-digit font-serif text-5xl md:text-6xl text-surface-card font-light tracking-wide">{h}</span>
                    <span className="breathe text-caramel text-3xl md:text-4xl font-light mx-1">:</span>
                    <span className="timer-digit font-serif text-5xl md:text-6xl text-surface-card font-light tracking-wide">{m}</span>
                    <span className="breathe text-caramel text-3xl md:text-4xl font-light mx-1">:</span>
                    <span className="timer-digit font-serif text-5xl md:text-6xl text-surface-card font-light tracking-wide">{s}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 bg-surface-card/10 rounded-full px-3 py-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs text-surface-card/70 font-medium">In session</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="fade-up" style={{ animationDelay: "160ms" }}>
              <RoomChat messages={messages} sendMessage={sendMessage} />
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Members */}
            <div
              className="fade-up bg-surface-card border border-border rounded-2xl p-6"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase">Members</p>
                <p className="text-xs text-caramel font-medium">{room.members.length}/{room.capacity}</p>
              </div>
              <div className="h-1 bg-border/40 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-caramel/60 rounded-full transition-all duration-500"
                  style={{ width: `${(room.members.length / room.capacity) * 100}%` }}
                />
              </div>
              <ul className="space-y-2">
                {room.members.map((memberId, i) => {
                  const isYou = memberId === user?._id;
                  return (
                    <li
                      key={memberId}
                      className="fade-up flex items-center gap-3 p-2 rounded-xl hover:bg-background/60 transition-colors duration-200"
                      style={{ animationDelay: `${300 + i * 60}ms` }}
                    >
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-semibold ${MEMBER_COLORS[i % MEMBER_COLORS.length]}`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-espresso truncate">{isYou ? "You" : `Scholar ${i + 1}`}</p>
                        <p className="text-[11px] text-espresso-muted/60">{isYou ? "That's you!" : "Studying"}</p>
                      </div>
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    </li>
                  );
                })}
                {Array.from({ length: room.capacity - room.members.length }).map((_, i) => (
                  <li
                    key={`empty-${i}`}
                    className="fade-up flex items-center gap-3 p-2 rounded-xl opacity-30"
                    style={{ animationDelay: `${300 + (room.members.length + i) * 60}ms` }}
                  >
                    <div className="w-9 h-9 rounded-full border border-dashed border-border flex items-center justify-center">
                      <span className="text-xs text-border">?</span>
                    </div>
                    <p className="text-sm text-espresso-muted italic">Open seat</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Room details */}
            <div
              className="fade-up bg-surface-card border border-border rounded-2xl p-6"
              style={{ animationDelay: "320ms" }}
            >
              <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase mb-4">Details</p>
              <dl className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-espresso-muted">Created</dt>
                  <dd className="text-espresso font-medium">
                    {new Date(room.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </dd>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between items-center">
                  <dt className="text-espresso-muted">Visibility</dt>
                  <dd className="text-espresso font-medium">{room.isPrivate ? "Invite only" : "Open to all"}</dd>
                </div>
                {room.isPrivate && (
                  <>
                    <div className="h-px bg-border/40" />
                    <div className="flex justify-between items-center">
                      <dt className="text-espresso-muted">Invite code</dt>
                      <dd className="text-espresso font-mono text-xs bg-background px-2 py-1 rounded-md border border-border">
                        {room.inviteCode}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>

            {/* Leave */}
            <button
              onClick={handleLeaveRoom}
              className="fade-up w-full text-espresso-muted/50 text-xs font-medium py-3 rounded-xl hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-300 cursor-pointer"
              style={{ animationDelay: "400ms" }}
            >
              Leave room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
