import { useState } from "react";
import { useLocation } from "react-router-dom";
import { verifyOtp } from "@/api/auth.api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const VerifyOtp = () => {
    const location = useLocation();
    const { email } = location.state || {};
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");

    const handleVerifyOtp = async () => {
        try {
            await verifyOtp(email, otp);
            toast.success("OTP verified successfully! You are now logged in.");
            navigate("/chat");
        } catch (error) {
            toast.error("Failed to verify OTP. Please try again.");
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Verify Your OTP</h1>
            <p className="text-lg text-gray-600 mb-6">Please enter the OTP sent to {email}.</p>
            <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full max-w-sm p-3 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button onClick={handleVerifyOtp} className="w-full max-w-sm px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Verify OTP</button>
        </div>
    );
}