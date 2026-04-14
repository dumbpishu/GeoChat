import { Server, Socket } from "socket.io";
import { Message } from "../models/message.model";
import { isValidEmoji } from "../utils/emoji";
import mongoose from "mongoose";
import { formatMessage } from "../utils/formatMessage";
import { pubClient } from "../config/redis";

export const registerReactionEvents = (io: Server, socket: Socket) => {
  socket.on(
    "toggle_reaction",
    async (data: { messageId: string; emoji: string }) => {
      try {
        const userId = socket.data.userId?.toString();
        if (!userId) return;

        // fetch current room from socket data or Redis (handles edge cases)
        const roomId =
          socket.data.currentRoom ||
          (await pubClient.get(`user_room:${userId}`));

        if (!roomId) return;

        const { messageId, emoji } = data;

        // validate messageId
        if (!mongoose.Types.ObjectId.isValid(messageId)) return;

        if (!isValidEmoji(emoji)) {
          return socket.emit("error", "Invalid emoji");
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        // one atomic operation to handle add/remove toggle + prevent duplicates
        const pullResult = await Message.updateOne(
          { _id: messageId, roomId },
          {
            $pull: {
              reactions: { userId: userObjectId },
            },
          }
        );

        if (pullResult.matchedCount === 0) {
          return socket.emit("error", "Message not found");
        }

        // additional check to determine if we removed an existing reaction or need to add new one
        // this handles both toggle (same emoji) and change (different emoji) cases

        // check if it was already removed OR we need to add new
        let action: "added" | "removed" = "removed";

        if (pullResult.modifiedCount === 1) {
          // reaction existed → check if same emoji toggle
          const existing = await Message.findOne({
            _id: messageId,
            roomId,
            "reactions.userId": userObjectId,
          });

          if (!existing) {
            // removed case
            action = "removed";

            // BUT if user wants to change emoji, we add new one
            await Message.updateOne(
              { _id: messageId, roomId },
              {
                $push: {
                  reactions: {
                    userId: userObjectId,
                    emoji,
                  },
                },
              }
            );

            action = "added"; // treat as update
          }
        } else {
          // no previous reaction → add new
          await Message.updateOne(
            { _id: messageId, roomId },
            {
              $push: {
                reactions: {
                  userId: userObjectId,
                  emoji,
                },
              },
            }
          );

          action = "added";
        }

        // fetch updated reactions to emit (optimized with lean + select)
        const updatedMessage = await Message.findById(messageId)
          .select("reactions")
          .populate("reactions.userId", "name username avatar")
          .lean();

        if (!updatedMessage) return;

        const formattedReactions = formatMessage({
          ...updatedMessage,
        }).reactions;

        // cache invalidation (optional, can be optimized with more granular updates)
        try {
          await pubClient.del(`recent_messages:${roomId}`);
        } catch (err) {
          console.error("Redis cache delete error:", err);
        }

        // exit early if no users in room to avoid unnecessary emit
        io.to(roomId).emit("reaction_updated", {
          messageId,
          reactions: formattedReactions,
          action,
        });

      } catch (err) {
        console.error("reaction error:", err);
        socket.emit("error", "Failed to update reaction");
      }
    }
  );
};