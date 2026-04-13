import mongoose from "mongoose";

type IUser = {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  avatar?: { url?: string };
};

type PopulatedReaction = {
  emoji: string;
  userId: IUser;
};

export const formatReactions = (reactions: PopulatedReaction[]) => {
  const grouped: Record<string, any[]> = {};

  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = [];

    grouped[r.emoji].push({
      _id: r.userId._id,
      name: r.userId.name,
      username: r.userId.username,
      avatar: r.userId.avatar?.url || null,
    });
  }

  return grouped;
};

export const formatMessage = (msg: any) => {
  const reactions = (msg.reactions || []) as PopulatedReaction[];

  return {
    _id: msg._id,
    roomId: msg.roomId,
    senderId: msg.senderId,
    text: msg.text,
    media: msg.media,
    mentions: msg.mentions,
    reactions: formatReactions(reactions),
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
  };
};