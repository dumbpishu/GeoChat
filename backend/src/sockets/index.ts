import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient, connectRedis } from "../config/redis";
import { socketAuthMiddleware } from "../middlewares/socket.middleware";

import { registerLocationEvents } from "./location.socket";
import { registerMessageEvents } from "./message.socket";
import { registerPaginationEvents } from "./pagination.socket";
import { registerTypingEvents } from "./typing.socket";
import { registerReactionEvents } from "./reaction.socket";

export const initializeSocket = async (io: Server) => {
  await connectRedis();
  io.adapter(createAdapter(pubClient, subClient));

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    console.log(`User connected: ${socket.id}`);
    const userId = socket.data.userId;

    // enforceSingleConnection removed - allow multiple device login

    registerLocationEvents(io, socket);
    registerMessageEvents(io, socket);
    registerPaginationEvents(io, socket);
    registerTypingEvents(io, socket);
    registerReactionEvents(io, socket);

    socket.on("disconnect", async () => {
      try {
        const storedSocketId = await pubClient.get(`user:${userId}`);

        if (storedSocketId === socket.id) {
          await pubClient.del(`user:${userId}`);
          await pubClient.del(`user_room:${userId}`);
        }
      } catch (err) {
        console.error("Disconnect cleanup error:", err);
      }
    });
  });
};