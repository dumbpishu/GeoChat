import { Socket, Server } from "socket.io";
import { getRoom } from "../utils/room";
import { pubClient } from "../config/redis";
import { Message } from "../models/message.model";
import { formatMessage } from "../utils/formatMessage";

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
        }

        // join new
        socket.join(newRoom);
        socket.data.currentRoom = newRoom;

        // 🔥 ONLY DB FETCH
        const messages = await Message.find({ roomId: newRoom })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate("senderId", "name username avatar")
        .populate("mentions", "name username avatar")
        .populate("reactions.userId", "name username avatar")
        .lean();

        const formattedMessages = messages.map((msg) => formatMessage(msg));
        socket.emit("recent_messages", formattedMessages.reverse());
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", "Failed to update location");
      }
    }
  );
};