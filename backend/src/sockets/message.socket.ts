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
      const userIdRaw = socket.data.userId;
      if (!userIdRaw) return socket.emit("error", "Unauthorized");

      const userId = userIdRaw.toString();

      // get current room from REDIS (source of truth)
      const roomId = await pubClient.get(`user_room:${userId}`);

      if (!roomId) {
        return socket.emit("error", "User not in any room");
      }

      // rate limit: max 5 messages per second
      try {
        const rateKey = `rate_limit:${userId}`;
        const count = await pubClient.incr(rateKey);

        if (count === 1) {
          await pubClient.expire(rateKey, 1);
        }

        if (count > 5) {
          return socket.emit("error", "Too many messages, slow down");
        }
      } catch (err) {
        console.error("Rate limit error:", err);
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

      // valid media
      const validMedia = media.filter((item) => {
        return (
          item?.url &&
          typeof item.url === "string" &&
          item.url.trim() !== "" &&
          ["image", "video", "audio", "file"].includes(item.type)
        );
      });

      // valid mentions (must be valid ObjectId)
      const validMentions = [
        ...new Set(
          mentions.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
          )
        ),
      ];

      // save to db
      const messageDoc = await Message.create({
        roomId,
        senderId: userId,
        text: text || undefined,
        media: validMedia.length > 0 ? validMedia : undefined,
        mentions: validMentions.length > 0 ? validMentions : undefined,
      });

      const formattedMessage = formatMessage({
        ...messageDoc.toObject(),
        reactions: [],
      });

      // redis cache (recent 50 messages per room)
      try {
        const pipeline = pubClient.multi();

        pipeline.lPush(
          `recent_messages:${roomId}`,
          JSON.stringify(formattedMessage)
        );

        pipeline.lTrim(`recent_messages:${roomId}`, 0, 49);

        // refresh TTL
        pipeline.expire(`recent_messages:${roomId}`, 3600);

        await pipeline.exec();
      } catch (err) {
        console.error("Redis cache error:", err);
      }

      // emit messages
      socket.emit("new_message", {
        ...formattedMessage,
        isSender: true,
      });

      socket.to(roomId).emit("new_message", {
        ...formattedMessage,
        isSender: false,
      });

      // mentions notifications
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
            // TODO: store offline notifications
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

  // message seen
  socket.on("message_seen", async ({ messageId }) => {
    try {
      const userIdRaw = socket.data.userId;
      if (!userIdRaw || !messageId) return;

      const userId = userIdRaw.toString();

      const roomId = await pubClient.get(`user_room:${userId}`);
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