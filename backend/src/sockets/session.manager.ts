import { Socket, Server } from "socket.io";
import { pubClient } from "../config/redis";

export const enforceSingleConnection = async (io: Server, socket: Socket, userId: string) => {
    try {
        const existingSocketId = await pubClient.get(`user:${userId}`);

        if (existingSocketId && existingSocketId !== socket.id) {
            console.log("Enforcing single connection for user:", userId);

            // Emit a message to the existing socket before disconnecting
            io.to(existingSocketId).emit("force_logout", "You have been logged out because you logged in from another device.");

            // Disconnect the existing socket
            const oldSocket = io.sockets.sockets.get(existingSocketId);
            oldSocket?.disconnect(true);

            // Update the Redis entry with the new socket ID
            await pubClient.set(`user:${userId}`, socket.id);
        }
    } catch (error) {
        console.error("Error occurred while enforcing single connection:", error);
    }
}

export const cleanupUserConnection = async (socket: Socket, userId: string) => {
    try {
        const storedSocketId = await pubClient.get(`user:${userId}`);

        if (storedSocketId === socket.id) {
            await pubClient.del(`user:${userId}`);
        }
    } catch (error) {
        console.error("Error occurred while cleaning up user connection:", error);
    }
}