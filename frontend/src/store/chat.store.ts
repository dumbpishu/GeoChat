import { create } from "zustand";
import type { Message, TypingUser } from "@/types/chat";

export type { Message, TypingUser };

type ChatState = {
  messages: Message[];
  roomId: string | null;
  typingUsers: TypingUser[];
  isTyping: boolean;
  hasMore: boolean;
  nextCursor: string | null;
  loading: boolean;
  sendingMessage: boolean;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  prependMessages: (messages: Message[]) => void;
  updateReaction: (data: {
    messageId: string;
    reactions: Message["reactions"];
  }) => void;
  setRoomId: (roomId: string | null) => void;
  setTypingUsers: (users: TypingUser[]) => void;
  setIsTyping: (isTyping: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setNextCursor: (cursor: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSendingMessage: (sending: boolean) => void;
  clearChat: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  roomId: null,
  typingUsers: [],
  isTyping: false,
  hasMore: true,
  nextCursor: null,
  loading: false,
  sendingMessage: false,

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      const exists = state.messages.some((m) => m._id === message._id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    }),

  prependMessages: (messages) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m._id));
      const newMessages = messages.filter((m) => !existingIds.has(m._id));
      return { messages: [...newMessages, ...state.messages] };
    }),

  updateReaction: (data) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === data.messageId
          ? { ...m, reactions: data.reactions }
          : m
      ),
    })),

  setRoomId: (roomId) => set({ roomId }),

  setTypingUsers: (users) => set({ typingUsers: users }),

  setIsTyping: (isTyping) => set({ isTyping }),

  setHasMore: (hasMore) => set({ hasMore }),

  setNextCursor: (cursor) => set({ nextCursor: cursor }),

  setLoading: (loading) => set({ loading }),

  setSendingMessage: (sending) => set({ sendingMessage: sending }),

  clearChat: () =>
    set({
      messages: [],
      roomId: null,
      typingUsers: [],
      isTyping: false,
      hasMore: true,
      nextCursor: null,
    }),
}));