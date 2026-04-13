import { Socket, Server } from "socket.io";
import { getRoom } from "../utils/room";
import { pubClient } from "../config/redis";
import { Message } from "../models/message.model";

export const registerLocationEvents = (io: Server, socket: Socket) => {
  socket.on(
    "update_location",
    async (data: { lat: number; long: number }) => {
      console.log(`Received location update from ${socket.id}:`, data);

      try {
        const { lat, long } = data;

        const userIdRaw = socket.data.userId;
        if (!userIdRaw) return;

        const userId = userIdRaw.toString();

        const newRoom = getRoom(lat, long);

        // idempotent room join + presence update
        const prevRoom = await pubClient.get(`user_room:${userId}`);

        // same room rejoin (e.g. minor location change) - just update presence
        if (prevRoom === newRoom) {
          await pubClient.sAdd(`online_users:${newRoom}`, userId);

          const count = await pubClient.sCard(`online_users:${newRoom}`);
          socket.emit("online_users_count", count);

          return;
        }

        // leave previous room + update presence
        if (prevRoom) {
          socket.leave(prevRoom);

          try {
            const removed = await pubClient.sRem(
              `online_users:${prevRoom}`,
              userId
            );

            if (removed) {
              const count = await pubClient.sCard(
                `online_users:${prevRoom}`
              );

              io.to(prevRoom).emit("online_users_count", count);
            }
          } catch (err) {
            console.error("Redis remove error:", err);
          }
        }

        // join new room + update presence
        socket.join(newRoom);

        try {
          await pubClient.sAdd(`online_users:${newRoom}`, userId);

          // single room per user (update REDIS)
          await pubClient.set(`user_room:${userId}`, newRoom, {
            EX: 60 * 60, // 1 hour TTL
          });

          const count = await pubClient.sCard(
            `online_users:${newRoom}`
          );

          socket.emit("online_users_count", count);
          socket.to(newRoom).emit("online_users_count", count);

        } catch (err) {
          console.error("Redis add error:", err);
        }

        // fetch messages cache first
        let messages: any[] = [];

        try {
          const redisMessages = await pubClient.lRange(
            `recent_messages:${newRoom}`,
            0,
            49
          );

          if (redisMessages.length > 0) {
            messages = redisMessages.map((msg) => JSON.parse(msg));
          }
        } catch (err) {
          console.error("Redis fetch error:", err);
        }

        // fallback to mongodb
        if (messages.length === 0) {
          const dbMessages = await Message.find({ roomId: newRoom })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

          messages = dbMessages;

          // rebuild Redis cache for this room (if DB has messages)
          if (dbMessages.length > 0) {
            try {
              const pipeline = pubClient.multi();

              dbMessages
                .slice() // avoid mutation
                .reverse()
                .forEach((msg) => {
                  pipeline.rPush(
                    `recent_messages:${newRoom}`,
                    JSON.stringify(msg)
                  );
                });

              pipeline.lTrim(`recent_messages:${newRoom}`, 0, 49);
              pipeline.expire(`recent_messages:${newRoom}`, 3600);

              await pipeline.exec();
            } catch (err) {
              console.error("Redis rebuild error:", err);
            }
          }
        }

        // send most recent 50 messages (newest last)
        socket.emit("recent_messages", messages.reverse());

      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", "Failed to update location");
      }
    }
  );
};