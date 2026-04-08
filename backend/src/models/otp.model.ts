import mongoose from "mongoose";

export const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            minlength: 5,
            maxlength: 100,
            required: true
        },
        hashedOtp: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
    }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);