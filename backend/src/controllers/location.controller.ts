import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { getLocationByIpService } from "../services/ipLocation.service";
import { ApiError } from "../utils/ApiError";


export const getLocationByIp = asyncHandler(async (req: Request, res: Response) => {
    const forwarded = req.headers["x-forwarded-for"];
    
    if (!forwarded) {
        throw new ApiError(400, "IP address is required");
    }

    const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : forwarded[0].trim();

    const locationData = await getLocationByIpService(ip);

    res.status(200).json(new ApiResponse(200, "Location data fetched successfully", locationData));
})