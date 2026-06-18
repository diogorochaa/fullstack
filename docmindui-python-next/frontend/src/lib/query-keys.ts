export const queryKeys = {
  health: ["health"] as const,
  me: (token: string) => ["auth", "me", token] as const,
  messages: (token: string) => ["messages", token] as const,
}
