import { useState } from "react";
import { Paperclip } from "lucide-react";
import { useUserStore } from "@/store/user.store";
import type { Message } from "@/types/chat.types";
import { ReactionPicker, MessageReactions } from "./ReactionPicker";

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const renderMedia = (media: { url: string; type: string }) => {
  switch (media.type) {
    case "image":
      return (
        <img
          src={media.url}
          alt="Media"
          className="max-w-[240px] max-h-[200px] rounded-xl object-cover shadow-lg"
        />
      );
    case "video":
      return (
        <video
          src={media.url}
          controls
          className="max-w-[240px] max-h-[200px] rounded-xl shadow-lg"
        />
      );
    case "audio":
      return (
        <audio src={media.url} controls className="w-full max-w-[240px] h-10" />
      );
    default:
      return (
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
        >
          <Paperclip className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-300">File</span>
        </a>
      );
  }
};

export const MessageBubble = ({ message }: { message: Message }) => {
  const [isHovered, setIsHovered] = useState(false);
  const user = useUserStore((state) => state.user);
  const isMe = message.senderId === user?.id;

  return (
    <div
      className={`flex ${isMe ? "justify-end" : "justify-start"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-[65%] ${isMe ? "order-2" : "order-1"}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isMe
              ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-br-sm"
              : "bg-slate-800/60 text-slate-100 rounded-bl-sm border border-slate-700/50"
          }`}
        >
          {message.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>}
          
          {message.media && message.media.length > 0 && (
            <div className={`flex flex-wrap gap-2 mt-2 ${message.text ? "mt-2" : ""}`}>
              {message.media.map((m, i) => (
                <div key={i}>{renderMedia(m)}</div>
              ))}
            </div>
          )}
        </div>

        {message.reactions && message.reactions.length > 0 && (
          <MessageReactions reactions={message.reactions} messageId={message._id} />
        )}

        <div className={`flex items-center gap-2 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
          <span className="text-[11px] text-slate-500">{formatTime(message.createdAt)}</span>
          <div className={`transition-opacity duration-200 ${isHovered || isMe ? "opacity-100" : "opacity-0"}`}>
            <ReactionPicker messageId={message._id} />
          </div>
        </div>
      </div>
    </div>
  );
};