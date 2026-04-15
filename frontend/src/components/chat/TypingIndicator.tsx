import type { TypingUser } from "@/types/chat";

type TypingIndicatorProps = {
  users: TypingUser[];
};

export const TypingIndicator = ({ users }: TypingIndicatorProps) => {
  if (users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    }
    if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    }
    if (users.length > 2) {
      return `${users[0].username} and ${users.length - 1} others are typing`;
    }
    return "Someone is typing";
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <span className="text-xs text-slate-500">{getText()}</span>
    </div>
  );
};