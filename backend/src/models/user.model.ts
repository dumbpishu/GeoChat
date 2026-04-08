import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            minlength: 3,
            maxlength: 50
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            minlength: 5,
            maxlength: 100,
            required: true
        },
        username: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            minlength: 3,
            maxlength: 30,
            required: true
        },
        avatar: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }
);

export const User = mongoose.model("User", userSchema);
