import cors from "cors";
import express from "express";
import http from "http";
import { port } from "./config/settings.js";
import configRoutes from "./routes/index.js";
import { initializeSocketLayer } from "./socket.js";
import { initializeRoomArchiveCallbacks } from "./helpers.js";

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

async function startApp() {
  await initializeSocketLayer(server);
  server.listen(port, () => {
    console.log("We've now got a server!");
    console.log(`Your routes will be running on http://localhost:${port}`);
  });

  await initializeRoomArchiveCallbacks();
}

void startApp();
