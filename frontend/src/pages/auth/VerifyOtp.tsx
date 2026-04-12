import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { resendOtpApi } from "@/api/auth.api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";

export const VerifyOtp = () => {
    const location = useLocation();
    const email = location.state?.email || sessionStorage.getItem("otpEmail");
    const navigate = useNavigate();
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const verifyOtp = useAuthStore((state) => state.verifyOtp);

    useEffect(() => {
        if (!email) {
            toast.error("No email found. Please request a new OTP.");
            navigate("/auth/send-otp");
        }
    }, [email, navigate]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    if (!email) return null;

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 6);
        if (!/^\d+$/.test(pasteData)) return;
        
        const newOtp = pasteData.split("").concat(Array(6).fill("")).slice(0, 6);
        setOtp(newOtp);
        
        if (pasteData.length === 6) {
            inputRefs.current[5]?.focus();
        } else {
            inputRefs.current[pasteData.length]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpValue = otp.join("");
        if (otpValue.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }
        setIsLoading(true);
        try {
            await verifyOtp(email, otpValue);
            toast.success("OTP verified successfully!");
            navigate("/chat");
        } catch (error: any) {
            toast.error(error.message || "Failed to verify OTP. Please try again.");
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            navigate("/auth/send-otp");
            return;
        }
        
        setIsResending(true);
        try {
            await resendOtpApi(email);
            toast.success("OTP resent successfully! Please check your email.");
        } catch (error: any) {
            toast.error(error.message || "Failed to resend OTP. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="w-full">
            <button 
                onClick={() => navigate("/auth/send-otp")}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors cursor-pointer"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </button>

            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/25">
                    <Mail className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Verify Your Email</h2>
                <p className="text-slate-500">We've sent a 6-digit code to</p>
                <p className="text-slate-700 font-medium mt-1">{email}</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Enter OTP</label>
                    <div className="flex justify-center gap-2" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-lg font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-text"
                            />
                        ))}
                    </div>
                </div>

                <Button 
                    onClick={handleVerify}
                    disabled={isLoading || otp.join("").length !== 6}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-0 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        <>
                            Verify OTP
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>

                <div className="text-center">
                    <p className="text-sm text-slate-500">
                        Didn't receive the code?{" "}
                        <button 
                            onClick={handleResend}
                            disabled={isResending}
                            className="text-sky-500 hover:text-sky-600 font-medium cursor-pointer disabled:opacity-50"
                        >
                            {isResending ? "Resending..." : "Resend"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};