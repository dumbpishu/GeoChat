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

        const roomId =
          socket.data.currentRoom ||
          (await pubClient.get(`user_room:${userId}`));

        if (!roomId) return;

        const { messageId, emoji } = data;

        if (!mongoose.Types.ObjectId.isValid(messageId)) return;

        if (!isValidEmoji(emoji)) {
          return socket.emit("error", "Invalid emoji");
        }

        const message = await Message.findOne({
          _id: messageId,
          roomId,
        });

        if (!message) {
          return socket.emit("error", "Message not found");
        }

        const existingIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === userId
        );

        let action: "added" | "removed";

        if (existingIndex !== -1) {
          const existingReaction = message.reactions[existingIndex];

          if (existingReaction.emoji === emoji) {
            message.reactions.splice(existingIndex, 1);
            action = "removed";
          } else {
            message.reactions[existingIndex].emoji = emoji;
            action = "added";
          }
        } else {
          message.reactions.push({
            userId: new mongoose.Types.ObjectId(userId),
            emoji,
          });
          action = "added";
        }

        await message.save();

        const updatedMessage = await Message.findById(messageId)
          .select("reactions")
          .populate("reactions.userId", "name username avatar")
          .lean();

        if (!updatedMessage) return;

        const formatted = formatMessage(updatedMessage);

        const limitedReactions = Array.isArray(formatted.reactions) ? formatted.reactions.slice(0, 10) : [];

        io.to(roomId).emit("reaction_updated", {
          messageId,
          reactions: limitedReactions,
          reactionsCount: formatted.reactions.length,
          action,
        });
      } catch (err) {
        console.error("reaction error:", err);
        socket.emit("error", "Failed to update reaction");
      }
    }
  );
};