export interface Message {
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
  seenBy?: string[];
}

export interface Media {
  url: string;
  type: "image" | "video" | "audio" | "file";
}

export interface Reaction {
  userId: string;
  emoji: string;
}