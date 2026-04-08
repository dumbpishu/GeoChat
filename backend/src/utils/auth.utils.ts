import jwt, { Secret, SignOptions } from "jsonwebtoken";

export type JwtPayload = {
    id: string;
}

export const generateToken = (payload: JwtPayload) => {

    const secret = process.env.JWT_SECRET as Secret;
    const expiresIn = process.env.JWT_EXPIRY as SignOptions["expiresIn"];

    return jwt.sign(payload, secret, { expiresIn });
}