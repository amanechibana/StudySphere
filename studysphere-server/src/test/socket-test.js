import { io } from "socket.io-client";

const socket = io("http://localhost:3002", {
  auth: {
    token: "valid token",
  },
});

socket.on("connect", () => {
  console.log("connected");

  socket.emit("join_room", {
    roomId: "valid room id",
    inviteCode: null,
  });

  setTimeout(() => {
    socket.emit("send_stroke", {
      roomId: "valid room id",
      stroke: {
        type: "pen",
        color: "#000",
        width: 2,
        points: [
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
        timestamp: new Date().toISOString(),
      },
    });
  }, 1000);
});

socket.on("receive_stroke", console.log);

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});
