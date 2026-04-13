import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
    id: string;
}

export const generateToken = (payload: JwtPayload) => {
    
    const secret = env.JWT_SECRET as Secret;
    const expiresIn = env.JWT_EXPIRY as SignOptions["expiresIn"];

    return jwt.sign(payload, secret, { expiresIn });
}