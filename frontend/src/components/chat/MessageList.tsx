import { useRef, useCallback, useEffect } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useChatStore } from "@/store/chat.store";
import { useUserStore } from "@/store/user.store";
import { socketService } from "@/services/socket.service";
import { MessageBubble } from "./MessageBubble";

export const MessageList = () => {
  const { messages, pagination } = useChatStore();
  const user = useUserStore((state) => state.user);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

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

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScrollBottom = () => {
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (scrollBottom < 100) {
        const visibleMessages = messages.filter((msg) => {
          if (msg.isSender === true) return false;
          if (seenMessageIdsRef.current.has(msg._id)) return false;
          return true;
        });
        
        visibleMessages.forEach((msg) => {
          socketService.markMessageSeen(msg._id);
          seenMessageIdsRef.current.add(msg._id);
        });
      }
    };

    container.addEventListener("scroll", handleScrollBottom);
    return () => container.removeEventListener("scroll", handleScrollBottom);
  }, [messages]);

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-sky-300 scrollbar-track-transparent"
    >
      {pagination.loading && (
        <div className="flex justify-center py-3">
          <Loader2 className="w-5 h-5 text-sky-500 animate-spin" />
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <div className="w-20 rounded-2xl bg-sky-100 flex items-center justify-center mb-5 border border-sky-200">
            <MapPin className="w-9 h-9 text-sky-500" />
          </div>
          <p className="text-slate-600 text-lg font-medium">No messages yet</p>
          <p className="text-slate-500 text-sm mt-1">Be the first to say hello!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} />
        ))
      )}
    </div>
  );
};