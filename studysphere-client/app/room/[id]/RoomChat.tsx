"use client";

import useUserStore from "@/app/stores/userStore";
import { ChatMessage } from "@/app/types/chatMessage.interface";
import { useState } from "react";

interface RoomChatProps {
  messages: ChatMessage[];
  sendMessage: (message: string) => void;
}

export default function RoomChat({ messages, sendMessage }: RoomChatProps) {
const [input, setInput] = useState("");
  const { user } = useUserStore();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  }

  return (
    <div className="bg-surface-card border border-border rounded-2xl flex flex-col flex-1 overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-border/60">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-espresso-muted uppercase">
          Room chat
        </p>
      </div>

      <div className="flex-1 min-h-[280px] overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="font-serif italic text-espresso-muted/60 text-lg mb-1">
                Quiet so far...
              </p>
              <p className="text-xs text-espresso-muted/40">
                Be the first to break the silence.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isYou = msg.user._id === user?._id;
            return (
              <div key={i} className={`flex flex-col gap-0.5 ${isYou ? "items-end" : "items-start"}`}>
                <span className="text-[11px] text-espresso-muted/60 px-1">
                  {isYou ? "You" : msg.user.username}
                </span>
                <div className={`px-4 py-2 rounded-2xl text-sm max-w-[80%] ${
                  isYou
                    ? "bg-espresso text-surface-card rounded-tr-sm"
                    : "bg-background border border-border text-espresso rounded-tl-sm"
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border/60">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-espresso placeholder:text-border/80 outline-none focus:border-caramel/60 transition-all duration-300"
          />
          <button
            type="submit"
            className="shrink-0 bg-espresso text-surface-card text-sm font-medium px-5 py-3 rounded-xl hover:bg-espresso-muted transition-colors duration-200 cursor-pointer active:scale-[0.97]"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}