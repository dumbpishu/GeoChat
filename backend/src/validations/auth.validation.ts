import { z } from "zod";

export const sendOtpSchema = z.object({
    email: z.string().trim().toLowerCase().nonempty("Email is required").email("Invalid email address"),
});

export const verifyOtpSchema = z.object({
    email: z.string().trim().toLowerCase().nonempty("Email is required").email("Invalid email address"),
    otp: z.string().trim().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});

export const resendOtpSchema = z.object({
    email: z.string().trim().toLowerCase().nonempty("Email is required").email("Invalid email address"),
});