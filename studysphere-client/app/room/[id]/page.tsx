"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { socket } from "@/app/lib/socket";
import useUserStore from "@/app/stores/userStore";
import Navbar from "@/app/components/Navbar";

type Message = {
  user: string;
  message: string;
};

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;

  const { user } = useUserStore();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!roomId) return;

    if (!socket.connected) {
      socket.connect();
    }

    if (socket.connected) {
      socket.emit("join_room", roomId);
    } else {
      socket.on("connect", () => {
        console.log("connected:", socket.id);
        socket.emit("join_room", roomId);
      });
    }

    const handler = (data: Message) => {
      console.log("received:", data);
      setMessages((prev) => [...prev, data]);
    };

    socket.off("receive_message").on("receive_message", handler);

    return () => {
      socket.emit("leave_room", roomId);
      socket.off("receive_message", handler);
      socket.disconnect();
    };
  }, [roomId]);

  const sendMessage = () => {
    if (!message.trim() || !user?.username) {
      console.log("message or username not set");
      console.log(message, user);
      //return;
    }

    if (!socket.connected) {
      console.log("socket not connected");
      return;
    }

    const payload = {
      roomId,
      message,
      user: "hardcoded user", //user.username,
    };

    console.log("sending:", payload);

    socket.emit("send_message", payload);

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-espresso">
            Room: {roomId}
          </h1>
          <p className="text-sm text-espresso-muted">Live study chat</p>
        </div>

        {/* Messages */}
        <div className="flex-1 border border-border rounded-xl p-4 overflow-y-auto bg-surface-card space-y-2">
          {messages.length > 0 ? (
            messages.map((m, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold text-caramel">{m.user}</span>
                <span className="text-espresso">: {m.message}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-espresso-muted italic">
              No messages yet. Start the session.
            </p>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-3">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-surface-card border border-border rounded-lg px-4 py-2.5 text-sm text-espresso outline-none focus:border-caramel transition-colors"
          />
          <button
            onClick={sendMessage}
            className="bg-espresso text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-espresso-muted transition-colors"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
