import { useState, useCallback } from "react";
import { searchMentionsApi, type MentionUser } from "@/api/user.api";

export const useMentions = () => {
  const [mentions, setMentions] = useState<MentionUser[]>([]);
  const [loading, setLoading] = useState(false);

  const searchUsers = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setMentions([]);
      return;
    }

    setLoading(true);
    try {
      const users = await searchMentionsApi(query);
      setMentions(users);
    } catch (error) {
      console.error("Error searching mentions:", error);
      setMentions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearMentions = useCallback(() => {
    setMentions([]);
  }, []);

  return { mentions, loading, searchUsers, clearMentions };
};