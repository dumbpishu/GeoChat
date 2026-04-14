import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient, connectRedis } from "../config/redis";
import { socketAuthMiddleware } from "../middlewares/socket.middleware";
import { enforceSingleConnection } from "./session.manager";

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
    const userId = socket.data.userId;

    await enforceSingleConnection(io, socket, userId);

    registerLocationEvents(io, socket);
    registerMessageEvents(io, socket);
    registerPaginationEvents(io, socket);
    registerTypingEvents(io, socket);
    registerReactionEvents(io, socket);

    socket.on("disconnect", async () => {
      try {
        const roomId = socket.data.currentRoom;

        const storedSocketId = await pubClient.get(`user:${userId}`);

        // only cleanup if this socket is the active session (handles quick reconnects)
        if (storedSocketId === socket.id) {
          if (roomId) {
            const removed = await pubClient.sRem(
              `online_users:${roomId}`,
              userId
            );

            if (removed === 1) {
              const count = await pubClient.sCard(
                `online_users:${roomId}`
              );

              socket
                .to(roomId)
                .emit("online_users_count", count);
            }
          }

          // cleanup session
          await pubClient.del(`user:${userId}`);
          await pubClient.del(`user_room:${userId}`);
        }
      } catch (err) {
        console.error("Disconnect cleanup error:", err);
      }
    });
  });
};