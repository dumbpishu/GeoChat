import { create } from "zustand";
import { getCurrentUserApi, sendOtpApi, verifyOtpApi, logoutApi } from "@/api/auth.api";
import { useUserStore } from "./user.store";

type AuthState = {
    loading: boolean;

    initAuth: () => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    loading: true,

    initAuth: async () => {
        try {
            const userData = await getCurrentUserApi();
            useUserStore.getState().setUser(userData);
            set({ loading: false });
        } catch (error) {
            useUserStore.getState().clearUser();
        } finally {
            set({ loading: false });
        }
    },

    sendOtp: async (email) => {
        if (!email) {
            throw new Error("Email is required");
        }

        await sendOtpApi(email);
        sessionStorage.setItem("otpEmail", email);
    },

    verifyOtp: async (email, otp) => {
        if (!email || !otp) {
            throw new Error("Email and OTP are required");
        }

        const userData = await verifyOtpApi(email, otp);
        useUserStore.getState().setUser(userData);
        sessionStorage.removeItem("otpEmail");
    },

    logout: async () => {
        set({ loading: true });

        try {
            await logoutApi();
            useUserStore.getState().clearUser();
        } finally {
            set({ loading: false });
        }
    }
}))