import { createClient } from "redis";
import { env } from "./env";

const redisUrl = env.REDIS_URI;

export const pubClient = createClient({ url: redisUrl });
export const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.log("Redis Pub Error:", err));
subClient.on("error", (err) => console.log("Redis Sub Error:", err));

export const connectRedis = async () => {
  await pubClient.connect();
  await subClient.connect();
  console.log("Redis Connected");
};