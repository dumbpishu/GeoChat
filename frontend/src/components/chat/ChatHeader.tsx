import { useNavigate } from "react-router-dom";
import { ChatLogo } from "@/components/ChatLogo";
import { MapPin } from "lucide-react";

type ChatHeaderProps = {
  user: { id: string; name?: string; username: string; avatar?: string; email?: string };
  isConnected: boolean;
  location: { lat: number; long: number; city?: string; country?: string } | null;
};

export const ChatHeader = ({ user, isConnected, location }: ChatHeaderProps) => {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between w-full">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
        <ChatLogo size="sm" />
        <span className="text-base font-bold text-slate-800">GeoChat</span>
      </button>
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
        
        <div>
          {user.avatar ? (
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-medium">
              {getInitials(user.name || user.username)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};