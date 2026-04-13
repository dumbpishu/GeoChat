import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";
import { JwtPayload } from "../utils/auth.utils";
import { env } from "../config/env";

export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
            return next(new Error("Authentication required"));
        }

        const cookies = cookie.parse(cookieHeader);
        const token = cookies.token;

        if (!token) {
            return next(new Error("Authentication required"));
        }

        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        if (!decoded || !decoded.id) {
            return next(new Error("Authentication required"));
        }

        socket.data.userId = decoded.id;
        next();
    } catch (error) {
        return next(new Error("Authentication required"));
    }
}