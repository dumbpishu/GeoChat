import { Socket, Server } from "socket.io";
import { pubClient } from "../config/redis";

export const enforceSingleConnection = async (
  io: Server,
  socket: Socket,
  userId: string
) => {
  try {
    const key = `user:${userId}`;

    // Get current socket ID for this user
    const currentSocketId = await pubClient.get(key);

    // If another session exists → force logout old one
    if (currentSocketId && currentSocketId !== socket.id) {
      console.log("Enforcing single connection for user:", userId);

      // Notify old session FIRST with graceful logout message
      io.to(currentSocketId).emit(
        "force_logout",
        "Logged out. Login again to continue."
      );

      // AFTER notifying, disconnect old socket
      const oldSocket = io.sockets.sockets.get(currentSocketId);
      if (oldSocket) {
        oldSocket.disconnect(true);
      }
    }

    // Store new socket ID
    await pubClient.set(key, socket.id);

  } catch (error) {
    console.error("Single connection error:", error);
  }
};