import mongoose from "mongoose";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import cloudinary from "../config/cloudinary";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const updateUserService = async (userId: string, updateData: { name?: string; username?: string }) => {
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found.");
    }

    if (updateData.username && updateData.username !== user.username) {
        const existingUser = await User.findOne({ username: updateData.username });
        if (existingUser) {
            throw new ApiError(400, "Username is already taken. Please choose a different one.");
        }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    return {
        id: updatedUser!._id.toString(),
        name: updatedUser!.name || "",
        email: updatedUser!.email,
        username: updatedUser!.username,
        avatar: updatedUser!.avatar?.url || undefined,
    };
}

export const updateUserAvatarService = async (userId: string, fileBuffer: Buffer) => {
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found.");
    }

    if (user.avatar && user.avatar.publicId) {
        try {
            await cloudinary.uploader.destroy(user.avatar.publicId);
        } catch (error) {
            console.error("Error deleting old avatar from Cloudinary:", error);
        }
    }

    const uploadResult = await uploadToCloudinary(fileBuffer, "geochat/avatars");

    user.avatar = {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
    };

    await user.save();

    return {
        id: user._id.toString(),
        name: user.name || "",
        email: user.email,
        username: user.username,
        avatar: user.avatar.url,
    };
}

export const deleteUserService = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
        throw new ApiError(404, "User not found.");
    }

    user.isDeleted = true;
    await user.save();
}

export const searchMentionsUsersService = async (query: string, currentUserId?: string) => {
    if (!query) {
        return [];
    }

    const searchQuery = query.replace("@", "").trim();
    if (!searchQuery) {
        return [];
    }

    const filter: any = {
        $or: [
            { username: { $regex: searchQuery, $options: "i" } },
            { name: { $regex: searchQuery, $options: "i" } }
        ],
        isDeleted: { $ne: true }
    };

    if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
        filter._id = { $ne: new mongoose.Types.ObjectId(currentUserId) };
        console.log(`[SEARCH] Excluding user: ${currentUserId}`);
    } else {
        console.log(`[SEARCH] Not excluding - invalid currentUserId`);
    }

    const users = await User.find(filter).select("_id name username avatar").limit(10);

    return users.map(user => ({
        id: user._id.toString(),
        name: user.name || "",
        username: user.username,
        avatar: user.avatar?.url || undefined,
    }));
}