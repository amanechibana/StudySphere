import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3002"; // your server port
const ROOM_ID = "ROOM_ID";
const FIREBASE_ID_TOKEN = "AUTH_TOKEN";
const USER_ID = "USER_ID";

const socket = io(SERVER_URL, {
  auth: {
    token: FIREBASE_ID_TOKEN,
  },
});

socket.on("connect", () => {
  console.log("connected", socket.id);

  socket.emit("join_room", {
    roomId: ROOM_ID,
    inviteCode: null,
  });

  setTimeout(() => {
    console.log("sending stroke...");
    socket.emit("send_stroke", {
      roomId: ROOM_ID,
      stroke: {
        type: "pen",
        color: "#000000",
        width: 2,
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 20 },
        ],
        timestamp: new Date().toISOString(),
        userId: USER_ID,
      },
    });
  }, 1000);

  setTimeout(() => {
    console.log("sending second stroke...");
    socket.emit("send_stroke", {
      roomId: ROOM_ID,
      stroke: {
        type: "pen",
        color: "#000000",
        width: 2,
        points: [
          { x: 11, y: 10 },
          { x: 20, y: 20 },
        ],
        timestamp: new Date().toISOString(),
        userId: USER_ID,
      },
    });
  }, 1000);

  setTimeout(() => {
    console.log("requesting undo...");
    socket.emit("undo_stroke");
  }, 2500);
});

socket.on("receive_stroke", (data) => {
  console.log("receive_stroke:", data);
});

socket.on("undo_stroke", (data) => {
  console.log("undo_stroke:", data);
  socket.disconnect();
});

socket.on("connect_error", (err) => {
  console.error("connect_error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("disconnect:", reason);
});
