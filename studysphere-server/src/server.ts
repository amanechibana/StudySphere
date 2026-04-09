import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { port } from "./config/settings.js";
import { initSockets } from "./sockets/index.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// initialize all socket logic
initSockets(io);

server.listen(port, () => {
  console.log("We've now got a server!");
  console.log(`Your routes will be running on http://localhost:${port}`);
});
