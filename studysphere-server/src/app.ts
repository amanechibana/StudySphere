import cors from "cors";
import express from "express";
import { port } from "./config/settings.js";
import configRoutes from "./routes/index.js";
import http from "http";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configRoutes(app);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // replace later
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join room
  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined ${roomId}`);
  });

  // send message
  socket.on("send_message", (data) => {
    const { roomId, message, user } = data;

    io.to(roomId).emit("receive_message", {
      message,
      user,
      timestamp: new Date(),
    });
  });

  // disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(port, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${port}`);
});
