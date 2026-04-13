import { Socket, Server } from "socket.io";
import { Message } from "../models/message.model";
import mongoose from "mongoose";
import { formatMessage } from "../utils/formatMessage";

export const registerPaginationEvents = (io: Server, socket: Socket) => {
  socket.on(
    "fetch_older_messages",
    async (data: { cursor?: string; limit?: number }) => {
      try {
        const userId = socket.data.userId;
        const roomId = socket.data.currentRoom;

        if (!userId || !roomId) {
          return socket.emit("error", "Unauthorized");
        }

        const limit = Math.min(data.limit || 20, 50);

        const query: any = { roomId };

        if (
          data.cursor &&
          typeof data.cursor === "string" &&
          mongoose.Types.ObjectId.isValid(data.cursor)
        ) {
          query._id = { $lt: new mongoose.Types.ObjectId(data.cursor) };
        }

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
          .sort({ _id: -1 })
          .limit(limit + 1)
          .lean();

        const hasMore = messages.length > limit;

        if (hasMore) {
          messages.pop();
        }

        const formattedMessages = messages.reverse().map(msg => formatMessage(msg));

        const nextCursor =
          formattedMessages.length > 0
            ? formattedMessages[0]._id
            : null;

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