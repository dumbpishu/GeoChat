import multer from "multer";
import { ApiError } from "../utils/ApiError";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ApiError(400, "Only JPG, PNG, WEBP images are allowed."));
        }
    },
});