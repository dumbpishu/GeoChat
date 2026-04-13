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

        console.log(`Client connected: ${socket.id} (User ID: ${userId})`);

        await enforceSingleConnection(io, socket, userId);
        registerLocationEvents(io, socket);
        registerMessageEvents(io, socket);
        registerPaginationEvents(io, socket);
        registerTypingEvents(io, socket);
        registerReactionEvents(io, socket);

        socket.on("disconnect", async () => {
            const roomId = socket.data.currentRoom;

            try {
                // remove from room presence
                if (roomId) {
                const removed = await pubClient.sRem(
                    `online_users:${roomId}`,
                    userId
                );

                if (removed) {
                    const count = await pubClient.sCard(
                    `online_users:${roomId}`
                    );

                    socket.to(roomId).emit("online_users_count", count);
                }
                }

                // safe user cleanup
                const storedSocketId = await pubClient.get(`user:${userId}`);

                // prevent race condition
                if (storedSocketId === socket.id) {
                await pubClient.del(`user:${userId}`);
                }

            } catch (err) {
                console.error("Disconnect cleanup error:", err);
            }

            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};