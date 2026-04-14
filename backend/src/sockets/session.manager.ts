import { Socket, Server } from "socket.io";
import { pubClient } from "../config/redis";

export const enforceSingleConnection = async (
  io: Server,
  socket: Socket,
  userId: string
) => {
  try {
    const key = `user:${userId}`;

    // atomic get-set to ensure only one active session per user
    const oldSocketId = await pubClient.getSet(key, socket.id);

    // If another session exists → force logout
    if (oldSocketId && oldSocketId !== socket.id) {
      console.log("Enforcing single connection for user:", userId);

      // Notify old session
      io.to(oldSocketId).emit(
        "force_logout",
        "Logged in from another device"
      );

      // disconnect old session
      io.in(oldSocketId).disconnectSockets(true);
    }

  } catch (error) {
    console.error("Single connection error:", error);
  }
};