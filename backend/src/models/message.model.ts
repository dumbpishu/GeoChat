import mongoose from "mongoose";

export const messageSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            trim: true,
            required: true,
            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        text: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        media: [
            {
                url: {
                    type: String,
                    trim: true,
                    required: true,
                    maxlength: 500
                },
                type: {
                    type: String,
                    enum: ["image", "video", "audio", "file"],
                    required: true
                }
            }
        ],
        mentions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],

        reactions: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                emoji: {
                    type: String,
                    trim: true,
                    required: true
                }
            }
        ],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    }, 
    { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ roomId: 1, _id: -1 });

export const Message = mongoose.model("Message", messageSchema);