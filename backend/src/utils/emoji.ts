export const ALLOWED_EMOJIS = [
  "👍",
  "❤️",
  "😂",
  "🔥",
  "😮",
  "😢",
  "👏",
  "🎉"
];

export const isValidEmoji = (emoji: string) => {
  return ALLOWED_EMOJIS.includes(emoji);
};