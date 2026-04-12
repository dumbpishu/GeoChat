import { api } from "@/lib/axios";

export const sendOtpApi = async (email: string) => {
    try {
        const response = await api.post("/api/auth/send-otp", { email });
        return response.data?.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to send OTP");
    }
}

export const verifyOtpApi = async (email: string, otp: string) => {
    try {
        const response = await api.post("/api/auth/verify-otp", { email, otp });
        return response.data?.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to verify OTP");
    }
}

export const resendOtpApi = async (email: string) => {
    try {
        const response = await api.post("/api/auth/resend-otp", { email });
        return response.data?.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to resend OTP");
    }
}

export const getCurrentUserApi = async () => {
    try {
        const response = await api.get("/api/auth/me");
        return response.data?.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to fetch current user");
    }
}

export const logoutApi = async () => {
    try {
        await api.post("/api/auth/logout");
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Failed to logout");
    }
}