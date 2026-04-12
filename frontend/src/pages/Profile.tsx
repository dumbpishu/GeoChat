import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/user.store";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";
import { ArrowLeft, Camera, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Profile = () => {
    const user = useUserStore((state) => state.user);
    const updateUser = useUserStore((state) => state.updateUser);
    const updateAvatar = useUserStore((state) => state.updateAvatar);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const [name, setName] = useState(user?.name || "");
    const [username, setUsername] = useState(user?.username || "");
    const [isLoading, setIsLoading] = useState(false);
    const [isAvatarLoading, setIsAvatarLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = (name: string) => {
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }
        setIsAvatarLoading(true);
        try {
            await updateAvatar(file);
            toast.success("Avatar updated successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to update avatar");
        } finally {
            setIsAvatarLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleUpdateProfile = async () => {
        if (!name.trim() || !username.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        setIsLoading(true);
        try {
            await updateUser({ name: name.trim(), username: username.trim() });
            toast.success("Profile updated successfully");
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    if (!user) {
        navigate("/");
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
                    <Link to="/" className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid md:grid-cols-[240px_1fr] gap-8">
                    <div className="hidden md:block">
                        <div className="bg-white rounded-2xl border border-sky-100 p-6 sticky top-24">
                            <div className="text-center">
                                <div className="relative inline-block mb-4">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name || user.username} className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xl font-semibold shadow-md">
                                            {getInitials(user.name || user.username)}
                                        </div>
                                    )}
                                    {isAvatarLoading && (
                                        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                    <button onClick={handleAvatarClick} disabled={isAvatarLoading} className="absolute -bottom-2 -right-2 w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-sky-600 transition-colors cursor-pointer border-2 border-white disabled:opacity-50">
                                        <Camera className="w-4 h-4" />
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </div>
                                <p className="text-sm text-slate-500">Click to change</p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <div className="bg-white rounded-2xl border border-sky-100 p-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name || user.username} className="w-16 h-16 rounded-xl object-cover shadow-md" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg font-semibold shadow-md">
                                            {getInitials(user.name || user.username)}
                                        </div>
                                    )}
                                    {isAvatarLoading && (
                                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                        </div>
                                    )}
                                    <button onClick={handleAvatarClick} disabled={isAvatarLoading} className="absolute -bottom-1 -right-1 w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-md hover:bg-sky-600 transition-colors cursor-pointer border-2 border-white disabled:opacity-50">
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{name || username}</p>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="bg-white rounded-2xl border border-sky-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100">
                                <h2 className="text-lg font-semibold text-slate-800">Account Settings</h2>
                                <p className="text-sm text-slate-500">Manage your account information</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-text" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                                    <input type="email" value={user.email} disabled className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed" />
                                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                                </div>
                                <div className="pt-4">
                                    <Button onClick={handleUpdateProfile} disabled={isLoading} className="bg-sky-500 hover:bg-sky-600 border-0 cursor-pointer">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Profile"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};