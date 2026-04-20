import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/store/user.store";
import { useLocationStore } from "@/store/location.store";
import type { Message, TypingUser } from "@/types/chat";

export type { Message, TypingUser };

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";
const DEBUG = import.meta.env.DEBUG === "true";
console.log(DEBUG)

type SocketCallbacks = {
  onNewMessage?: (message: Message) => void;
  onRecentMessages?: (messages: Message[]) => void;
  onOlderMessages?: (messages: Message[], hasMore: boolean, nextCursor: string | null) => void;
  onTypingStatus?: (data: { isTyping: boolean; users?: TypingUser[] }) => void;
  onReactionUpdated?: (data: {
    messageId: string;
    reactions: Message["reactions"];
    reactionsCount: number;
    action: "added" | "removed";
  }) => void;
  onMentionNotification?: (data: {
    messageId: string;
    roomId: string;
    senderId: string;
    senderUsername?: string;
    text?: string;
  }) => void;
  onUserJoinedRoom?: (data: { user: { _id: string; name: string; username: string; avatar?: string }; roomId: string }) => void;
  onUserLeftRoom?: (data: { userId: string; username?: string; roomId: string }) => void;
  onError?: (error: string) => void;
};

let globalSocket: Socket | null = null;
let lastUserId: string | null = null;

export const disconnectSocket = () => {
  if (globalSocket) {
    console.log("[Socket] Disconnecting socket...");
    globalSocket.disconnect();
    globalSocket = null;
    lastUserId = null;
    console.log("[Socket] Disconnected!");
  }
};

export const useSocket = (callbacks: SocketCallbacks) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const user = useUserStore((state) => state.user);
  const location = useLocationStore((state) => state.location);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const connect = useCallback(() => {
    if (!user) {
      if (DEBUG) console.log("[Socket] No user logged in");
      return;
    }

    const userId = user?.id;
    const userChanged = userId !== lastUserId;

    if (globalSocket?.connected && !userChanged) {
      if (DEBUG) console.log("[Socket] Reusing existing connection");
      socketRef.current = globalSocket;
      setIsConnected(true);
      return;
    }

    if (userChanged && globalSocket) {
      if (DEBUG) console.log("[Socket] User changed, disconnecting old socket");
      globalSocket.disconnect();
      globalSocket = null;
    }

    lastUserId = userId;

    if (DEBUG) console.log("[Socket] Connecting to:", SOCKET_URL);

    // Don't pass token - browser will send httpOnly cookie automatically
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      withCredentials: true,
      forceNew: true,
    });

    globalSocket = socket;
    socketRef.current = socket;

    socket.on("connect", () => {
      if (DEBUG) console.log("[Socket] Connected! ID:", socket.id);
      setIsConnected(true);

      const loc = useLocationStore.getState().location;
      if (loc) {
        if (DEBUG) console.log("[Socket] Sending location:", loc);
        socket.emit("update_location", { lat: loc.lat, long: loc.long });
      }
    });

    socket.on("disconnect", () => {
      if (DEBUG) console.log("[Socket] Disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err) => {
      if (DEBUG) console.error("[Socket] Connection error:", err.message);
      setIsConnected(false);
    });

    socket.on("new_message", (msg) => callbacksRef.current.onNewMessage?.(msg));
    socket.on("recent_messages", (msgs) => callbacksRef.current.onRecentMessages?.(msgs));
    socket.on("older_messages", (data) => callbacksRef.current.onOlderMessages?.(data.messages, data.hasMore, data.nextCursor));
    socket.on("typing_status", (data) => callbacksRef.current.onTypingStatus?.(data));
    socket.on("reaction_updated", (data) => callbacksRef.current.onReactionUpdated?.(data));
    socket.on("mention_notification", (data) => callbacksRef.current.onMentionNotification?.(data));
    socket.on("user_joined_room", (data) => callbacksRef.current.onUserJoinedRoom?.(data));
    socket.on("user_left_room", (data) => callbacksRef.current.onUserLeftRoom?.(data));
    socket.on("error", (err) => callbacksRef.current.onError?.(err));
  }, [user, location]);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (isConnected && location && socketRef.current?.connected) {
      socketRef.current.emit("update_location", { lat: location.lat, long: location.long });
    }
  }, [location, isConnected]);

  const emit = useCallback(<T>(event: string, data?: T) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return { emit, isConnected };
};