export type AuthSession = {
  email: string
  accessToken: string
}

/** Linha de histórico em `GET /auth/me` (mesmo formato que `GET /messages/`). */
export type AuthMeMessageRow = {
  conversation_id: string
  role: string
  content: string
  created_at: string
}

export type AuthMeResponse = {
  id: string
  email: string
  created_at: string
  messages: AuthMeMessageRow[]
}
