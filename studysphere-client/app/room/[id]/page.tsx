"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Navbar from "../../components/Navbar";
import useUserStore from "../../stores/userStore";
import useSocketStore from "../../stores/socketStore";
import { useChat } from "../../hooks/useChat";
import { useSocketRoom } from "../../hooks/useSocketRoom";
import { useRoom } from "../../hooks/useRoom";
import { type Stroke } from "../../hooks/useCanvasDrawing";
import RoomChat from "./RoomChat";
import RoomCanvas from "../../components/canvas/RoomCanvas";
import SessionTimer from "./SessionTimer";

import type { Room } from "../../types/room.interface";

const MEMBER_COLORS = [
  "bg-amber-800/20 border-amber-800/30 text-amber-900",
  "bg-emerald-800/20 border-emerald-800/30 text-emerald-900",
  "bg-rose-800/20 border-rose-800/30 text-rose-900",
  "bg-indigo-800/20 border-indigo-800/30 text-indigo-900",
  "bg-orange-800/20 border-orange-800/30 text-orange-900",
  "bg-teal-800/20 border-teal-800/30 text-teal-900",
];

function formatTime(seconds: number) {
  return [
    Math.floor(seconds / 3600),
    Math.floor((seconds % 3600) / 60),
    seconds % 60,
  ].map((v) => v.toString().padStart(2, "0"));
}

function MembersPanel({ room, userId }: { room: Room; userId?: string }) {
  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase">Members</p>
        <p className="text-xs text-caramel font-medium">{room.members.length}/{room.capacity}</p>
      </div>
      <div className="h-1 bg-border/40 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-caramel/60 rounded-full transition-all duration-500"
          style={{ width: `${(room.members.length / room.capacity) * 100}%` }}
        />
      </div>
      <ul className="space-y-1">
        {room.members.map((memberId, i) => (
          <li key={memberId} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-background/60 transition-colors duration-200">
            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-semibold ${MEMBER_COLORS[i % MEMBER_COLORS.length]}`}>
              {String.fromCharCode(65 + i)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-espresso truncate">{memberId === userId ? "You" : `Scholar ${i + 1}`}</p>
              <p className="text-[11px] text-espresso-muted/60">{memberId === userId ? "That's you!" : "Studying"}</p>
            </div>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </li>
        ))}
        {Array.from({ length: room.capacity - room.members.length }).map((_, i) => (
          <li key={`empty-${i}`} className="flex items-center gap-2 p-1.5 rounded-xl opacity-30">
            <div className="w-7 h-7 rounded-full border border-dashed border-border flex items-center justify-center">
              <span className="text-xs text-border">?</span>
            </div>
            <p className="text-sm text-espresso-muted italic">Open seat</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailsPanel({ room }: { room: Room }) {
  const [copied, setCopied] = useState(false);

  function copyInviteCode() {
    navigator.clipboard.writeText(room.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl p-4">
      <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase mb-3">Details</p>
      <dl className="space-y-2 text-sm">
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
              <dd className="flex items-center gap-2">
                <span className="text-espresso font-mono text-xs bg-background px-2 py-1 rounded-md border border-border">
                  {room.inviteCode}
                </span>
                <button
                  type="button"
                  onClick={copyInviteCode}
                  className="bg-espresso text-white text-xs font-semibold px-2.5 py-1 rounded-md hover:bg-espresso-muted transition-colors cursor-pointer"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </dd>
            </div>
          </>
        )}
      </dl>
    </div>
  );
}

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const inviteCode = searchParams.get("inviteCode");

  const { user } = useUserStore();
  const router = useRouter();
  const { disconnect } = useSocketStore();
  const { data: room, isLoading, isError } = useRoom(id);

  const [elapsed, setElapsed] = useState(0);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  const { joinError } = useSocketRoom(id, inviteCode);
  const { messages, sendMessage } = useChat(id);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-serif italic text-espresso-muted text-lg">Loading...</p>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-serif italic text-espresso-muted text-lg">Room not found.</p>
      </div>
    );
  }

  if (joinError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif italic text-red-600 text-lg mb-4">
            {joinError}
          </p>
          <button
            onClick={() => router.push("/rooms")}
            className="bg-espresso text-white px-4 py-2 rounded-lg hover:bg-espresso-muted transition-colors"
          >
            Back to home
          </button>
        </div>
        <p className="font-serif italic text-red-500 text-lg">{joinError}</p>
      </div>
    );
  }

  const [h, m, s] = formatTime(elapsed);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar backHref="/rooms" roomName={room.name} roomSubtitle={room.course} />

      <main className="w-full max-w-6xl mx-auto px-6 py-6 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="mb-5 shrink-0 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif italic text-3xl md:text-4xl text-espresso mb-1.5">{room.name}</h1>
            <p className="text-espresso-muted text-sm">
              {room.description}
              <span className="mx-2 text-border">|</span>
              <span className="text-caramel font-medium">{room.course}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCanvasOpen((o) => !o)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                canvasOpen
                  ? "bg-espresso text-[#faf8f3] border-espresso"
                  : "text-espresso-muted border-border hover:border-espresso-muted hover:text-espresso"
              }`}
            >
              {canvasOpen ? "Close canvas" : "Canvas"}
            </button>
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

        {canvasOpen ? (
          <div className="flex gap-6 items-stretch flex-1 min-h-0">
            <div className="w-64 shrink-0 flex flex-col gap-4 min-h-0">
              <SessionTimer h={h} m={m} s={s} />
              <RoomChat messages={messages} sendMessage={sendMessage} minimized />
            </div>
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              <RoomCanvas strokes={strokes} setStrokes={setStrokes} />
            </div>
            <div className="w-52 shrink-0 flex flex-col gap-4 min-h-0 overflow-y-auto">
              <MembersPanel room={room} userId={user?._id} />
              <DetailsPanel room={room} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
              <SessionTimer h={h} m={m} s={s} />
              <div className="flex-1 min-h-0 flex flex-col">
                <RoomChat messages={messages} sendMessage={sendMessage} />
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto">
              <MembersPanel room={room} userId={user?._id} />
              <DetailsPanel room={room} />
              <button
                onClick={() => { disconnect(); router.push("/rooms"); }}
                className="w-full text-espresso-muted/50 text-xs font-medium py-3 rounded-xl hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-300 cursor-pointer"
              >
                Leave room
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
