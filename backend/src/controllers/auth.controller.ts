import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { sendOtpService, verifyOtpService } from "../services/auth.service";
import { ApiError } from "../utils/ApiError";

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await sendOtpService(email);

    res.status(200).json(new ApiResponse(200, "OTP sent successfully. Please check your email."));
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    const { user, token } = await verifyOtpService(email, otp);

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000
    })

    res.status(200).json(new ApiResponse(200, "OTP verified successfully.", user));
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
        throw new ApiError(401, "Unauthorized. Please log in to access this resource.");
    }

    res.status(200).json(new ApiResponse(200, "Current user retrieved successfully.", user));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    res.status(200).json(new ApiResponse(200, "Logged out successfully."));
})