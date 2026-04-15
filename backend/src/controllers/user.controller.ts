import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { updateUserService, updateUserAvatarService, deleteUserService, searchMentionsUsersService } from "../services/user.service";
import { ApiError } from "../utils/ApiError";

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { name, username } = req.body;

    const updatedUser = await updateUserService(userId, { name, username });

    res.status(200).json(new ApiResponse(200, "User updated successfully.", updatedUser));
});

export const updateUserAvatar = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    if (!req.file || !req.file.buffer) {
        throw new ApiError(400, "No file uploaded. Please provide an image file for the avatar.");
    }

    const updatedUser = await updateUserAvatarService(userId, req.file.buffer);

    res.status(200).json(new ApiResponse(200, "User avatar updated successfully.", updatedUser));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    await deleteUserService(userId);

    res.status(200).json(new ApiResponse(200, "User account deleted successfully."));
});

export const searchMentionsUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query;
    const currentUserId = req.user?.id;

    if (typeof q !== "string" || q.trim() === "") {
        throw new ApiError(400, "Query parameter is required and must be a non-empty string.");
    }

    const users = await searchMentionsUsersService(q, currentUserId);

    res.status(200).json(new ApiResponse(200, "Users found.", users));
});