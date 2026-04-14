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
  socket.on("send_message", async (data: SendMessagePayload) => {
    try {
      const userId = socket.data.userId?.toString();
      if (!userId) return socket.emit("error", "Unauthorized");

      // fetch current room from socket data or Redis (handles edge cases)
      const roomId =
        socket.data.currentRoom ||
        (await pubClient.get(`user_room:${userId}`));

      if (!roomId) {
        return socket.emit("error", "User not in any room");
      }

      // rate limit: max 5 messages per second
      const rateKey = `rate_limit:${userId}`;
      const count = await pubClient.incr(rateKey);

      if (count === 1) {
        await pubClient.expire(rateKey, 1);
      }

      if (count > 5) {
        return socket.emit("error", "Too many messages");
      }

      // input validation
      const text = data.text?.trim() || "";
      const media = Array.isArray(data.media) ? data.media : [];
      const mentions = Array.isArray(data.mentions)
        ? data.mentions
        : [];

      if (!text && media.length === 0) {
        return socket.emit("error", "Empty message");
      }

      if (text.length > 1000) {
        return socket.emit("error", "Message too long");
      }

      const validMedia = media.filter(
        (m) =>
          m?.url &&
          typeof m.url === "string" &&
          m.url.trim() !== "" &&
          ["image", "video", "audio", "file"].includes(m.type)
      );

      const validMentions = [
        ...new Set(
          mentions.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
          )
        ),
      ];

      // create message in DB
      const messageDoc = await Message.create({
        roomId,
        senderId: userId,
        text: text || undefined,
        media: validMedia.length ? validMedia : undefined,
        mentions: validMentions.length ? validMentions : undefined,
      });

      const formattedMessage = formatMessage({
        ...messageDoc.toObject(),
        reactions: [],
      });

      // cache recent messages in Redis (latest 50)
      try {
        const pipeline = pubClient.multi();

        pipeline.lPush(
          `recent_messages:${roomId}`,
          JSON.stringify(formattedMessage)
        );

        pipeline.lTrim(`recent_messages:${roomId}`, 0, 49);
        pipeline.expire(`recent_messages:${roomId}`, 3600);

        await pipeline.exec();
      } catch (err) {
        console.error("Redis cache error:", err);

        // if cache fails, we can choose to ignore (messages will still be stored in DB)
        try {
          await pubClient.del(`recent_messages:${roomId}`);
        } catch (delErr) {
          console.error("Cache delete error:", delErr);
        }
      }

      // emit message to sender and others in room
      socket.emit("new_message", {
        ...formattedMessage,
        isSender: true,
      });

      socket.to(roomId).emit("new_message", {
        ...formattedMessage,
        isSender: false,
      });

      // emit mention notifications
      for (const mentionedUserId of validMentions) {
        try {
          const socketId = await pubClient.get(
            `user:${mentionedUserId}`
          );

          if (socketId) {
            io.to(socketId).emit("mention_notification", {
              messageId: messageDoc._id,
              roomId,
              senderId: userId,
              text: messageDoc.text,
            });
          }
        } catch (err) {
          console.error("Mention error:", err);
        }
      }
    } catch (error) {
      console.error("send_message error:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  // message seen event
  socket.on("message_seen", async ({ messageId }) => {
    try {
      const userId = socket.data.userId?.toString();
      if (!userId || !messageId) return;

      const roomId =
        socket.data.currentRoom ||
        (await pubClient.get(`user_room:${userId}`));

      if (!roomId) return;

      socket.to(roomId).emit("message_seen", {
        messageId,
        seenBy: userId,
      });
    } catch (err) {
      console.error("message_seen error:", err);
    }
  });
};