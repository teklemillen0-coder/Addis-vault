export type ChatModerationReason = "violence" | "self_harm" | "hate_or_abuse";

const moderationRules: { reason: ChatModerationReason; pattern: RegExp }[] = [
  {
    reason: "self_harm",
    pattern: /\b(?:suicid(?:e|al)|self[-\s]?harm|kill myself|end my life|cut myself)\b/i,
  },
  {
    reason: "violence",
    pattern:
      /\b(?:kill(?:ing|ed)?|murder(?:ing|ed)?|shoot(?:ing|er)?|stab(?:bing|bed)?|bomb(?:ing|ed)?|attack(?:ing|ed)?|assault(?:ing|ed)?|beat(?:ing)?|hurt(?:ing)?|harm(?:ing)?|threat(?:en|ening|ened)?|rape|rapist|terroris[mt]|genocide)\b/i,
  },
  {
    reason: "hate_or_abuse",
    pattern:
      /\b(?:racis(?:t|m)|homophob(?:ic|ia)|supremacist|ethnic cleansing|slur|fuck(?:ing)?|shit|bitch|asshole|bastard|scam|fraud|hack|porn)\b/i,
  },
  {
    reason: "hate_or_abuse",
    pattern: /\b(?:hate|despise)\s+(?:you|them|those people|all\s+\w+\s+people)\b/i,
  },
];

export function getChatModerationReason(message: string): ChatModerationReason | null {
  const normalized = message.normalize("NFKC").replace(/\s+/g, " ").trim();
  return moderationRules.find(({ pattern }) => pattern.test(normalized))?.reason ?? null;
}
