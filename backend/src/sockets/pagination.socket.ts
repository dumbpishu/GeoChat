import { Socket, Server } from "socket.io";
import { Message } from "../models/message.model";
import mongoose from "mongoose";
import { formatMessage } from "../utils/formatMessage";
import { pubClient } from "../config/redis";

export const registerPaginationEvents = (io: Server, socket: Socket) => {
  socket.on(
    "fetch_older_messages",
    async (data: { cursor?: string; limit?: number }) => {
      try {
        const userIdRaw = socket.data.userId;
        if (!userIdRaw) {
          return socket.emit("error", "Unauthorized");
        }

        const userId = userIdRaw.toString();

        // get current room from REDIS (source of truth)
        const roomId = await pubClient.get(`user_room:${userId}`);
        if (!roomId) {
          return socket.emit("error", "User not in any room");
        }

        // validate limit
        let limit = Number(data.limit) || 20;

        if (isNaN(limit) || limit <= 0) limit = 20;
        if (limit > 50) limit = 50;

        // build query
        const query: any = { roomId };

        let cursorObjectId: mongoose.Types.ObjectId | null = null;

        if (
          data.cursor &&
          typeof data.cursor === "string" &&
          mongoose.Types.ObjectId.isValid(data.cursor)
        ) {
          cursorObjectId = new mongoose.Types.ObjectId(data.cursor);
          query._id = { $lt: cursorObjectId };
        }

        // fetch messages from db
        const messages = await Message.find(query)
          .select({
            roomId: 1,
            senderId: 1,
            text: 1,
            media: 1,
            mentions: 1,
            reactions: 1,
            createdAt: 1,
            updatedAt: 1,
          })
          .populate("reactions.userId", "name username avatar")
          .sort({ _id: -1 }) // newest first
          .limit(limit + 1) // fetch extra for hasMore
          .lean();

        // check if there's more messages for pagination
        const hasMore = messages.length > limit;

        if (hasMore) {
          messages.pop(); // remove extra
        }

        // oldest → newest (UI friendly)
        const formattedMessages = messages
          .reverse()
          .map((msg) => formatMessage(msg));

        // next cursor = oldest message ID
        const nextCursor =
          formattedMessages.length > 0
            ? formattedMessages[0]._id
            : null;

        // send messages + pagination info
        socket.emit("older_messages", {
          messages: formattedMessages,
          hasMore,
          nextCursor,
        });

      } catch (error) {
        console.error("Pagination error:", error);
        socket.emit("error", "Failed to fetch older messages");
      }
    }
  );
};