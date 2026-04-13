import { Server, Socket } from "socket.io";
import { pubClient } from "../config/redis";

export const registerTypingEvents = (io: Server, socket: Socket) => {

  // typing start
  socket.on("typing_start", async () => {
    try {
      const userIdRaw = socket.data.userId;
      if (!userIdRaw) return;

      const userId = userIdRaw.toString();

      // get room from REDIS (source of truth)
      const roomId = await pubClient.get(`user_room:${userId}`);
      if (!roomId) return;

      const key = `typing_users:${roomId}`;

      // add user to typing set
      await pubClient.sAdd(key, userId);

      // auto remove after 5 seconds to prevent stale typing status (e.g. if user disconnects without sending stop)
      await pubClient.expire(key, 5);

      // get all typing users
      const usersTyping = await pubClient.sMembers(key);

      io.to(roomId).emit("typing_users_update", usersTyping);

    } catch (err) {
      console.error("typing_start error:", err);
    }
  });

  // typing stops
  socket.on("typing_stop", async () => {
    try {
      const userIdRaw = socket.data.userId;
      if (!userIdRaw) return;

      const userId = userIdRaw.toString();

      const roomId = await pubClient.get(`user_room:${userId}`);
      if (!roomId) return;

      const key = `typing_users:${roomId}`;

      await pubClient.sRem(key, userId);

      const usersTyping = await pubClient.sMembers(key);

      io.to(roomId).emit("typing_users_update", usersTyping);

    } catch (err) {
      console.error("typing_stop error:", err);
    }
  });
};