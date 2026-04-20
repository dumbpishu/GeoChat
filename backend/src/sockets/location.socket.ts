import { Socket, Server } from "socket.io";
import { User } from "../models/user.model";
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

        const user = await User.findById(userId).select("name username avatar").lean();
        const userInfo = user ? {
          _id: userId,
          name: user.name,
          username: user.username,
          avatar: (user as any).avatar?.url || (user as any).avatar,
        } : null;

        const newRoom = getRoom(data.lat, data.long);

        const prevRoom = await pubClient.getSet(
          `user_room:${userId}`,
          newRoom
        );

        const roomChanged = !prevRoom || prevRoom !== newRoom;
        const needsRejoin = !prevRoom || !socket.rooms.has(prevRoom);

        if (roomChanged) {
          if (prevRoom) {
            socket.leave(prevRoom);
            const leftUser = await User.findById(userId).select("username").lean();
            io.to(prevRoom).emit("user_left_room", { userId, username: leftUser?.username, roomId: prevRoom });
          }
          socket.join(newRoom);
          socket.data.currentRoom = newRoom;
          await pubClient.set(`user_room:${userId}`, newRoom);
          io.to(newRoom).emit("user_joined_room", { user: userInfo, roomId: newRoom });
          socketEmitRecentMessages(socket, newRoom);
        } else if (needsRejoin) {
          socket.join(prevRoom);
          socket.data.currentRoom = prevRoom;
          await pubClient.set(`user_room:${userId}`, prevRoom);
          socketEmitRecentMessages(socket, prevRoom);
        } else {
          return;
        }
      } catch (error) {
        console.error("Error updating location:", error);
        socket.emit("error", "Failed to update location");
      }
    }
  );
};

const socketEmitRecentMessages = async (socket: Socket, roomId: string) => {
  try {
    const messages = await Message.find({ roomId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("senderId", "name username avatar")
      .populate("mentions", "name username avatar")
      .populate("replyTo", "text senderId")
      .populate("replyTo.senderId", "name username avatar")
      .populate("reactions.userId", "name username avatar")
      .lean();

    const formattedMessages = messages.map((msg) => formatMessage(msg));
    socket.emit("recent_messages", formattedMessages.reverse());
  } catch (error) {
    console.error("Error updating location:", error);
    socket.emit("error", "Failed to update location");
  }
};