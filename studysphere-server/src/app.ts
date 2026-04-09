import cors from "cors";
import express from "express";
import configRoutes from "./routes/index.js";

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

export default app;
