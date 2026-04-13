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
        const userIdRaw = socket.data.userId;
        if (!userIdRaw) return;

        const userId = userIdRaw.toString();

        // get current room from REDIS (source of truth)
        const roomId = await pubClient.get(`user_room:${userId}`);
        if (!roomId) return;

        const { messageId, emoji } = data;

        // validate messageId + emoji
        if (!mongoose.Types.ObjectId.isValid(messageId)) return;

        if (!isValidEmoji(emoji)) {
          return socket.emit("error", "Invalid emoji");
        }

        // fetch message from db
        const message = await Message.findById(messageId);

        if (!message) return;

        // authorization check: ensure message belongs to the same room
        if (message.roomId.toString() !== roomId) {
          return socket.emit("error", "Unauthorized action");
        }

        // toggle reaction
        const existingIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === userId
        );

        let action: "added" | "removed" | "updated";

        if (existingIndex !== -1) {
          const existingReaction = message.reactions[existingIndex];

          if (existingReaction.emoji === emoji) {
            // remove reaction
            message.reactions.splice(existingIndex, 1);
            action = "removed";
          } else {
            // update reaction
            message.reactions[existingIndex].emoji = emoji;
            action = "updated";
          }
        } else {
          // add new reaction
          message.reactions.push({
            userId,
            emoji,
          });
          action = "added";
        }

        await message.save();

        // populate reactions for response
        const populatedMessage = await Message.findById(messageId)
          .select("reactions")
          .populate({
            path: "reactions.userId",
            select: "name username avatar",
          })
          .lean();

        if (!populatedMessage) return;

        const formattedReactions = formatMessage({
          ...message.toObject(),
          reactions: populatedMessage.reactions,
        }).reactions;

        // update Redis cache (if message is cached) - best effort, no critical failure if it fails
        try {
          // soft expire cache to force refresh on next fetch
          await pubClient.expire(`recent_messages:${roomId}`, 10);
        } catch (error) {
          console.error("Redis cache update error:", error);
        }

        // emit updated reactions to room
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