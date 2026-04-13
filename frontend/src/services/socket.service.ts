import { io, Socket } from "socket.io-client";
import { useChatStore } from "@/store/chat.store";

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private isInitialized = false;

  // store latest location
  private currentLocation: { lat: number; long: number } | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (this.isInitialized) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

    this.socket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket"], // force websocket (better for you)
      autoConnect: true,
    });

    this.setupEventListeners();
    this.isInitialized = true;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // connect
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);

      // send location after connect if we have it
      if (this.currentLocation) {
        console.log("Sending location after connect");
        this.updateLocation(
          this.currentLocation.lat,
          this.currentLocation.long
        );
      }
    });

    // connect error
    this.socket.on("connect_error", (err) => {
      console.error("Connect error:", err.message);
    });

    // disconnect
    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // server error
    this.socket.on("error", (error: string) => {
      console.error("Socket error:", error);
    });

    // online users count
    this.socket.on("online_users_count", (count: number) => {
      useChatStore.getState().setOnlineUsersCount(count);
    });

    // initial load of recent messages
    this.socket.on("recent_messages", (messages: any[]) => {
      console.log("Received recent messages:", messages.length);
      useChatStore.getState().setMessages(messages);
    });

    // new message
    this.socket.on("new_message", (message: any) => {
      console.log("New message received");
      useChatStore.getState().addMessage(message);
    });

    // pagination of older messages
    this.socket.on(
      "older_messages",
      (data: {
        messages: any[];
        hasMore: boolean;
        nextCursor: string | null;
      }) => {
        useChatStore.getState().addOlderMessages(data.messages);
        useChatStore.getState().setPagination({
          hasMore: data.hasMore,
          cursor: data.nextCursor,
          loading: false,
        });
      }
    );

    // typing indicators
    this.socket.on("user_typing", ({ userId }) => {
      useChatStore.getState().addTypingUser(userId);
    });

    this.socket.on("user_stop_typing", ({ userId }) => {
      useChatStore.getState().removeTypingUser(userId);
    });

    // reactions
    this.socket.on(
      "reaction_updated",
      (data: {
        messageId: string;
        userId: string;
        emoji: string;
        action: string;
      }) => {
        useChatStore.getState().updateReaction(data);
      }
    );
  }

  // update location (with debug)
  updateLocation(lat: number, long: number) {
    this.currentLocation = { lat, long };

    if (!this.socket?.connected) {
      console.log("Socket not connected yet, location saved");
      return;
    }

    console.log("Emitting location:", lat, long);
    this.socket.emit("update_location", { lat, long });
  }

  // send message (with debug)
  sendMessage(
    text: string,
    media?: { url: string; type: string }[],
    mentions?: string[]
  ) {
    if (!this.socket?.connected) {
      console.error("Cannot send message: socket not connected");
      return;
    }

    console.log("Sending message:", text);

    this.socket.emit("send_message", {
      text,
      media,
      mentions,
    });
  }

  toggleReaction(messageId: string, emoji: string) {
    this.socket?.emit("toggle_reaction", { messageId, emoji });
  }

  startTyping() {
    this.socket?.emit("typing_start");
  }

  stopTyping() {
    this.socket?.emit("typing_stop");
  }

  fetchOlderMessages(cursor?: string, limit = 20) {
    this.socket?.emit("fetch_older_messages", { cursor, limit });
  }

  markMessageSeen(messageId: string) {
    this.socket?.emit("message_seen", { messageId });
  }

  disconnect() {
    this.socket?.disconnect();
    this.isInitialized = false;
    this.currentLocation = null;
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = SocketService.getInstance();