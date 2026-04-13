import { useRef, useCallback, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useChatStore } from "@/store/chat.store";
import { socketService } from "@/services/socket.service";
import { MessageBubble } from "./MessageBubble";

export const MessageList = () => {
  const { messages, pagination } = useChatStore();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (!pagination.hasMore || pagination.loading) return;

    if (container.scrollTop < 50) {
      useChatStore.getState().setPagination({ loading: true });
      socketService.fetchOlderMessages(pagination.cursor || undefined, 20);
    }
  }, [pagination.hasMore, pagination.loading, pagination.cursor]);

  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length]);

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
    >
      {pagination.loading && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="w-20 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-5 border border-slate-700/50">
            <MapPin className="w-9 h-9 text-slate-500" />
          </div>
          <p className="text-slate-400 text-lg font-medium">No messages yet</p>
          <p className="text-slate-600 text-sm mt-1">Be the first to say hello!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))
      )}
    </div>
  );
};