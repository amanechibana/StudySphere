import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { port } from "./config/settings.js";
import { initSockets } from "./sockets/index.js";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();

async function startServer() {
  await pubClient.connect();
  await subClient.connect();

  // plug redis into socket.io
  io.adapter(createAdapter(pubClient, subClient));

  // initialize all socket logic
  initSockets(io);

  server.listen(port, () => {
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${port}`);
  });
}

startServer();
