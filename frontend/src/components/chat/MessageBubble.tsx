import { useState } from "react";
import { useUserStore } from "@/store/user.store";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { SmilePlus, Check } from "lucide-react";
import { EmojiPicker, ReactionBadge, ReactionUsersModal } from "./EmojiPicker";
import { MediaModal } from "./MediaModal";

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getInitials = (name: string, username: string) => {
  const text = name || username || "";
  return text.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const renderTextWithMentions = (text: string, mentions?: Message["mentions"]) => {
  if (!text || !mentions || mentions.length === 0) {
    return <span>{text}</span>;
  }

  const mentionUsernames = mentions.map((m) => m.username.toLowerCase());
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const regex = /@(\w+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [fullMatch, username] = match;
    const mentionIndex = mentionUsernames.indexOf(username.toLowerCase());

    if (mentionIndex !== -1) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <span key={match.index} className="font-semibold">
          {fullMatch}
        </span>
      );
      lastIndex = match.index + fullMatch.length;
    }
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span>{parts}</span>;
};

type MessageBubbleProps = {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
};

export const MessageBubble = ({ message, onReact }: MessageBubbleProps) => {
  const user = useUserStore((state) => state.user);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [selectedReactionEmoji, setSelectedReactionEmoji] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  
  const isOwn = message.senderId._id === user?.id;
  const hasReactions = message.reactions && typeof message.reactions === 'object' && Object.keys(message.reactions).length > 0;

  const openMediaModal = (idx: number) => {
    setMediaIndex(idx);
    setShowMediaModal(true);
  };

  const handleReactionClick = (emoji: string) => {
    setSelectedReactionEmoji(emoji);
    setShowReactionUsers(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    onReact(message._id, emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={cn("flex gap-2 px-6 py-0.5 group w-full", isOwn ? "justify-end" : "justify-start")}>
      {/* Avatar - shown only for others */}
      {!isOwn && (message.senderId?.avatar || message.senderId?.name || message.senderId?.username) && (
        message.senderId.avatar ? (
          <img
            src={message.senderId.avatar}
            alt={message.senderId.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-1">
            {getInitials(message.senderId.name || "", message.senderId.username)}
          </div>
        )
      )}
      
      <div className={cn("max-w-[55%] relative", isOwn ? "items-end" : "items-start")}>
        {/* Username - shown only for others */}
        {!isOwn && message.senderId?.username && (
          <p className="text-[11px] font-medium text-slate-500 mb-0.5 ml-1">
            {message.senderId.username}
          </p>
        )}
        
        {/* Message bubble - different styles for sender vs receiver */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5",
            isOwn 
              ? "bg-sky-500 text-white rounded-br-md" 
              : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
          )}
        >
          {message.text && (
            <p className="text-base whitespace-pre-wrap leading-relaxed">
              {renderTextWithMentions(message.text, message.mentions)}
            </p>
          )}
          
          {message.media && message.media.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.media.map((m, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden cursor-pointer" onClick={() => openMediaModal(idx)}>
                  {m.type === "image" && (
                    <img 
                      src={m.url} 
                      alt="attachment" 
                      className="max-w-[180px] rounded-lg object-cover hover:opacity-90"
                    />
                  )}
                  {m.type === "video" && (
                    <video 
                      src={m.url} 
                      className="max-w-[180px] rounded-lg object-cover"
                      muted
                    />
                  )}
                  {(m.type === "audio" || m.type === "file") && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg w-[180px]">
                      <span className="text-xs text-slate-500 capitalize">{m.type}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Time */}
          <div className={cn("flex items-center justify-end gap-1 mt-1")}>
            <span className={cn("text-[11px]", isOwn ? "text-sky-100" : "text-slate-400")}>
              {formatTime(message.createdAt)}
            </span>
            {isOwn && message.isSender && (
              <Check className={cn("w-3.5 h-3.5", isOwn ? "text-sky-200" : "text-slate-400")} />
            )}
          </div>
        </div>
        
        {/* Reactions row */}
        <div className={cn("flex items-center gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
          {hasReactions && message.reactions && (
            <div className="flex flex-wrap gap-1">
              {Object.entries(message.reactions).map(([emoji, users]) => {
                const userList = users as Array<{_id: string; name: string; username: string; avatar?: string}>;
                return (
                  <ReactionBadge
                    key={emoji}
                    emoji={emoji}
                    users={userList}
                    isOwn={isOwn}
                    onClick={() => handleReactionClick(emoji)}
                  />
                );
              })}
            </div>
          )}
          
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-slate-100"
          >
            <SmilePlus className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Modals */}
      {showEmojiPicker && (
        <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
      )}
      
      {showReactionUsers && message.reactions && selectedReactionEmoji && message.reactions[selectedReactionEmoji] && (
        <ReactionUsersModal
          emoji={selectedReactionEmoji}
          users={message.reactions[selectedReactionEmoji] as Array<{_id: string; name: string; username: string; avatar?: string}>}
          onClose={() => setShowReactionUsers(false)}
        />
      )}

      {showMediaModal && message.media && (
        <MediaModal 
          media={message.media} 
          initialIndex={mediaIndex}
          onClose={() => setShowMediaModal(false)} 
        />
      )}
    </div>
  );
};