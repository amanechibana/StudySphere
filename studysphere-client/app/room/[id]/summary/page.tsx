"use client";

import { use } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import { useArchivedRoom, useArchivedRoomMessages } from "../../../hooks/useRoom";
import useUserStore from "../../../stores/userStore";

export default function RoomSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: room, isLoading, isError } = useArchivedRoom(id);
  const { data: messages = [] } = useArchivedRoomMessages(id);
  const { user } = useUserStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-sm text-espresso-muted italic">Loading summary...</p>
        </main>
      </div>
    );
  }

  if (isError || !room) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-sm text-espresso-muted italic">
            This room&apos;s summary could not be found.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-6 py-6 flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="mb-5 shrink-0">
          <Link
            href="/rooms"
            className="text-sm text-caramel hover:text-espresso transition-colors"
          >
            ← Back to rooms
          </Link>
          <h1 className="font-serif italic text-3xl md:text-4xl text-espresso mt-3 mb-1">
            {room.name}
          </h1>
          <p className="text-espresso-muted text-sm">
            {room.description}
            <span className="mx-2 text-border">|</span>
            <span className="text-caramel font-medium">{room.course}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
          <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto">
            <div className="bg-surface-card border border-border rounded-2xl p-6">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase mb-4">
                AI Summary
              </p>
              {room.summary ? (
                <p className="text-espresso text-sm leading-relaxed whitespace-pre-wrap">
                  {room.summary}
                </p>
              ) : (
                <p className="text-espresso-muted text-sm italic">
                  No summary available yet. It may still be generating, or the
                  session had no chat messages to summarize.
                </p>
              )}
            </div>

            <div className="bg-surface-card border border-border rounded-2xl p-6">
              <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase mb-4">
                Room details
              </p>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <dt className="text-espresso-muted">Description</dt>
                  <dd className="text-espresso font-medium italic max-w-xs text-right">
                    {room.description}
                  </dd>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between items-center">
                  <dt className="text-espresso-muted">Visibility</dt>
                  <dd className="text-espresso font-medium">
                    {room.isPrivate ? "Private" : "Public"}
                  </dd>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex justify-between items-center">
                  <dt className="text-espresso-muted">Created</dt>
                  <dd className="text-espresso font-medium">
                    {new Date(room.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col min-h-0">
            <div className="bg-surface-card border border-border rounded-2xl flex flex-col flex-1 overflow-hidden">
              <div className="border-b border-border/60 px-6 pt-6 pb-4 shrink-0">
                <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase">
                  Chat log
                </p>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col px-6 py-4 gap-3 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="font-serif italic text-espresso-muted/60 text-lg">
                      No messages in this session.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isYou = msg.user._id === user?._id;
                    return (
                      <div
                        key={i}
                        className={`flex flex-col gap-0.5 ${isYou ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[11px] text-espresso-muted/60 px-1">
                          {isYou ? "You" : msg.user.username}
                        </span>
                        <div
                          className={`px-3 py-1.5 rounded-2xl text-sm max-w-[90%] wrap-break-word ${
                            isYou
                              ? "bg-espresso text-surface-card rounded-tr-sm"
                              : "bg-background border border-border text-espresso rounded-tl-sm"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
