import { Socket, Server } from "socket.io";
import { pubClient } from "../config/redis";
import { Message } from "../models/message.model";
import mongoose from "mongoose";

type MediaType = {
    url: string;
    type: "image" | "video" | "audio" | "file";
}

type SendMessagePayload = {
    text?: string;
    media?: MediaType[];
    mentions?: string[]; 
}

export const registerMessageEvents = (io: Server, socket: Socket) => {
    socket.on("send_message", async (data: SendMessagePayload) => {
        try {
            const userId = socket.data.userId;
            const roomId = socket.data.currentRoom;

            if (!userId || !roomId) {
                return socket.emit("error", "User not authenticated or location not set");
            }

            // rate limiting
            const rateLimitKey = `rate_limit:${userId}`;
            const currentCount = await pubClient.incr(rateLimitKey);

            if (currentCount === 1) {
                await pubClient.expire(rateLimitKey, 1); // 1 second window
            }

            if (currentCount > 5) { 
                return socket.emit("error", "You are sending messages too fast. Please slow down.");
            }

            const text = data.text?.trim() || "";
            const media = Array.isArray(data.media) ? data.media : [];
            const mentions = Array.isArray(data.mentions) ? data.mentions : [];

            if (!text && media.length === 0) {
                return socket.emit("error", "Message must contain text or media");
            }

            // valid media items
            const validMedia = media.filter(item => {
                return item.url && typeof item.url === "string" && item.url.trim() !== "" &&
                    ["image", "video", "audio", "file"].includes(item.type);
            });

            // valid mentions
            const validMentions = [...new Set(mentions)].filter(id => mongoose.Types.ObjectId.isValid(id));

            const messageDoc = await Message.create({
                roomId,
                senderId: userId,
                text: text || undefined,
                media: validMedia.length > 0 ? validMedia : undefined,
                mentions: validMentions.length > 0 ? validMentions : undefined
            });

            const message = {
                id: messageDoc._id,
                roomId: messageDoc.roomId,
                senderId: messageDoc.senderId,
                text: messageDoc.text,
                media: messageDoc.media,
                mentions: messageDoc.mentions,
                reactions: messageDoc.reactions,
                createdAt: messageDoc.createdAt,
                updatedAt: messageDoc.updatedAt
            };
             

            await pubClient.lPush(`chat:${roomId}`, JSON.stringify(message));
            await pubClient.lTrim(`chat:${roomId}`, 0, 49);

            io.to(roomId).emit("new_message", message);

            // later we will send notifications to mentioned users here
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("error", "Failed to send message");
        }
    })
}