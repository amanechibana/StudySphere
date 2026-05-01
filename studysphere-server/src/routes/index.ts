import type { Application } from "express";
import roomRoutes from "./rooms.js";
import userRoutes from "./users.js";
import messageRoutes from "./messages.js";

const constructorMethod = (app: Application) => {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "studysphere-server" });
  });

  app.use("/rooms", roomRoutes);
  app.use("/users", userRoutes);
  app.use("/messages", messageRoutes);

  app.use(/(.*)/, (_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
};

export default constructorMethod;
