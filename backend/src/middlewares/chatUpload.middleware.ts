import "express";
import multer, { FileFilterCallback } from "multer";
import { ApiError } from "../utils/ApiError";
import { Request } from "express";

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/mkv",
  "audio/mpeg",
  "audio/wav",
  "application/pdf",
];

export const chatUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ApiError(400, "Unsupported file type. Allowed types: JPEG, PNG, WEBP, MP4, MKV, MP3, WAV, PDF."));
        }
    }
})