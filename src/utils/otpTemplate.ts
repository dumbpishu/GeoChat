export const otpTemplate = (otp: string) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 80px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 400px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                    <tr>
                        <td style="padding: 48px 40px 40px 40px; text-align: center;">
                            <h1 style="margin: 0 0 24px 0; font-size: 28px; font-weight: 700; color: #111827;">GeoChat</h1>
                            <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 500; color: #1f2937;">Verify your email</p>
                            <p style="margin: 0 0 28px 0; font-size: 15px; color: #6b7280;">Use the code below to sign in</p>
                            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px 20px; display: inline-block;">
                                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #2563eb; letter-spacing: 8px;">${otp}</p>
                            </div>
                            <p style="margin: 24px 0 0 0; font-size: 14px; color: #9ca3af;">Code expires in 2 minutes</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};