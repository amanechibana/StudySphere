// Update serverUrl / database when wiring MongoDB.

export const mongoConfig = {
  serverUrl: "mongodb://localhost:27017/",
  database: "StudySphere",
} as const;

export const port = parseInt(process.env.PORT ?? "4000", 10);
