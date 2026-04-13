import multer from "multer";
import { ApiError } from "../utils/ApiError";

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
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ApiError(400, "Unsupported file type. Allowed types: JPEG, PNG, WEBP, MP4, MKV, MP3, WAV, PDF."));
        }
    }
})