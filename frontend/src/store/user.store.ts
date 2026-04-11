import { create } from "zustand";
import { getCurrentUserApi, sendOtpApi, verifyOtpApi, logoutApi } from "@/api/auth.api";

type User = {
    id: string;
    name?: string;
    email: string;
    username: string;
    avatar?: string;
}

type UserState = {
    user: User | null;
    loading: boolean;

    // actions
    initAuth: () => Promise<void>;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: JSON.parse(localStorage.getItem("currentUser") || "null"),
    loading: true,

    initAuth: async () => {
        try {
            const userData = await getCurrentUserApi();
            set({ user: userData });
            localStorage.setItem("currentUser", JSON.stringify(userData));
        } catch (error) {
            set({ user: null });
            localStorage.removeItem("currentUser");
        } finally {
            set({ loading: false });
        }
    },

    sendOtp: async (email: string) => {
        try {
            set({ loading: true });
            if (!email) {
                throw new Error("Email is required to send OTP");
            }
            await sendOtpApi(email);
            sessionStorage.setItem("emailForVerify", email);
        } finally {
            set({ loading: false });
        }
    },

    verifyOtp: async (email: string, otp: string) => {
        try {
            set({ loading: true });

            if (!email || !otp) {
                throw new Error("Both email and OTP are required for verification");
            }

            await verifyOtpApi(email, otp);
            const userData = await getCurrentUserApi();
            set({ user: userData });

            localStorage.setItem("currentUser", JSON.stringify(userData));
            sessionStorage.removeItem("emailForVerify");
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            set({ loading: true });
            await logoutApi();
            set({ user: null });
            localStorage.removeItem("currentUser");
        } finally {
            set({ loading: false });
        }
    }
}))