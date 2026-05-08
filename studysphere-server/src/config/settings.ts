export const mongoConfig = {
  serverUrl: process.env.MONGODB_URI ?? "mongodb://localhost:27017/",
  database: "StudySphere",
} as const;

export const port = parseInt(process.env.PORT ?? "4000", 10);
