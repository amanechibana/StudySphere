import type { Application } from "express";
import roomRoutes from "./rooms.js";

const constructorMethod = (app: Application) => {
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "studysphere-server" });
  });

  app.use("/rooms", roomRoutes);

  app.use(/(.*)/, (_req, res) => {
    res.sendStatus(404);
  });
};

export default constructorMethod;
