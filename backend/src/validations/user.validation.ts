import { z } from "zod";

export const updateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long")
        .optional(),

    username: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters long")
        .max(30, "Username must be at most 30 characters long")
        .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers and underscore")
        .optional(),
}).refine(
    (data) =>
        (data.name && data.name.trim() !== "") ||
        (data.username && data.username.trim() !== ""),
    {
        message: "At least one of name or username must be provided",
    }
);