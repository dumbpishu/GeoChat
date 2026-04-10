import { api } from "@/lib/axios";

export const sendOtp = async (email: string) => {
    try {
        const response = await api.post("/api/auth/send-otp", { email });
        return response.data;
    } catch (error) {
        throw new Error("Failed to send OTP");
    }
}

export const verifyOtp = async (email: string, otp: string) => {
    try {
        const response = await api.post("/api/auth/verify-otp", { email, otp });
        return response.data;
    } catch (error) {
        throw new Error("Failed to verify OTP");
    }
}

export const getCurrentUser = async () => {
    try {
        const response = await api.get("/api/auth/me");
        return response.data;
    } catch (error) {
        throw new Error("Failed to fetch current user");
    }
}

export const logout = async () => {
    try {
        await api.post("/api/auth/logout");
    } catch (error) {
        throw new Error("Failed to logout");
    }
}