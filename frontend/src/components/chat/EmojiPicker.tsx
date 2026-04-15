import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ALL_EMOJIS = [
  "👍", "👎", "❤️", "🔥", "👏", "🎉", "✅", "❌",
  "😂", "🤣", "😊", "😍", "🥰", "😘", "🤩", "😎", "🥳", "😁", "😄", "😅",
  "😢", "😭", "😔", "😞", "😡", "😤", "😰", "😱", "🤯", "🥺",
  "🤔", "🙄", "😴", "🤤", "😷", "🤒", "🤕",
  "🙏", "👌", "💪", "👀", "👋", "🤝", "✌️", "🤞", "🤙", "👈", "👉", "👆", "👇",
  "💕", "💖", "💗", "💓", "💞", "💘", "💝", "💟", "♥️", "💔",
  "💯", "✨", "⚡", "🚀", "💥", "💫", "💦", "💨", "🎵", "🎶", "💬", "💭",
  "🌸", "🌹", "🌺", "🌻", "🌼", "🌟", "⭐", "🌙", "☀️", "🌈",
  "🍕", "🍔", "🍟", "🌮", "🍣", "🍩", "🍪", "🍰", "🧁", "☕",
  "👑", "💎", "🎁", "🎀", "🔗", "📸", "📱", "💻", "⌚", "🎮"
];

type EmojiPickerProps = {
  onSelect: (emoji: string) => void;
  onClose: () => void;
};

export const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="font-semibold text-slate-800">React to message</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        {/* Emoji Grid */}
        <div className="p-3 max-h-80 overflow-y-auto">
          <div className="grid grid-cols-8 gap-1">
            {ALL_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onSelect(emoji)}
                className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-lg text-2xl transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

type ReactionBadgeProps = {
  emoji: string;
  users: Array<{ _id: string; name: string; username: string }>;
  isOwn: boolean;
  onClick: () => void;
};

export const ReactionBadge = ({ emoji, users, isOwn, onClick }: ReactionBadgeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border",
          isOwn 
            ? "bg-sky-400/30 border-sky-300/50 text-white hover:bg-sky-400/50" 
            : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
        )}
      >
        <span className="text-lg">{emoji}</span>
      </button>

      {showTooltip && users.length > 0 && (
        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs rounded-lg py-1.5 px-2.5 shadow-xl z-50 whitespace-nowrap">
          {users.map(u => u.name || u.username).join(", ")}
        </div>
      )}
    </div>
  );
};

type ReactionUsersModalProps = {
  emoji: string;
  users: Array<{ _id: string; name: string; username: string; avatar?: string }>;
  onClose: () => void;
};

export const ReactionUsersModal = ({ emoji, users, onClose }: ReactionUsersModalProps) => {
  const getInitials = (name: string, username: string) => {
    const text = name || username || "";
    return text.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emoji}</span>
            <span className="font-semibold text-slate-800">{users.length} reaction{users.length > 1 ? "s" : ""}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        
        <div className="p-2 max-h-80 overflow-y-auto">
          {users.map((user) => {
            const displayName = user.name || user.username || "Unknown";
            return (
              <div key={user._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                {user.avatar ? (
                  <img src={user.avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-medium">
                    {getInitials(user.name, user.username)}
                  </div>
                )}
                <div>
                  <p className="font-medium text-slate-800">{displayName}</p>
                  {user.name && user.username && (
                    <p className="text-sm text-slate-500">@{user.username}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};