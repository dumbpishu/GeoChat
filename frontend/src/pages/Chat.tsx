import { useEffect, useRef, useState } from "react";
import { MapPin, Users, Send, Paperclip, X, Loader2 } from "lucide-react";
import { useLocationStore } from "@/store/location.store";
import { useChatStore } from "@/store/chat.store";
import { useUserStore } from "@/store/user.store";
import { socketService } from "@/services/socket.service";
import { LocationLoading, LocationError } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";

export const Chat = () => {
  const { location, loading: locationLoading, error: locationError, fetchLocation } = useLocationStore();
  const { onlineUsersCount } = useChatStore();
  const user = useUserStore((state) => state.user);
  const hasConnectedRef = useRef(false);

  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: string; file?: File }[]>([]);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    if (!location || hasConnectedRef.current) return;

    hasConnectedRef.current = true;
    socketService.connect();

    setTimeout(() => {
      socketService.updateLocation(location.lat, location.long);
    }, 500);
  }, [location]);

  const handleSend = async () => {
    if (!messageText.trim() && previewMedia.length === 0) return;
    if (sending) return;

    setSending(true);

    try {
      let uploadedMedia: { url: string; type: string }[] = [];

      if (previewMedia.length > 0) {
        const files = previewMedia.map(m => m.file).filter(Boolean) as File[];
        const { uploadChatMediaApi } = await import("@/api/chat.api");
        uploadedMedia = await uploadChatMediaApi(files);
      }

      socketService.sendMessage(messageText.trim(), uploadedMedia.length > 0 ? uploadedMedia : undefined);
      setMessageText("");
      setPreviewMedia([]);
    } catch (error: any) {
      console.error("Failed to send:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (previewMedia.length >= 1) return;

    const file = files[0];
    const isImage = file.type.startsWith("image/");
    
    setPreviewMedia([{
      url: URL.createObjectURL(file),
      type: isImage ? "image" : "file",
      file
    }]);
    e.target.value = "";
  };

  const removePreview = (index: number) => {
    setPreviewMedia(prev => prev.filter((_, i) => i !== index));
  };

  if (locationLoading) {
    return <LocationLoading />;
  }

  if (locationError || !location) {
    return <LocationError onRetry={() => {}} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <header className="flex-none h-14 px-4 md:px-6 flex items-center justify-between border-b border-sky-300">
        <div className="flex items-center gap-4">
          <a 
            href="/"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 transition-all duration-300 hover:scale-105"
          >
            <MapPin className="w-5 h-5 text-white" />
          </a>
          <div>
            <h3 className="text-base font-semibold text-slate-800 tracking-tight">GeoChat</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-slate-400">{location.city || location.country || "Local Area"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 rounded-full border border-sky-100">
            <Users className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-slate-600">{onlineUsersCount}</span>
            <span className="text-xs text-slate-400">online</span>
          </div>
          
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-9 h-9 rounded-full ring-2 ring-sky-100 object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-sky-100">
              {user?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList />
      </div>

      {/* Preview Media */}
      {previewMedia.length > 0 && (
        <div className="flex-none px-6 py-3 border-t border-sky-300">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {previewMedia.map((media, index) => (
              <div key={index} className="relative flex-shrink-0">
                {media.type === "image" ? (
                  <img src={media.url} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-white/50 rounded-lg flex items-center justify-center">
                    <Paperclip className="w-5 h-5 text-slate-400" />
                  </div>
                )}
                <button
                  onClick={() => removePreview(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex-none px-4 md:px-6 pb-5">
        <div className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5">
          <input
            type="file"
            className="hidden"
            id="file-input"
            accept="image/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileSelect}
          />
          
          <label
            htmlFor="file-input"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-sky-500 transition-all cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
          </label>
          
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 px-3 py-2 bg-white text-sm text-slate-700 placeholder-slate-400 focus:outline-none rounded-lg"
          />
          
          <button
            onClick={handleSend}
            disabled={(!messageText.trim() && previewMedia.length === 0) || sending}
            className="w-10 h-10 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 flex items-center justify-center text-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};