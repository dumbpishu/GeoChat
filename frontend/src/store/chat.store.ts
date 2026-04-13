import { create } from "zustand";

type Reaction = {
  userId: string;
  emoji: string;
};

type Media = {
  url: string;
  type: "image" | "video" | "audio" | "file";
};

type Message = {
  _id: string;
  roomId: string;
  senderId: string;
  text?: string;
  media?: Media[];
  mentions?: string[];
  reactions: Reaction[];
  createdAt: string;
  updatedAt: string;
  isSender?: boolean;
};

type PaginationState = {
  hasMore: boolean;
  cursor: string | null;
  loading: boolean;
};

type ChatState = {
  messages: Message[];
  onlineUsersCount: number;
  typingUsers: string[];
  pagination: PaginationState;

  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addOlderMessages: (messages: Message[]) => void;
  setOnlineUsersCount: (count: number) => void;
  addTypingUser: (userId: string) => void;
  removeTypingUser: (userId: string) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  updateReaction: (data: { messageId: string; userId: string; emoji: string; action: string }) => void;
  clearChat: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  onlineUsersCount: 0,
  typingUsers: [],
  pagination: {
    hasMore: true,
    cursor: null,
    loading: false,
  },

  setMessages: (messages) => {
    const uniqueMessages = messages.filter(
      (msg, index, self) => index === self.findIndex((m) => m._id === msg._id)
    );
    set({ messages: uniqueMessages });
  },

  addMessage: (message) =>
    set((state) => {
      if (state.messages.some((m) => m._id === message._id)) {
        return state;
      }
      return { messages: [...state.messages, message] };
    }),

  addOlderMessages: (olderMessages) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((m) => m._id));
      const newMessages = olderMessages.filter((m) => !existingIds.has(m._id));
      return { messages: [...newMessages, ...state.messages] };
    }),

  setOnlineUsersCount: (count) => set({ onlineUsersCount: count }),

  addTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.includes(userId)
        ? state.typingUsers
        : [...state.typingUsers, userId],
    })),

  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((id) => id !== userId),
    })),

  setPagination: (pagination) =>
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    })),

  updateReaction: ({ messageId, userId, emoji, action }) =>
    set((state) => ({
      messages: state.messages.map((msg) => {
        if (msg._id !== messageId) return msg;

        const existingReactionIndex = msg.reactions.findIndex(
          (r) => r.userId === userId
        );

        if (action === "removed") {
          return {
            ...msg,
            reactions: msg.reactions.filter((r) => r.userId !== userId),
          };
        }

        if (action === "updated") {
          const newReactions = [...msg.reactions];
          if (existingReactionIndex !== -1) {
            newReactions[existingReactionIndex] = { userId, emoji };
          }
          return { ...msg, reactions: newReactions };
        }

        if (action === "added") {
          if (existingReactionIndex === -1) {
            return {
              ...msg,
              reactions: [...msg.reactions, { userId, emoji }],
            };
          }
          return msg;
        }

        return msg;
      }),
    })),

  clearChat: () =>
    set({
      messages: [],
      onlineUsersCount: 0,
      typingUsers: [],
      pagination: {
        hasMore: true,
        cursor: null,
        loading: false,
      },
    }),
}));