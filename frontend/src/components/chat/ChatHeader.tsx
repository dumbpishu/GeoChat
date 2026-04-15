import { ChatLogo } from "@/components/ChatLogo";
import { MapPin } from "lucide-react";

type ChatHeaderProps = {
  user: { id: string; name?: string; username: string; avatar?: string };
  isConnected: boolean;
  location: { lat: number; long: number; city?: string; country?: string } | null;
};

export const ChatHeader = ({ isConnected, location }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-2">
      <ChatLogo size="sm" />
      <div>
        <h1 className="text-base font-bold text-slate-800">GeoChat</h1>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-[11px] text-slate-500">{isConnected ? 'Connected' : 'Disconnected'}</span>
          {location && (
            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
              <MapPin className="w-2.5 h-2.5" />
              {location.lat.toFixed(1)}° {location.long.toFixed(1)}°
            </span>
          )}
        </div>
      </div>
    </div>
  );
};