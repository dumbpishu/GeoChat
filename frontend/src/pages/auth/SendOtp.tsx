import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Sparkles } from "lucide-react";

export const SendOtp = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const sendOtp = useAuthStore((state) => state.sendOtp);

    const handleSendOtp = async () => {
        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }
        setIsLoading(true);
        try {
            await sendOtp(email);
            toast.success("OTP sent successfully! Please check your email.");
            navigate("/auth/verify-otp", { state: { email } });
        } catch (error: any) {
            toast.error(error.message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to GeoChat</h2>
                <p className="text-slate-500">Enter your email to get started</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                        />
                    </div>
                </div>

                <Button 
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-0 font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                        </span>
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-500 justify-center">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>Join thousands of users connecting locally</span>
                </div>
            </div>
        </div>
    );
};