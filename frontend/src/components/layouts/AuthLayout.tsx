import { Outlet } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-sky-100/50 to-transparent" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl" />
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl" />
            
            <div className="w-full max-w-md p-6 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-11 h-11 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/25">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <Link to="/" className="text-2xl font-bold text-slate-800 cursor-pointer">GeoChat</Link>
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