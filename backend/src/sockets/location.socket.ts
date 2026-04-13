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

        const userId = socket.data.userId;
        if (!userId) return;

        const newRoom = getRoom(lat, long);
        const currentRoom = socket.data.currentRoom;

        if (currentRoom === newRoom) return;

        // leave old room
        if (currentRoom) {
          socket.leave(currentRoom);

          try {
            const removed = await pubClient.sRem(
              `online_users:${currentRoom}`,
              userId
            );

            if (removed) {
              const count = await pubClient.sCard(
                `online_users:${currentRoom}`
              );
              io.to(currentRoom).emit("online_users_count", count);
            }
          } catch (err) {
            console.error("Redis remove error:", err);
          }
        }

        // join new room
        socket.join(newRoom);
        socket.data.currentRoom = newRoom;

        try {
          const added = await pubClient.sAdd(
            `online_users:${newRoom}`,
            userId
          );

          const count = await pubClient.sCard(
            `online_users:${newRoom}`
          );

          socket.emit("online_users_count", count);

          if (added) {
            socket.to(newRoom).emit("online_users_count", count);
          }
        } catch (err) {
          console.error("Redis add error:", err);
        }

        // fetch messages - first try Redis cache
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

        // fallback to MongoDB if cache miss
        if (messages.length === 0) {
          const dbMessages = await Message.find({ roomId: newRoom })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

          messages = dbMessages;

          // rebuild Redis cache asynchronously (don't await)
          if (dbMessages.length > 0) {
            try {
              const pipeline = pubClient.multi();

              // reverse → so oldest goes first for rPush
              dbMessages.reverse().forEach((msg) => {
                pipeline.rPush(
                  `recent_messages:${newRoom}`,
                  JSON.stringify(msg)
                );
              });

              // keep only last 50
              pipeline.lTrim(`recent_messages:${newRoom}`, 0, 49);

              // TTL (1 hour)
              pipeline.expire(`recent_messages:${newRoom}`, 3600);

              await pipeline.exec();
            } catch (err) {
              console.error("Redis rebuild error:", err);
            }
          }
        }

        // send messages to client in chronological order
        socket.emit("recent_messages", messages.reverse());

      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", "Failed to update location");
      }
    }
  );
};