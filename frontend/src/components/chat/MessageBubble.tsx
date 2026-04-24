import { useState } from "react";
import { useUserStore } from "@/store/user.store";
import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";
import { SmilePlus, Check, Reply } from "lucide-react";
import { EmojiPicker, ReactionBadge, ReactionUsersModal } from "./EmojiPicker";
import { MediaModal } from "./MediaModal";

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getInitials = (username: string) => {
  const text = username || "User";
  return text.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const renderTextWithMentions = (text: string) => {
  if (!text) return <span>{text}</span>;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  const regex = /@[^\s]+/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="font-semibold">
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span>{parts}</span>;
};

type MessageBubbleProps = {
  message: Message;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
};

export const MessageBubble = ({ message, onReact, onReply }: MessageBubbleProps) => {
  const user = useUserStore((state) => state.user);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionUsers, setShowReactionUsers] = useState(false);
  const [selectedReactionEmoji, setSelectedReactionEmoji] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);

  const isOwn = message.senderId._id === user?.id;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
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
      {!isOwn && (
        message.senderId.avatar ? (
          <img
            src={message.senderId.avatar}
            alt={message.senderId.name}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-1">
            {getInitials(message.senderId.username)}
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
        
        {/* Reply + Message merged as one */}
        <div className={cn(
          "rounded-2xl overflow-hidden",
          isOwn ? "bg-sky-500" : "bg-white border border-slate-200",
          message.replyTo && (isOwn ? "rounded-tr-sm" : "rounded-tl-sm")
        )}>
          {/* Reply part - no extra padding */}
          {message.replyTo && (
            <div className={cn(
              "px-4 py-1.5",
              isOwn ? "bg-sky-600" : "bg-slate-100 border-b border-black/10"
            )}>
              <p className="text-base truncate" style={{ color: isOwn ? "#bfdbfe" : "#475569" }}>
                {message.replyTo.text || "[Media]"}
              </p>
            </div>
          )}
          
          {/* Your message part */}
          <div className={cn("px-4 py-1.5", isOwn ? "text-white" : "text-slate-800")}>
            {message.text && (
              <p className="text-base whitespace-pre-wrap leading-relaxed">
                {renderTextWithMentions(message.text)}
              </p>
            )}
            
            {message.media && message.media.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.media.map((m, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden cursor-pointer" onClick={() => openMediaModal(idx)}>
                    {m.type === "image" && (
                      <img src={m.url} alt="attachment" className="max-w-[180px] rounded-lg object-cover hover:opacity-90" />
                    )}
                    {m.type === "video" && (
                      <video src={m.url} className="max-w-[180px] rounded-lg object-cover" muted />
                    )}
                    {(m.type === "audio" || m.type === "file") && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg w-[180px]">
                        <span className="text-xs capitalize">{m.type}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Time */}
            <div className={cn("flex items-center justify-end gap-1")}>
              <span className={cn("text-[11px]", isOwn ? "text-sky-100" : "text-slate-400")}>
                {formatTime(message.createdAt)}
              </span>
              {isOwn && message.isSender && (
                <Check className={cn("w-3.5 h-3.5", isOwn ? "text-sky-200" : "text-slate-400")} />
              )}
            </div>
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
          
          <div className={cn("flex items-center gap-0.5", isMobile ? "" : "opacity-0 group-hover:opacity-100 transition-opacity")}>
            {isMobile && (
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 rounded-full hover:bg-slate-100 bg-white shadow-sm border border-slate-200"
              >
                <SmilePlus className="w-4 h-4 text-slate-600" />
              </button>
            )}
            {!isMobile && (
              <>
                <button
                  onClick={() => setShowEmojiPicker(true)}
                  className="p-1.5 rounded-full hover:bg-slate-100"
                  title="Add reaction"
                >
                  <SmilePlus className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => onReply(message)}
                  className="p-1.5 rounded-full hover:bg-slate-100"
                  title="Reply"
                >
                  <Reply className="w-4 h-4 text-slate-500" />
                </button>
              </>
            )}
          </div>
        </div>

        {isMobile && showOptions && (
          <div className={cn(
            "absolute top-full mt-1 flex gap-1 p-1 bg-white rounded-xl shadow-lg border border-slate-200 z-30",
            isOwn ? "right-0" : "left-0"
          )}>
            <button
              onClick={() => { setShowEmojiPicker(true); setShowOptions(false); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-xs text-slate-600"
            >
              <SmilePlus className="w-4 h-4" />
              <span>React</span>
            </button>
            <div className="w-px bg-slate-200" />
            <button
              onClick={() => { onReply(message); setShowOptions(false); }}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-slate-100 text-xs text-slate-600"
            >
              <Reply className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
        )}
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