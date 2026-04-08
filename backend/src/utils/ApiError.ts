export class ApiError extends Error {
    success: boolean;
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.success = false;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);

        Error.captureStackTrace(this, this.constructor);
    }
}