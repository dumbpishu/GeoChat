import { resend } from "../config/resend";
import { ApiError } from "../utils/ApiError";
import { otpTemplate } from "../utils/otp.utils";
import { env } from "../config/env";

export const sendEmailService = async (email: string, otp: string) => {
    try {
        await resend.emails.send({
            from: env.EMAIL_FROM,
            to: email,
            subject: "GeoChat Verification Code",
            html: otpTemplate(otp)
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Failed to send OTP email. Please try again later.");
    }
}