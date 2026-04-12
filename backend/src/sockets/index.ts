import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { pubClient, subClient, connectRedis } from "../config/redis";

export const initializeSocket = async (io: Server) => {
    await connectRedis();
    io.adapter(createAdapter(pubClient, subClient));

    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });
};