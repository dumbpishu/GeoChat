import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { env } from "../config/env";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err?.stack || err);

    let statusCode = 500;
    let message = "Internal Server Error";

    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    if (env.NODE_ENV === "production" && statusCode === 500) {
        message = "Something went wrong. Please try again later.";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
}