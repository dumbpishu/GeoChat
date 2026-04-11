import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

export const SendOtp = () => {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const sendOtp = useAuthStore((state) => state.sendOtp);

    const handleSendOtp = async () => {
        try {
            await sendOtp(email);
            toast.success("OTP sent successfully! Please check your email.");
            navigate("/auth/verify-otp", { state: { email } });
        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP. Please try again.");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Send OTP</h1>
            <p className="text-lg text-gray-600 mb-8">Enter your email to receive an OTP for authentication.</p>
            <input
                type="email"
                placeholder="Enter your email"
                className="w-full max-w-sm p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSendOtp} className="w-full max-w-sm px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Send OTP</button>
        </div>
    );
}