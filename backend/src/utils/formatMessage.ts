import mongoose from "mongoose";

type IUser = {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  avatar?: { url?: string } | null;
};

type FormattedSender = {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
};

type PopulatedReaction = {
  emoji: string;
  userId: IUser;
};

export const formatReactions = (reactions: PopulatedReaction[]) => {
  const grouped: Record<string, { _id: string; name: string; username: string; avatar: string | null }[]> = {};

  for (const r of reactions) {
    if (!r.emoji || !r.userId) continue;
    
    const userId = r.userId._id?.toString?.() || r.userId._id?.toString() || "";
    const userName = r.userId.name || "";
    const userUsername = r.userId.username || "";
    const avatarObj = r.userId.avatar as { url?: string } | null | undefined;
    const userAvatar = avatarObj?.url || (r.userId.avatar as string) || null;

    if (!grouped[r.emoji]) grouped[r.emoji] = [];
    grouped[r.emoji].push({
      _id: userId,
      name: userName,
      username: userUsername,
      avatar: userAvatar,
    });
  }

  return grouped;
};

export const formatMessage = (msg: any) => {
  const reactions = (msg.reactions || []) as PopulatedReaction[];

  const senderObj = msg.senderId;
  const formattedSender: FormattedSender = {
    _id: senderObj?._id?.toString?.() || senderObj?._id || "",
    name: senderObj?.name || "",
    username: senderObj?.username || "",
    avatar: senderObj?.avatar?.url || senderObj?.avatar || undefined,
  };

  return {
    _id: msg._id,
    roomId: msg.roomId,
    senderId: formattedSender,
    text: msg.text,
    media: msg.media,
    mentions: msg.mentions,
    reactions: formatReactions(reactions),
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  };
};