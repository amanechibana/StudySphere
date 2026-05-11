import { createClient } from "redis";
import type { Request, Response, NextFunction } from "express";

const redisClient = createClient({ url: process.env.REDIS_URL });
let redisConnected = false;

redisClient.on("error", (err) => {
  console.error("Redis client error:", err);
});

redisClient
  .connect()
  .then(() => {
    redisConnected = true;
    console.log("Redis cache connected");
  })
  .catch(console.error);

export async function cacheMessages(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  if (!redisConnected) {
    console.log("Redis not connected, skipping cache");
    return next();
  }
  try {
    const { id: roomId } = req.params;
    const { before, limit } = req.query;
    // create a cache key from roomId
    const cacheKey = `messages:${roomId}:${before ?? "latest"}:${limit ?? "50"}`;

    // attempt to retrieve from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    // store original json
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // cache messages for 60 minutes
      redisClient
        .setEx(cacheKey, 3600, JSON.stringify(data))
        .catch(console.error);
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.error("Cache middleware error:", err);
    next();
  }
}

export async function invalidateMessageCache(roomId: string) {
  try {
    // get all keys with matching roomId
    const keys = await redisClient.keys(`messages:${roomId}:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(
        `Invalidated ${keys.length} cache entries for room ${roomId}`,
      );
    }
  } catch (err) {
    console.error("Cache invalidation error:", err);
  }
}

export async function cacheStrokes(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  if (!redisConnected) {
    console.log("Redis not connected, skipping stroke cache");
    return next();
  }
  try {
    const { id: roomId } = req.params;
    // create a cache key from roomId
    const cacheKey = `strokes:${roomId}`;

    // attempt to retrieve from cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.status(200).json(JSON.parse(cached));
    }

    // store original json
    const originalJson = res.json.bind(res);
    res.json = function (data: any) {
      // cache strokes for 60 minutes
      redisClient
        .setEx(cacheKey, 3600, JSON.stringify(data))
        .catch(console.error);
      return originalJson(data);
    };
    console.log(`Cache miss for ${cacheKey}`);
    next();
  } catch (err) {
    console.error("Stroke cache middleware error:", err);
    next();
  }
}

export async function invalidateStrokeCache(roomId: string) {
  try {
    // get all keys with matching roomId
    const key = `strokes:${roomId}`;
    await redisClient.del(key);
    console.log(`Invalidated stroke cache for room ${roomId}`);
  } catch (err) {
    console.error("Stroke cache invalidation error:", err);
  }
}
