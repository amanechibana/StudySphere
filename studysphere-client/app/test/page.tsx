"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

export default function TestPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    socket.connect();

    socket.emit("join_room", "test-room");

    const handler = (data: { user: string; message: string }) => {
      console.log("received:", data);
      setMessages((prev) => [...prev, `${data.user}: ${data.message}`]);
    };

    socket.off("receive_message").on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !username.trim()) return;

    socket.emit("send_message", {
      roomId: "test-room",
      message,
      user: username,
    });

    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Socket Test</h1>

      {/* Username input */}
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter username"
        style={{ display: "block", marginBottom: 10 }}
      />

      {/* Messages */}
      <div
        style={{
          border: "1px solid black",
          height: 200,
          overflow: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>

      {/* Message input */}
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message"
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
