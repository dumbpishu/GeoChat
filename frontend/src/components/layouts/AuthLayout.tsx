import { Outlet, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { ChatLogo } from "@/components/ChatLogo";

export const AuthLayout = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-100/50 to-transparent" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl" />
            
            <div className="w-full max-w-md p-6 relative z-10">
                <div className="flex items-center justify-center mb-8">
                    <button onClick={() => navigate("/")} className="hover:opacity-80 transition-opacity cursor-pointer">
                        <ChatLogo size="lg" />
                    </button>
                </div>
                <div className="p-8 bg-white/80 border border-white/50 rounded-2xl shadow-xl shadow-slate-200/50 backdrop-blur-sm">
                    <Outlet />
                </div>
                <p className="text-center text-slate-500 text-sm mt-6">
                    By continuing, you agree to our Terms & Privacy Policy
                </p>
            </div>
        </div>
    );
};