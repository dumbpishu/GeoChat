import { Server, Socket } from "socket.io";
import { Message } from "../models/message.model";
import { isValidEmoji } from "../utils/emoji";
import mongoose from "mongoose";

export const registerReactionEvents = (io: Server, socket: Socket) => {

  socket.on(
    "toggle_reaction",
    async (data: { messageId: string; emoji: string }) => {
      try {
        const userId = socket.data.userId;
        const roomId = socket.data.currentRoom;

        if (!userId || !roomId) return;

        const { messageId, emoji } = data;

        if (!mongoose.Types.ObjectId.isValid(messageId)) return;

        if (!isValidEmoji(emoji)) {
          return socket.emit("error", "Invalid emoji");
        }

        const message = await Message.findById(messageId);

        if (!message) return;

        // find existing reaction by this user
        const existingIndex = message.reactions.findIndex(
          (r) => r.userId.toString() === userId.toString()
        );

        let action = "";

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

        // notify room about reaction change
        io.to(roomId).emit("reaction_updated", {
          messageId,
          userId,
          emoji,
          action, // added | updated | removed
        });

      } catch (err) {
        console.error("reaction error:", err);
        socket.emit("error", "Failed to update reaction");
      }
    }
  );
};