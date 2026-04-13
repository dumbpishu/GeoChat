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
    console.log(`Received send_message from ${socket.id}:`, data);
    try {
      const userId = socket.data.userId;
      const roomId = socket.data.currentRoom;

      console.log(`User ID: ${userId}, Room ID: ${roomId}`);

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
      const formattedMessage = formatMessage({
        ...messageDoc.toObject(),
        reactions: [], // new message has no reactions
      });

      // cache in Redis (LPUSH + LTRIM for recent messages)
      try {
        await pubClient.lPush(
          `recent_messages:${roomId}`,
          JSON.stringify(formattedMessage)
        );

        await pubClient.lTrim(`recent_messages:${roomId}`, 0, 49);
      } catch (err) {
        console.error("Redis cache error:", err);
      }

        // emit to room
      socket.emit("new_message", { ...formattedMessage, isSender: true }); // send to sender
      socket.to(roomId).emit("new_message", { ...formattedMessage, isSender: false }); // send to others

      // notify mentioned users
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
          } else {
            // user offline - could store notifications in DB for later retrieval

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

  socket.on("message_seen", ({ messageId }) => {
    try {
        const roomId = socket.data.currentRoom;
        const userId = socket.data.userId;

        if (!roomId || !userId || !messageId) return;

        // notify sender (and others if needed)
        socket.to(roomId).emit("message_seen", {
        messageId,
        seenBy: userId,
        });

    } catch (err) {
        console.error("message_seen error:", err);
    }
  });
};