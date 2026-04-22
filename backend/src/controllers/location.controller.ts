import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { getLocationByIpService } from "../services/ipLocation.service";
import { ApiError } from "../utils/ApiError";

const getClientIp = (req: Request): string => {
    let ip =
        (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0].trim() ||
        req.socket.remoteAddress ||
        req.ip ||
        "";

    // Normalize IPv6 → IPv4
    if (ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }

    return ip;
};

const isPrivateIp = (ip: string) => {
    return (
        ip === "127.0.0.1" ||
        ip === "::1" ||
        ip.startsWith("192.168.") ||
        ip.startsWith("10.") ||
        ip.startsWith("172.")
    );
};

export const getLocationByIp = asyncHandler(async (req: Request, res: Response) => {
    const isDevelopment = process.env.NODE_ENV === "development";

    let ip = getClientIp(req);

    if (!ip) {
        throw new ApiError(400, "Unable to detect IP address");
    }

    // Handle local/private IP
    if (isPrivateIp(ip)) {
        if (isDevelopment) {
            ip = "8.8.8.8"; // fallback for testing
        } else {
            throw new ApiError(400, "Cannot determine location for private IP");
        }
    }

    const locationData = await getLocationByIpService(ip);

    res
        .status(200)
        .json(new ApiResponse(200, "Location fetched successfully", locationData));
});