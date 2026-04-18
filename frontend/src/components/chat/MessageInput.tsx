import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Send, Paperclip, X, Loader2 } from "lucide-react";
import { useMentions } from "@/hooks/useMentions";
import { uploadChatMediaApi } from "@/api/chat.api";

type MentionUser = {
  id: string;
  name: string;
  username: string;
  avatar?: string;
};

type MediaFile = {
  url: string;
  type: "image" | "video" | "audio" | "file";
  file?: File;
};

type SelectedMention = {
  id: string;
  username: string;
  start: number;
  end: number;
};

type UploadedMedia = {
  url: string;
  type: "image" | "video" | "audio" | "file";
};

type MessageInputProps = {
  onSend: (text: string, media?: UploadedMedia[], mentions?: string[]) => void | Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
};

export const MessageInput = ({ 
  onSend, 
  onTypingStart, 
  onTypingStop,
  disabled 
}: MessageInputProps) => {
  const [text, setText] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [selectedMentions, setSelectedMentions] = useState<SelectedMention[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mentionsDropdownRef = useRef<HTMLDivElement>(null);
  
  const { mentions, loading: mentionsLoading, searchUsers, clearMentions } = useMentions();

  const handleTyping = () => {
    onTypingStart();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTypingStop(), 2000);
  };

  const checkForMention = useCallback((value: string) => {
    const cursorPos = inputRef.current?.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setShowMentions(true);
      searchUsers(query);
    } else {
      setShowMentions(false);
      clearMentions();
    }
  }, [searchUsers, clearMentions]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setText(value);
    checkForMention(value);
    if (value.trim()) handleTyping();
  };

  const insertMention = (user: MentionUser) => {
    const cursorPos = inputRef.current?.selectionStart || text.length;
    const textBeforeCursor = text.slice(0, cursorPos);
    const mentionStart = textBeforeCursor.lastIndexOf("@");
    const newText = text.slice(0, mentionStart) + "@" + user.username + " " + text.slice(cursorPos);
    
    setText(newText);
    setSelectedMentions([...selectedMentions, { id: user.id, username: user.username, start: mentionStart, end: mentionStart + user.username.length + 1 }]);
    setShowMentions(false);
    clearMentions();
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    if (!text.trim() && media.length === 0) return;
    if (disabled || sending) return;
    
    setSending(true);
    try {
      let uploadedMedia = undefined;
      
      if (media.length > 0) {
        const filesToUpload = media.map(m => m.file).filter(Boolean) as File[];
        uploadedMedia = await uploadChatMediaApi(filesToUpload);
      }
      
      const mentionIds = selectedMentions.map(m => m.id);
      await onSend(text.trim(), uploadedMedia, mentionIds.length > 0 ? mentionIds : undefined);
      setText("");
      setMedia([]);
      setSelectedMentions([]);
      setShowMentions(false);
      clearMentions();
      onTypingStop();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: MediaFile[] = Array.from(files).slice(0, 5 - media.length).map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "file",
      file,
    }));

    setMedia((prev) => [...prev, ...newMedia].slice(0, 5));
    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mentionsDropdownRef.current && !mentionsDropdownRef.current.contains(e.target as Node)) {
        setShowMentions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSend = (text.trim().length > 0 || media.length > 0) && !sending;
  const getInitials = (name: string, username: string) => {
    const text = name || username || "";
    return text.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-slate-50/50 px-4 py-4">
      {media.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {media.map((m, idx) => (
            <div key={idx} className="relative">
              {m.type === "image" && (
                <img src={m.url} alt="" className="w-14 h-14 rounded-lg object-cover" />
              )}
              <button
                onClick={() => removeMedia(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => imageInputRef.current?.click()}
          className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors h-12 w-12 flex items-center justify-center"
          type="button"
          title="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className="flex-1 relative">
          <input
            ref={inputRef as any}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={disabled}
            className="w-full px-5 py-3 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-sky-200 focus:ring-0 text-base shadow-sm h-12"
          />
          
          {showMentions && (
            <div 
              ref={mentionsDropdownRef}
              className="absolute bottom-full mb-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto z-50"
            >
              {mentionsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
                </div>
              ) : mentions.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-sm">
                  {mentionQuery ? `No users found for "@${mentionQuery}"` : "Type to search users..."}
                </div>
              ) : (
                <div className="p-2">
                  {mentions.map((user) => {
                    const displayName = user.name || user.username || "Unknown";
                    return (
                      <button
                        key={user.id}
                        onClick={() => insertMention(user)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 text-left"
                      >
                        {user.avatar ? (
                          <img src={user.avatar} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-xs font-medium">
                            {getInitials(user.name, user.username)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{displayName}</p>
                          {user.name && <p className="text-xs text-slate-500">@{user.username}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        
        <button
          onClick={handleSend}
          disabled={disabled || !canSend || sending}
          className={cn(
            "p-2.5 rounded-full transition-all shrink-0 h-12 w-12 flex items-center justify-center",
            canSend && !disabled && !sending
              ? "bg-sky-500 text-white hover:bg-sky-600 shadow-md shadow-sky-500/20"
              : "bg-slate-100 text-slate-300",
            (disabled || sending) && "opacity-50"
          )}
          type="button"
        >
          {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};