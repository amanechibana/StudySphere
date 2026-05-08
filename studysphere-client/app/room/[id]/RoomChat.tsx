"use client";

import useUserStore from "@/app/stores/userStore";
import { ChatMessage } from "@/app/types/chatMessage.interface";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { VoiceMember } from "@/app/hooks/useVoiceChat";

interface VoiceProp {
  members: VoiceMember[];
  inVoice: boolean;
  muted: boolean;
  error: string | null;
  requesting: boolean;
  join: () => void;
  leave: () => void;
  toggleMute: () => void;
}

interface RoomChatProps {
  voice: VoiceProp;
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
  hasMore?: boolean;
  loadMore?: () => void;
  loadingMore?: boolean;
  minimized?: boolean;
}

function VoiceControls({
  inVoice,
  muted,
  members,
  requesting,
  error,
  currentUserId,
  onJoin,
  onLeave,
  onToggleMute,
  minimized,
}: {
  inVoice: boolean;
  muted: boolean;
  members: VoiceMember[];
  requesting: boolean;
  error: string | null;
  currentUserId?: string;
  onJoin: () => void;
  onLeave: () => void;
  onToggleMute: () => void;
  minimized: boolean;
}) {
  if (!inVoice) {
    return (
      <div className="flex items-center gap-2">
        {members.length > 0 && (
          <span className="text-[11px] text-espresso-muted/70">
            {members.length} in voice
          </span>
        )}
        <button
          type="button"
          onClick={onJoin}
          disabled={requesting}
          title={error ?? undefined}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
            error
              ? "border-red-300 text-red-600 hover:bg-red-50"
              : "border-border text-espresso-muted hover:border-espresso-muted hover:text-espresso"
          } ${requesting ? "opacity-60 cursor-wait" : ""}`}
        >
          {requesting ? "Connecting..." : error ? "Mic blocked" : "Join voice"}
        </button>
      </div>
    );
  }

  const others = members.filter((m) => m.userId !== currentUserId);

  return (
    <div className="flex items-center gap-2">
      {!minimized && others.length > 0 && (
        <div className="flex items-center gap-1 mr-1">
          {others.slice(0, 3).map((m) => (
            <span
              key={m.userId}
              title={m.username}
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full border text-[10px] font-semibold ${
                m.muted
                  ? "bg-background border-border text-espresso-muted/60"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {m.username.charAt(0).toUpperCase()}
            </span>
          ))}
          {others.length > 3 && (
            <span className="text-[10px] text-espresso-muted/60">+{others.length - 3}</span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onToggleMute}
        className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors cursor-pointer ${
          muted
            ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
            : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {muted ? "Unmute" : "Mute"}
      </button>
      <button
        type="button"
        onClick={onLeave}
        className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-border text-espresso-muted hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
      >
        Leave
      </button>
    </div>
  );
}

export default function RoomChat({
  voice,
  messages,
  sendMessage,
  hasMore = false,
  loadMore,
  loadingMore = false,
  minimized = false,
}: RoomChatProps) {
  const [input, setInput] = useState("");
  const { user } = useUserStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isNearBottom = useRef(true);
  const prevScrollHeight = useRef<number | null>(null);
  const prevMessageCount = useRef(0);
  const initialScrollDone = useRef(false);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    isNearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (initialScrollDone.current && el.scrollTop < 80 && hasMore && !loadingMore) {
      loadMore?.();
    }
  }

  // capture scroll height before older messages are prepended
  useEffect(() => {
    if (loadingMore) {
      prevScrollHeight.current = scrollRef.current?.scrollHeight ?? null;
    }
  }, [loadingMore]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const messageCountIncreased = messages.length > prevMessageCount.current;
    prevMessageCount.current = messages.length;

    // older messages were prepended and restores position so view doesn't jump
    if (prevScrollHeight.current !== null && messageCountIncreased && !isNearBottom.current) {
      el.scrollTop = el.scrollHeight - prevScrollHeight.current;
      prevScrollHeight.current = null;
      return;
    }

    if (messageCountIncreased) {
      if (!initialScrollDone.current) {
        // first load, jumps instantly so no scroll events fire near top
        el.scrollTop = el.scrollHeight;
        initialScrollDone.current = true;
      } else if (isNearBottom.current) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl flex flex-col flex-1 overflow-hidden">
      <div
        className={`border-b border-border/60 flex items-center justify-between gap-3 ${minimized ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4"}`}
      >
        <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase">
          Room chat
        </p>
        <VoiceControls
          inVoice={voice.inVoice}
          muted={voice.muted}
          members={voice.members}
          requesting={voice.requesting}
          error={voice.error}
          currentUserId={user?._id}
          onJoin={voice.join}
          onLeave={voice.leave}
          onToggleMute={voice.toggleMute}
          minimized={minimized}
        />
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={`flex-1 overflow-y-auto flex flex-col min-h-0 ${minimized ? "px-3 py-3 gap-2" : "px-6 py-4 gap-3"}`}
      >
        {loadingMore && (
          <div className="flex justify-center py-1">
            <p className="text-xs text-espresso-muted/40">Loading...</p>
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-serif italic text-espresso-muted/60 text-lg mb-1">
                Quiet so far...
              </p>
              {!minimized && (
                <p className="text-xs text-espresso-muted/40">
                  Be the first to break the silence.
                </p>
              )}
            </div>
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
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className={`border-t border-border/60 ${minimized ? "p-3" : "p-4"}`}
      >
        <div className={`flex ${minimized ? "gap-2" : "gap-3"}`}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className={`flex-1 bg-background border border-border rounded-xl text-sm text-espresso placeholder:text-border/80 outline-none focus:border-caramel/60 transition-all duration-300 ${minimized ? "px-3 py-2" : "px-4 py-3"}`}
          />
          <button
            type="submit"
            className={`shrink-0 bg-espresso text-surface-card rounded-xl hover:bg-espresso-muted transition-colors duration-200 cursor-pointer active:scale-[0.97] ${minimized ? "p-2.5" : "px-5 py-3 text-sm font-medium"}`}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
