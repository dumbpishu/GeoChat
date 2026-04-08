import cloudinary from "../config/cloudinary";
import { ApiError } from "./ApiError";

type UploadResult = {
    url: string;
    publicId: string;
}

export const uploadToCloudinary = async (fileBuffer: Buffer, folder: string): Promise<UploadResult> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "auto",
            },
            (error, result) => {
                if (error || !result) {
                    reject(error || new ApiError(500, "Failed to upload image to Cloudinary"));
                    return;
                }
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );
        stream.end(fileBuffer);
    });
}