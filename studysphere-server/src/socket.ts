import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { initSockets } from "./sockets/index.js";

export async function initializeSocketLayer(
  httpServer: HttpServer,
): Promise<void> {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  const pubClient = createClient({ url: process.env.REDIS_URL });
  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
  initSockets(io);
}
