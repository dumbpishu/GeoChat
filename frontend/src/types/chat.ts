export interface Message {
  _id: string;
  roomId: string;
  senderId: {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  text?: string;
  media?: Array<{
    url: string;
    type: "image" | "video" | "audio" | "file";
  }>;
  mentions?: Array<{
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  }>;
  reactions?: Record<string, Array<{
    _id: string;
    name: string;
    username: string;
    avatar?: string;
  }>>;
  createdAt: string;
  updatedAt?: string;
  isSender?: boolean;
}

export interface TypingUser {
  userId: string;
  username: string;
}