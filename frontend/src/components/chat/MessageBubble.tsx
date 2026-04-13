import { useState } from "react";
import { Paperclip, X, Check, CheckCheck } from "lucide-react";
import { useUserStore } from "@/store/user.store";
import type { Message } from "@/types/chat.types";
import { ReactionPicker, MessageReactions } from "./ReactionPicker";

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const MediaModal = ({ media, onClose }: { media: { url: string; type: string } | null; onClose: () => void }) => {
  if (!media) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      {media.type === "image" && (
        <img 
          src={media.url} 
          alt="Full size" 
          className="max-w-full max-h-full rounded-lg object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {media.type === "video" && (
        <video 
          src={media.url} 
          controls 
          className="max-w-full max-h-full rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      {media.type === "audio" && (
        <div className="bg-white rounded-lg p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <audio src={media.url} controls className="w-80" />
        </div>
      )}
      {media.type === "file" && (
        <a 
          href={media.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Download File
        </a>
      )}
    </div>
  );
};

const renderMedia = (media: { url: string; type: string }, onClick: () => void) => {
  switch (media.type) {
    case "image":
      return (
        <img
          src={media.url}
          alt="Media"
          onClick={onClick}
          className="max-w-[280px] rounded-lg object-cover shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
        />
      );
    case "video":
      return (
        <video
          src={media.url}
          controls
          onClick={onClick}
          className="max-w-[280px] rounded-lg shadow-sm cursor-pointer"
        />
      );
    case "audio":
      return (
        <div className="px-3 py-2 bg-sky-50 rounded-lg border border-sky-100">
          <audio src={media.url} controls className="w-52 h-8" />
        </div>
      );
    default:
      return (
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-sky-50 rounded-lg border border-sky-100 hover:bg-sky-100 transition-colors"
        >
          <Paperclip className="w-4 h-4 text-sky-500" />
          <span className="text-sm text-sky-600 font-medium">File</span>
        </a>
      );
  }
};

export const MessageBubble = ({ message }: { message: Message }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string } | null>(null);
  const user = useUserStore((state) => state.user);
  const isMe = message.isSender === true || message.senderId === user?.id;

  return (
    <>
      <div
        className={`flex group animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? "justify-end" : "justify-start"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsHovered(!isHovered)}
      >
        {/* Emoji button - left side for received, right side for sent */}
        <div className={`flex items-center ${isMe ? "order-1" : "order-2"}`}>
          <div className={`transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"} mx-1`}>
            <div className="bg-white rounded-full shadow-sm border border-sky-100 px-1.5 py-0.5 cursor-pointer">
              <ReactionPicker messageId={message._id} />
            </div>
          </div>
        </div>
        
        <div className={`max-w-[65%] ${isMe ? "order-2" : "order-1"}`}>
          <div
            className={`px-4 py-2 rounded-2xl shadow-sm ${
              isMe
                ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-br-sm"
                : "bg-white border border-sky-200 text-slate-800 rounded-bl-sm"
            }`}
          >
            <div>
              {message.media && message.media.length > 0 && (
                <div className={`flex flex-col gap-2 ${message.text ? "mb-2" : ""}`}>
                  {message.media.map((m, i) => (
                    <div key={i}>{renderMedia(m, () => setSelectedMedia(m))}</div>
                  ))}
                </div>
              )}
              
              {message.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>}
            </div>
            
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className={`text-[10px] ${isMe ? "text-sky-100" : "text-slate-400"}`}>{formatTime(message.createdAt)}</span>
              {isMe && (
                <>
                  {message.seenBy && message.seenBy.length > 0 ? (
                    <CheckCheck className="w-3 h-3 text-sky-100" />
                  ) : (
                    <Check className="w-3 h-3 text-sky-200" />
                  )}
                </>
              )}
            </div>
          </div>

          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions reactions={message.reactions} messageId={message._id} />
          )}
        </div>
      </div>

      <MediaModal media={selectedMedia} onClose={() => setSelectedMedia(null)} />
    </>
  );
};