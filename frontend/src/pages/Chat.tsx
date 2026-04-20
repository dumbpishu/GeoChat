import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { useLocationStore } from "@/store/location.store";
import { useChatStore } from "@/store/chat.store";
import { useSocket } from "@/hooks/useSocket";
import type { Message } from "@/types/chat";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Spinner } from "@/components/ui/Spinner";

export const Chat = () => {
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { logout, loading: authLoading } = useAuthStore();
  const user = useUserStore((state) => state.user);
  const { location, fetchLocation, loading: locationLoading } = useLocationStore();
  
  const { 
    typingUsers, 
    addMessage, 
    prependMessages, 
    setTypingUsers, 
    setIsTyping,
    setHasMore,
    setNextCursor,
    setLoading,
    hasMore,
    nextCursor,
    loading,
    sendingMessage
  } = useChatStore();

  const handleNewMessage = useCallback((message: Message) => {
    addMessage({ ...message, isSender: message.isSender || false });
  }, [addMessage]);

  const handleRecentMessages = useCallback((msgs: Message[]) => {
    const formatted = msgs.map(m => ({ ...m, isSender: m.senderId._id === user?.id }));
    useChatStore.getState().setMessages(formatted);
  }, [user?.id]);

  const handleOlderMessages = useCallback((msgs: Message[], more: boolean, cursor: string | null) => {
    const formatted = msgs.map(m => ({ ...m, isSender: m.senderId._id === user?.id }));
    prependMessages(formatted);
    setHasMore(more);
    setNextCursor(cursor);
    setLoading(false);
  }, [user?.id, prependMessages, setHasMore, setNextCursor, setLoading]);

  const handleTypingStatus = useCallback((data: { isTyping: boolean; users?: { userId: string; username: string }[] }) => {
    setIsTyping(data.isTyping);
    if (data.users) setTypingUsers(data.users);
  }, [setIsTyping, setTypingUsers]);

  const handleReactionUpdated = useCallback((data: { messageId: string; reactions: Message["reactions"] }) => {
    useChatStore.getState().updateReaction({
      messageId: data.messageId,
      reactions: data.reactions,
    });
  }, []);

  const handleForceLogout = useCallback((message: string) => {
    toast.error(message);
    logout();
    navigate("/");
  }, [logout, navigate]);

  const handleError = useCallback((error: string) => {
    toast.error(error);
  }, []);

  const handleMentionNotification = useCallback((data: { messageId: string; roomId: string; senderId: string; senderUsername?: string; text?: string }) => {
    const truncatedText = data.text && data.text.length > 50 ? data.text.slice(0, 50) + "..." : data.text || "a message";
    const senderUsername = data.senderUsername ? `${data.senderUsername} ` : "";
    toast(`${senderUsername}mentioned you in "${truncatedText}"`, {
      icon: "📢",
      duration: 5000,
    });
  }, []);

  const { emit, isConnected } = useSocket({
    onNewMessage: handleNewMessage,
    onRecentMessages: handleRecentMessages,
    onOlderMessages: handleOlderMessages,
    onTypingStatus: handleTypingStatus,
    onReactionUpdated: handleReactionUpdated,
    onForceLogout: handleForceLogout,
    onMentionNotification: handleMentionNotification,
    onError: handleError,
  });

  const handleSendMessage = useCallback((text: string, media?: Message["media"], mentions?: string[]) => {
    emit("send_message", { text, media, mentions });
  }, [emit]);

  const handleTypingStart = useCallback(() => emit("typing_start"), [emit]);
  const handleTypingStop = useCallback(() => emit("typing_stop"), [emit]);
  const handleReaction = useCallback((messageId: string, emoji: string) => emit("toggle_reaction", { messageId, emoji }), [emit]);
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && nextCursor && isConnected) {
      setLoading(true);
      emit("fetch_older_messages", { cursor: nextCursor });
    }
  }, [loading, hasMore, nextCursor, isConnected, emit, setLoading]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user && !location) fetchLocation();
  }, [user, location, fetchLocation]);

  useEffect(() => {
    if (location && isConnected) {
      emit("update_location", { lat: location.lat, long: location.long });
    }
  }, [location, isConnected, emit]);

  useEffect(() => {
    if (!location || !isConnected) return;
    intervalRef.current = setInterval(() => {
      emit("update_location", { lat: location.lat, long: location.long });
    }, 60000);
    return () => { 
      if (intervalRef.current) {
        clearInterval(intervalRef.current); 
      }
    };
  }, [location, isConnected, emit]);

  if (authLoading || !user || locationLoading) {
    return <Spinner className="bg-gradient-to-b from-sky-50 via-white to-sky-50" />;
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sky-100 shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <ChatHeader user={user!} isConnected={isConnected} location={location} />
        </div>
      </header>

      {/* Messages - scrollable */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 h-full overflow-y-auto">
          <MessageList onReact={handleReaction} onLoadMore={handleLoadMore} />
        </div>
      </main>

      {/* Input - fixed at bottom */}
      <footer className="shrink-0">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
          <MessageInput onSend={handleSendMessage} onTypingStart={handleTypingStart} onTypingStop={handleTypingStop} disabled={sendingMessage || !isConnected} />
        </div>
      </footer>
    </div>
  );
};