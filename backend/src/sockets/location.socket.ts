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

        // atomic get-set to update room and get previous value
        const prevRoom = await pubClient.getSet(
          `user_room:${userId}`,
          newRoom
        );

        // if user is already in the correct room, do nothing
        if (prevRoom === newRoom) {
          return;
        }

        // user left previous room
        if (prevRoom) {
          socket.leave(prevRoom);

          const removed = await pubClient.sRem(
            `online_users:${prevRoom}`,
            userId
          );

          // only update if something changed
          if (removed === 1) {
            const prevCount = await pubClient.sCard(
              `online_users:${prevRoom}`
            );

            io.to(prevRoom).emit("online_users_count", prevCount);
          }
        }

        // join new room
        socket.join(newRoom);
        socket.data.currentRoom = newRoom;

        const added = await pubClient.sAdd(
          `online_users:${newRoom}`,
          userId
        );

        const count = await pubClient.sCard(
          `online_users:${newRoom}`
        );

        // always send to self
        socket.emit("online_users_count", count);

        // only notify others if state changed
        if (added === 1) {
          socket.to(newRoom).emit("online_users_count", count);
        }

        // fetch recent messages for new room

        let messages: any[] = [];

        const redisMessages = await pubClient.lRange(
          `recent_messages:${newRoom}`,
          0,
          49
        );

        if (redisMessages.length > 0) {
          messages = redisMessages
            .map((msg) => {
              try {
                return JSON.parse(msg);
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        } else {
          const dbMessages = await Message.find({ roomId: newRoom })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

          messages = dbMessages;

          if (dbMessages.length > 0) {
            const lock = await pubClient.set(
              `lock:messages:${newRoom}`,
              "1",
              { NX: true, EX: 5 }
            );

            if (lock) {
              const pipeline = pubClient.multi();

              dbMessages.forEach((msg) => {
                pipeline.lPush(
                  `recent_messages:${newRoom}`,
                  JSON.stringify(msg)
                );
              });

              pipeline.lTrim(`recent_messages:${newRoom}`, 0, 49);
              pipeline.expire(`recent_messages:${newRoom}`, 3600);

              await pipeline.exec();
            }
          }
        }

        // UI → oldest → newest
        socket.emit("recent_messages", messages.reverse());
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", "Failed to update location");
      }
    }
  );
};