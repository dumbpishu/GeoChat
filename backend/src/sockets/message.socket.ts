import { Socket, Server } from "socket.io";
import { pubClient } from "../config/redis";
import { Message } from "../models/message.model";
import mongoose from "mongoose";

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
      const userId = socket.data.userId;
      const roomId = socket.data.currentRoom;

      if (!userId || !roomId) {
        return socket.emit("error", "Unauthorized");
      }

      // rate limit: max 5 messages per second
      try {
        const rateKey = `rate_limit:${userId}`;
        const count = await pubClient.incr(rateKey);

        if (count === 1) {
          await pubClient.expire(rateKey, 1); // 1 sec window
        }

        if (count > 5) {
          return socket.emit("error", "Too many messages, slow down");
        }
      } catch (err) {
        console.error("Rate limit error:", err);
        // don't block message if Redis fails
      }

      // clean input
      const text = data.text?.trim() || "";
      const media = Array.isArray(data.media) ? data.media : [];
      const mentions = Array.isArray(data.mentions) ? data.mentions : [];

      if (!text && media.length === 0) {
        return socket.emit("error", "Message must contain text or media");
      }

      if (text.length > 1000) {
        return socket.emit("error", "Message too long");
      }

      // valid media items
      const validMedia = media.filter((item) => {
        return (
          item?.url &&
          typeof item.url === "string" &&
          item.url.trim() !== "" &&
          ["image", "video", "audio", "file"].includes(item.type)
        );
      });

      // unique and valid mentions
      const validMentions = [
        ...new Set(
          mentions.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
          )
        ),
      ];

      // save to MongoDB
      const messageDoc = await Message.create({
        roomId,
        senderId: userId,
        text: text || undefined,
        media: validMedia.length > 0 ? validMedia : undefined,
        mentions: validMentions.length > 0 ? validMentions : undefined,
      });

      // format message for emission
      const message = {
        _id: messageDoc._id,
        roomId: messageDoc.roomId,
        senderId: messageDoc.senderId,
        text: messageDoc.text,
        media: messageDoc.media,
        mentions: messageDoc.mentions,
        reactions: messageDoc.reactions,
        createdAt: messageDoc.createdAt,
        updatedAt: messageDoc.updatedAt,
      };

      // cache in Redis (LPUSH + LTRIM for recent messages)
      try {
        await pubClient.lPush(
          `recent_messages:${roomId}`,
          JSON.stringify(message)
        );

        await pubClient.lTrim(`recent_messages:${roomId}`, 0, 49);
      } catch (err) {
        console.error("Redis cache error:", err);
      }

      //  emit to room
      io.to(roomId).emit("new_message", message);

      // notify mentioned users
      for (const mentionedUserId of validMentions) {
        try {
          const socketId = await pubClient.get(
            `user:${mentionedUserId}`
          );

          if (socketId) {
            io.to(socketId).emit("mention_notification", {
              messageId: message._id,
              roomId,
              senderId: userId,
              text: message.text,
            });
          }
        } catch (err) {
          console.error("Mention notify error:", err);
        }
      }

    } catch (error) {
      console.error("send_message error:", error);
      socket.emit("error", "Failed to send message");
    }
  });
};