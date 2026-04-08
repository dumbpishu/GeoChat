import { ApiError } from "../utils/ApiError";
import { Otp } from "../models/otp.model";
import { User } from "../models/user.model";
import { generateOtp, hashOtp } from "../utils/otp.utils";
import { sendEmailService } from "./email.service";
import { generateToken } from "../utils/auth.utils";

export const sendOtpService = async (email: string) => {
    const existingOtp = await Otp.findOne({ email });

    if (existingOtp && existingOtp.expiresAt > new Date()) {
        throw new ApiError(400, "An OTP has already been sent to this email. Please try again later.");
    }

    const otp = generateOtp();
    const hashedOtp = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    await Otp.findOneAndUpdate(
        { email },
        { hashedOtp, expiresAt },
        { upsert: true, new: true }
    );

    setImmediate(() => {
        sendEmailService(email, otp).catch(error => {
            console.error("Error sending OTP email:", error);
        });
    })
}

export const verifyOtpService = async (email: string, otp: string) => {
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
        throw new ApiError(400, "OTP has expired or is invalid. Please request a new one.");
    }

    const isValidOtp = hashOtp(otp) === otpRecord.hashedOtp;

    if (!isValidOtp) {
        throw new ApiError(400, "Invalid OTP. Please try again.");
    }

    let user = await User.findOne({ email });

    if (!user) {
        const username = email.split("@")[0];
        user = new User({ email, username });
        await user.save();
    }

    await Otp.deleteOne({ email });

    const token = generateToken({ id: user._id.toString() });

    return {
        user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar: user.avatar?.url || undefined,
        },
        token
    }
}