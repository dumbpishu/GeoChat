import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient, connectRedis } from "../config/redis";
import { socketAuthMiddleware } from "../middlewares/socket.middleware";
import { enforceSingleConnection, cleanupUserConnection } from "./session.manager";

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
            await cleanupUserConnection(socket, userId);

            console.log(`Client disconnected: ${socket.id} (User ID: ${userId})`);
        });
    });
};