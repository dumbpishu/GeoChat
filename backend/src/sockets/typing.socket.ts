import { Server, Socket } from "socket.io";
import { pubClient } from "../config/redis";
import { User } from "../models/user.model"; // 👈 make sure you have this

export const registerTypingEvents = (io: Server, socket: Socket) => {

  // typing start
  socket.on("typing_start", async () => {
    try {
      const userId = socket.data.userId?.toString();
      if (!userId) return;

      const roomId =
        socket.data.currentRoom ||
        (await pubClient.get(`user_room:${userId}`));

      if (!roomId) return;

      const key = `typing_users:${roomId}`;

      const added = await pubClient.sAdd(key, userId);

      // set TTL only once
      const ttl = await pubClient.ttl(key);
      if (ttl < 0) {
        await pubClient.expire(key, 5);
      }

      // only emit update if this user was not already in the set (prevents duplicates and unnecessary emits)
      if (added === 1) {
        const typingUsers = await pubClient.sMembers(key);

        // 🔥 fetch user info
        const users = await User.find({
          _id: { $in: typingUsers },
        })
          .select("name username avatar")
          .lean();

        io.to(roomId).emit("typing_users_update", users);
      }

    } catch (err) {
      console.error("typing_start error:", err);
    }
  });

  // typing stop
  socket.on("typing_stop", async () => {
    try {
      const userId = socket.data.userId?.toString();
      if (!userId) return;

      const roomId =
        socket.data.currentRoom ||
        (await pubClient.get(`user_room:${userId}`));

      if (!roomId) return;

      const key = `typing_users:${roomId}`;

      const removed = await pubClient.sRem(key, userId);

      if (removed === 1) {
        const typingUsers = await pubClient.sMembers(key);

        if (typingUsers.length === 0) {
          io.to(roomId).emit("typing_users_update", []);
          return;
        }

        const users = await User.find({
          _id: { $in: typingUsers },
        })
          .select("name username avatar")
          .lean();

        io.to(roomId).emit("typing_users_update", users);
      }

    } catch (err) {
      console.error("typing_stop error:", err);
    }
  });
};