import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../utils/auth.utils";
import { env } from "../config/env";

interface AuthUser {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string;
    isDeleted?: boolean;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            throw new ApiError(401, "Unauthorized. Please log in to access this resource.");
        }

        const decoded: JwtPayload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.id) {
            throw new ApiError(401, "Unauthorized. Invalid token.");
        }

        const user = await User.findById(decoded.id);

        if (!user || user.isDeleted) {
            throw new ApiError(401, "Unauthorized. User not found.");
        }

        req.user = {
            id: user._id.toString(),
            name: user.name || "",
            email: user.email,
            username: user.username,
            avatar: user.avatar?.url || undefined,
        };

        next();
    } catch (error) {
        next(error);
    }
}