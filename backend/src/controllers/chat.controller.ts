import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { uploadChatMediaService } from "../services/chatUpload.service";

export const uploadChatMedia = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        throw new ApiError(400, "No media files uploaded. Please provide at least one file.");
    }

    if (files.length > 10) {
        throw new ApiError(400, "Maximum 10 files is allowed.")
    }

    const uploadPromise = files.map((file) => {
        if (!file.buffer || !file.mimetype) return null;

        return uploadChatMediaService(file.buffer, file.mimetype).catch((error) => {
            console.error("Error uploading file to Cloudinary:", error);
            return null;
        });
    });

    const results = await Promise.all(uploadPromise);

    const uploadResults = results.filter(Boolean);

    if (uploadResults.length === 0) {
        throw new ApiError(500, "Failed to upload files.")
    }

    return res.status(200).json(new ApiResponse(200, "Files uploaded successfully.", uploadResults));
})