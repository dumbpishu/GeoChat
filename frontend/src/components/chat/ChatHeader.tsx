import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatLogo } from "@/components/ChatLogo";
import { MapPin, User, LogOut, ChevronRight } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

type ChatHeaderProps = {
  user: { id: string; name?: string; username: string; avatar?: string; email?: string };
  isConnected: boolean;
  location: { lat: number; long: number; city?: string; country?: string } | null;
};

export const ChatHeader = ({ user, isConnected, location }: ChatHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <ChatLogo size="sm" />
        <span className="text-base font-bold text-slate-800">GeoChat</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          {location && (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location.lat.toFixed(2)}, {location.long.toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-sky-100 transition-colors cursor-pointer"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-medium">
                {getInitials(user.name || user.username)}
              </div>
            )}
          </button>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
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
      </div>
    </div>
  );
};