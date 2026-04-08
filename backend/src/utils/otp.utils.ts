import crypto from "crypto";

export const generateOtp = () => {
    const otp = crypto.randomInt(100000, 999999).toString();
    return otp;
}

export const hashOtp = (otp: string) => {
    const hash = crypto.createHash("sha256").update(otp).digest("hex");
    return hash;
}

export const otpTemplate = (otp: string) => {
    return `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; padding:20px;">

        <h3>Your OTP code is:</h3>

        <p style="font-size:30px; font-weight:bold;">
            ${otp}
        </p>

        <p>This code will expire in 2 minutes.</p>

    </body>
    </html>
    `;
};