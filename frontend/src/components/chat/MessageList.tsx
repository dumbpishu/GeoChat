import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat.store";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";

type MessageListProps = {
  onReact: (messageId: string, emoji: string) => void;
  onLoadMore: () => void;
};

export const MessageList = ({ onReact, onLoadMore }: MessageListProps) => {
  const { messages, loading, hasMore } = useChatStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    prevMessagesLengthRef.current = messages.length;
    
    if (isNewMessage) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, []);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop } = containerRef.current;
    if (scrollTop < 50 && hasMore && !loading) {
      onLoadMore();
    }
  };

  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-slate-700 mb-3">No messages yet</h3>
        <p className="text-[15px] text-slate-500 text-center max-w-[300px]">
          Be the first to say hello to people near you!
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto py-4"
      onScroll={handleScroll}
    >
      <div className="flex flex-col">
        {loading && hasMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
          </div>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            onReact={onReact}
          />
        ))}
      </div>
    </div>
  );
};