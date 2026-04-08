export class ApiResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data?: any;

    constructor(statusCode: number, message: string, data?: any) {
        this.success = true;
        this.statusCode = statusCode;
        this.message = message;
        if (data !== undefined) {
            this.data = data;
        }
    }
}