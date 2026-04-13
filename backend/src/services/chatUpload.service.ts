import cloudinary from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";

type UploadResult = {
    url: string;
    publicId: string;
    type: "image" | "video" | "audio" | "file";
    size?: number;
    originalName?: string;
}

export const uploadChatMediaService = async (fileBuffer: Buffer, mimetype: string): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "geochat/messages",
                resource_type: "auto",
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new ApiError(500, "Failed to upload media to Cloudinary"));
                    return;
                }
                let type: UploadResult["type"];
                if (mimetype.startsWith("image/")) {
                    type = "image";
                } else if (mimetype.startsWith("video/")) {
                    type = "video";
                } else if (mimetype.startsWith("audio/")) {
                    type = "audio";
                } else {
                    type = "file";
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    type,
                    size: result.bytes,
                    originalName: result.original_filename
                })
            }
        );
        stream.end(fileBuffer);
    })
}