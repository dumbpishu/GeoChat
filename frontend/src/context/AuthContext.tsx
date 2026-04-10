import { createContext, useEffect, useState } from "react";
import { getCurrentUserApi, sendOtpApi, verifyOtpApi, logoutApi } from "@/api/auth.api";

type User = {
    id: string;
    name?: string;
    email: string;
    username: string;
    avatar?: string;
}

type AuthContextType = {
    user: User | null;
    loading: boolean;
    sendOtp: (email: string) => Promise<void>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("currentUser");
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const userData = await getCurrentUserApi();
                setUser(userData);
                localStorage.setItem("currentUser", JSON.stringify(userData));
            } catch (error) {
                setUser(null);
                localStorage.removeItem("currentUser");
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);

    const sendOtp = async (email: string) => {
        try {
            setLoading(true);

            if (!email) {
                throw new Error("Email is required to send OTP");
            }

            await sendOtpApi(email);
            localStorage.setItem("emailForVerify", email);
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (email: string, otp: string) => {
        try {
            setLoading(true);

            if (!email || !otp) {
                throw new Error("Email and OTP are required for verification");
            }

            const userData = await verifyOtpApi(email, otp);
            setUser(userData);

            localStorage.setItem("currentUser", JSON.stringify(userData));
            localStorage.removeItem("emailForVerify");
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await logoutApi();
        } finally {
            setUser(null);
            localStorage.removeItem("currentUser");
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, sendOtp, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    );
}