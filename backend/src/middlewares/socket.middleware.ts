import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { ApiError } from "../utils/ApiError";
import { JwtPayload } from "../utils/auth.utils";

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new ApiError(401, "Authentication required"));
        }

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new ApiError(401, "Authentication required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

        if (!decoded || !decoded.id) {
            return next(new ApiError(401, "Authentication required"));
        }

        socket.data.userId = decoded.id;
        next();
    } catch (error) {
        return next(new ApiError(401, "Authentication required"));
    }
}