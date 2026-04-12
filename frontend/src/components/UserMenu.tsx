import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/user.store";
import { useAuthStore } from "@/store/auth.store";
import { User, LogOut, ChevronRight } from "lucide-react";

export const UserMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const user = useUserStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-sky-100 transition-colors cursor-pointer"
            >
                {user.avatar ? (
                    <img
                        src={user.avatar}
                        alt={user.name || user.username}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-sm">
                        {getInitials(user.name || user.username)}
                    </div>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200/50 z-20 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <p className="font-semibold text-slate-800 truncate">{user.name || user.username}</p>
                            <p className="text-sm text-slate-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate("/profile");
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 transition-colors cursor-pointer"
                            >
                                <User className="w-4 h-4" />
                                <span className="flex-1 text-left">Profile</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="py-2 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="flex-1 text-left">Logout</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};