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
import { Loader2 } from "lucide-react";

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

  const handleMentionNotification = useCallback((data: { messageId: string; roomId: string; senderId: string; text?: string }) => {
    // SocketId-based - only sent to mentioned user
    const displayText = data.text ? `"${data.text.slice(0, 30)}${data.text.length > 30 ? '...' : ''}"` : "message";
    toast(`You were mentioned in ${displayText}`, {
      icon: "🔔",
      duration: 4000,
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
      console.log("📍 update_location sent (initial)", { lat: location.lat, long: location.long });
      emit("update_location", { lat: location.lat, long: location.long });
    }
  }, [location, isConnected, emit]);

  useEffect(() => {
    if (!location || !isConnected) return;
    console.log("📍 Setting up location interval (60 seconds)");
    intervalRef.current = setInterval(() => {
      console.log("📍 update_location sent (interval)", { lat: location.lat, long: location.long });
      emit("update_location", { lat: location.lat, long: location.long });
    }, 60000);
    return () => { 
      if (intervalRef.current) {
        console.log("📍 Clearing location interval");
        clearInterval(intervalRef.current); 
      }
    };
  }, [location, isConnected, emit]);

  if (authLoading || !user || locationLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-sky-50 via-white to-sky-50">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-sky-50 via-white to-sky-50">
      {/* Header - compact */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50 px-4 py-2">
        <div className="flex items-center justify-between">
          <ChatHeader user={user!} isConnected={isConnected} location={location} />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        <MessageList onReact={handleReaction} onLoadMore={handleLoadMore} />
        {typingUsers.length > 0 && <TypingIndicator users={typingUsers} />}
        <MessageInput onSend={handleSendMessage} onTypingStart={handleTypingStart} onTypingStop={handleTypingStop} disabled={sendingMessage || !isConnected} />
      </main>
    </div>
  );
};