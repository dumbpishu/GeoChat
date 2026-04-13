import { Socket, Server } from "socket.io";
import { pubClient } from "../config/redis";

export const enforceSingleConnection = async (
  io: Server,
  socket: Socket,
  userId: string
) => {
  try {
    const key = `user:${userId}`;
    const existingSocketId = await pubClient.get(key);

    if (existingSocketId && existingSocketId !== socket.id) {
      console.log("Enforcing single connection for user:", userId);

      io.to(existingSocketId).emit(
        "force_logout",
        "Logged in from another device"
      );

      const oldSocket = io.sockets.sockets.get(existingSocketId);
      oldSocket?.disconnect(true);
    }

    // ALWAYS set (even if no previous socket)
    await pubClient.set(key, socket.id, {
      EX: 60 * 60, // 1 hour TTL
    });

  } catch (error) {
    console.error("Single connection error:", error);
  }
};
