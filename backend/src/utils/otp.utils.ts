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
    <head>
        <meta charset="UTF-8" />
        <title>GeoChat OTP</title>
    </head>
    <body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center">
                    
                    <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; margin-top:40px; border-radius:10px; overflow:hidden;">
                        
                        <!-- Header -->
                        <tr>
                            <td style="background:#4CAF50; padding:20px; text-align:center;">
                                <h1 style="color:white; margin:0;">GeoChat</h1>
                                <p style="color:#e8f5e9; margin:5px 0 0;">Secure Communication Platform</p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:30px; text-align:center;">
                                
                                <h2 style="color:#333;">Verify Your Email</h2>
                                <p style="color:#555;">
                                    Use the OTP below to complete your verification
                                </p>

                                <!-- OTP Box -->
                                <div style="
                                    margin:25px 0;
                                    padding:15px;
                                    font-size:34px;
                                    font-weight:bold;
                                    letter-spacing:10px;
                                    background:#f1f8f5;
                                    border:2px dashed #4CAF50;
                                    display:inline-block;
                                    color:#2e7d32;
                                ">
                                    ${otp}
                                </div>

                                <p style="color:#777; font-size:14px;">
                                    ⏳ This OTP is valid for <b>5 minutes</b>
                                </p>

                                <p style="color:#999; font-size:12px; margin-top:20px;">
                                    If you didn’t request this, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background:#fafafa; padding:15px; text-align:center;">
                                <p style="font-size:12px; color:#888;">
                                    © ${new Date().getFullYear()} GeoChat. All rights reserved.
                                </p>
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};