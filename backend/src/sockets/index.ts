import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient, connectRedis } from "../config/redis";
import { socketAuthMiddleware } from "../middlewares/socket.middleware";
import { enforceSingleConnection, cleanupUserConnection } from "./session.manager";

export const initializeSocket = async (io: Server) => {
    await connectRedis();
    io.adapter(createAdapter(pubClient, subClient));

    io.use(socketAuthMiddleware);

    io.on("connection", async (socket) => {
        const userId = socket.data.userId;

        console.log(`Client connected: ${socket.id} (User ID: ${userId})`);

        await enforceSingleConnection(io, socket, userId);

        socket.on("disconnect", async () => {
            await cleanupUserConnection(socket, userId);

            console.log(`Client disconnected: ${socket.id} (User ID: ${userId})`);
        });
    });
};