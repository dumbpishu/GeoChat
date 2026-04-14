import { Socket, Server } from "socket.io";
import { pubClient } from "../config/redis";
import { Message } from "../models/message.model";
import mongoose from "mongoose";
import { formatMessage } from "../utils/formatMessage";

type MediaType = {
  url: string;
  type: "image" | "video" | "audio" | "file";
};

type SendMessagePayload = {
  text?: string;
  media?: MediaType[];
  mentions?: string[];
};

export const registerMessageEvents = (io: Server, socket: Socket) => {
  
  // 🔥 SEND MESSAGE
  socket.on("send_message", async (data: SendMessagePayload) => {
    try {
      const userId = socket.data.userId?.toString();
      if (!userId) return socket.emit("error", "Unauthorized");

      // get current room (socket or Redis fallback)
      const roomId =
        socket.data.currentRoom ||
        (await pubClient.get(`user_room:${userId}`));

      if (!roomId) {
        return socket.emit("error", "User not in any room");
      }

      // ⚡ rate limit (max 5 messages/sec)
      const rateKey = `rate_limit:${userId}`;
      const count = await pubClient.incr(rateKey);

      if (count === 1) {
        await pubClient.expire(rateKey, 1);
      }

      if (count > 5) {
        return socket.emit("error", "Too many messages");
      }

      // 🧹 sanitize input
      const text = data.text?.trim() || "";
      const media = Array.isArray(data.media) ? data.media : [];
      const mentions = Array.isArray(data.mentions) ? data.mentions : [];

      if (!text && media.length === 0) {
        return socket.emit("error", "Empty message");
      }

      if (text.length > 1000) {
        return socket.emit("error", "Message too long");
      }

      // ✅ validate media
      const validMedia = media.filter(
        (m) =>
          m?.url &&
          typeof m.url === "string" &&
          ["image", "video", "audio", "file"].includes(m.type)
      );

      // ✅ validate mentions
      const validMentions = [
        ...new Set(
          mentions.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
          )
        ),
      ];

      // 💾 create message
      const messageDoc = await Message.create({
        roomId,
        senderId: userId,
        text: text || undefined,
        media: validMedia.length ? validMedia : undefined,
        mentions: validMentions.length ? validMentions : undefined,
      });

      // 🔥 populate sender + mentions (modern way)
      const populatedMessage = await Message.findById(messageDoc._id)
        .populate("senderId", "name username avatar")
        .populate("mentions", "name username avatar")
        .lean();

      if (!populatedMessage) {
        return socket.emit("error", "Failed to send message");
      }

      // 🎯 format message for frontend
      const formattedMessage = formatMessage({
        ...populatedMessage,
        reactions: [],
        reactionsCount: 0,
      });

      // 📤 send to sender
      socket.emit("new_message", {
        ...formattedMessage,
        isSender: true,
      });

      // 📤 send to others in room
      socket.to(roomId).emit("new_message", {
        ...formattedMessage,
        isSender: false,
      });

      // 🔔 notify mentioned users
      for (const mentionedUserId of validMentions) {
        const socketId = await pubClient.get(`user:${mentionedUserId}`);

        if (socketId) {
          io.to(socketId).emit("mention_notification", {
            messageId: messageDoc._id,
            roomId,
            senderId: userId,
            text: messageDoc.text,
          });
        }
      }

    } catch (error) {
      console.error("send_message error:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  // 👀 MESSAGE SEEN EVENT
  socket.on("message_seen", async ({ messageId }) => {
    try {
      const userId = socket.data.userId?.toString();
      if (!userId || !messageId) return;

      const roomId =
        socket.data.currentRoom ||
        (await pubClient.get(`user_room:${userId}`));

      if (!roomId) return;

      // notify others in room
      socket.to(roomId).emit("message_seen", {
        messageId,
        seenBy: userId,
      });

    } catch (err) {
      console.error("message_seen error:", err);
    }
  });
};