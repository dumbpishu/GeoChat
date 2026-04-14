import { Socket, Server } from "socket.io";
import { getRoom } from "../utils/room";
import { pubClient } from "../config/redis";
import { Message } from "../models/message.model";

export const registerLocationEvents = (io: Server, socket: Socket) => {
  socket.on(
    "update_location",
    async (data: { lat: number; long: number }) => {
      try {
        const userId = socket.data.userId?.toString();
        if (!userId) return;

        const newRoom = getRoom(data.lat, data.long);

        const prevRoom = await pubClient.getSet(
          `user_room:${userId}`,
          newRoom
        );

        if (prevRoom === newRoom) return;

        // leave previous
        if (prevRoom) {
          socket.leave(prevRoom);

          const removed = await pubClient.sRem(
            `online_users:${prevRoom}`,
            userId
          );

          if (removed === 1) {
            const prevCount = await pubClient.sCard(
              `online_users:${prevRoom}`
            );
            io.to(prevRoom).emit("online_users_count", prevCount);
          }
        }

        // join new
        socket.join(newRoom);
        socket.data.currentRoom = newRoom;

        const added = await pubClient.sAdd(
          `online_users:${newRoom}`,
          userId
        );

        const count = await pubClient.sCard(
          `online_users:${newRoom}`
        );

        socket.emit("online_users_count", count);

        if (added === 1) {
          socket.to(newRoom).emit("online_users_count", count);
        }

        // 🔥 FETCH FROM DB ONLY
        const messages = await Message.find({ roomId: newRoom })
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();

        socket.emit("recent_messages", messages.reverse());
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", "Failed to update location");
      }
    }
  );
};